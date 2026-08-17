import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AiProvider } from "./ai-provider";
import type { AuthContext } from "../auth/auth.types";
import type {
  SearchClientsInput,
  SearchPropertiesInput,
  AiConversationDto,
  AiMessageDto,
} from "@sena/shared";
import { AiToolName } from "@sena/shared";

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AiProvider
  ) {}

  async startConversation(auth: AuthContext, title: string): Promise<AiConversationDto> {
    return this.prisma.aiConversation.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        title,
        provider: "claude",
        status: "ACTIVE",
      },
    });
  }

  async sendMessage(
    auth: AuthContext,
    conversationId: string,
    message: string
  ): Promise<{ conversation: AiConversationDto; messages: AiMessageDto[] }> {
    // Verificar propriedade da conversa
    const conv = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || conv.tenantId !== auth.tenantId) {
      throw new ForbiddenException("Acesso negado à conversa");
    }

    // Salvar mensagem do usuário
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: "user",
        content: message,
      },
    });

    // Recuperar histórico
    const messages = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    // Preparar mensagens para o provider
    const aiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    // Gerar resposta
    const tools = this.getToolDefinitions();
    const result = await this.aiProvider.generate({
      model: "claude-3-5-sonnet-20241022",
      messages: aiMessages,
      tools,
      maxTokens: 1024,
    });

    // Processar tool calls
    for (const block of result.content) {
      if (block.type === "tool_use") {
        const toolResult = await this.executeTool(auth, block.name as AiToolName, block.input);

        // Salvar chamada da ferramenta
        await this.prisma.aiMessage.create({
          data: {
            conversationId,
            role: "assistant",
            content: block.input.toString(),
            toolName: block.name as AiToolName,
            toolInput: block.input,
            toolOutput: toolResult,
          },
        });
      } else if (block.type === "text") {
        // Salvar resposta de texto
        await this.prisma.aiMessage.create({
          data: {
            conversationId,
            role: "assistant",
            content: block.text,
          },
        });
      }
    }

    // Registrar consumo
    await this.prisma.aiConsumption.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        provider: "claude",
        model: "claude-3-5-sonnet-20241022",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        cost: ((result.inputTokens * 0.003 + result.outputTokens * 0.015) / 1000000) * 100,
      },
    });

    // Atualizar contagem de mensagens
    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { messagesCount: { increment: 2 } },
    });

    // Retornar conversa atualizada e mensagens
    const updatedConv = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
    });

    const updatedMessages = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return {
      conversation: this.mapConversationDto(updatedConv!),
      messages: updatedMessages.map((m) => this.mapMessageDto(m)),
    };
  }

  private getToolDefinitions() {
    return [
      {
        name: "searchClients",
        description: "Pesquisar clientes por nome ou documento",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Nome, telefone ou email do cliente" },
            limit: { type: "number", description: "Limite de resultados (padrão 10)" },
          },
          required: ["query"],
        },
      },
      {
        name: "searchProperties",
        description: "Pesquisar imóveis disponíveis",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Localização ou referência" },
            type: { type: "string", description: "Tipo de imóvel" },
            status: { type: "string", description: "Status do imóvel" },
            minPrice: { type: "number" },
            maxPrice: { type: "number" },
            limit: { type: "number" },
          },
        },
      },
      {
        name: "findMatchingProperties",
        description: "Encontrar imóveis compatíveis com interesse do cliente",
        input_schema: {
          type: "object",
          properties: {
            clientId: { type: "string", description: "ID do cliente" },
            limit: { type: "number" },
          },
          required: ["clientId"],
        },
      },
      {
        name: "getBrokerPerformance",
        description: "Desempenho de corretor (vendas, comissões)",
        input_schema: {
          type: "object",
          properties: {
            brokerId: { type: "string", description: "ID do corretor (opcional)" },
            period: { type: "string", enum: ["month", "quarter", "year"] },
          },
        },
      },
      {
        name: "getOverdueRentals",
        description: "Aluguéis vencidos pendentes",
        input_schema: {
          type: "object",
          properties: {
            limit: { type: "number" },
          },
        },
      },
      {
        name: "getExpiringLeases",
        description: "Contratos de aluguel próximos de vencer",
        input_schema: {
          type: "object",
          properties: {
            days: { type: "number", description: "Dentro de quantos dias (padrão 30)" },
            limit: { type: "number" },
          },
        },
      },
      {
        name: "getAvailableLots",
        description: "Lotes disponíveis para reserva",
        input_schema: {
          type: "object",
          properties: {
            developmentId: { type: "string", description: "Empreendimento (opcional)" },
            limit: { type: "number" },
          },
        },
      },
    ];
  }

  private async executeTool(auth: AuthContext, toolName: AiToolName, input: Record<string, any>) {
    switch (toolName) {
      case AiToolName.SEARCH_CLIENTS:
        return await this.searchClients(auth, input as SearchClientsInput);
      case AiToolName.SEARCH_PROPERTIES:
        return await this.searchProperties(auth, input as SearchPropertiesInput);
      case AiToolName.FIND_MATCHING_PROPERTIES:
        return await this.findMatchingProperties(auth, input);
      case AiToolName.GET_BROKER_PERFORMANCE:
        return await this.getBrokerPerformance(auth, input);
      case AiToolName.GET_OVERDUE_RENTALS:
        return await this.getOverdueRentals(auth);
      case AiToolName.GET_EXPIRING_LEASES:
        return await this.getExpiringLeases(auth, input as any);
      case AiToolName.GET_AVAILABLE_LOTS:
        return await this.getAvailableLots(auth, input as any);
      case AiToolName.CREATE_FOLLOWUP_DRAFT:
        return await this.createFollowUpDraft(auth, input);
      default:
        throw new BadRequestException(`Ferramenta desconhecida: ${toolName}`);
    }
  }

  private async searchClients(auth: AuthContext, input: any) {
    const clients = await this.prisma.client.findMany({
      where: {
        tenantId: auth.tenantId,
        OR: [
          { name: { contains: input.query } },
          { phone: { contains: input.query } },
          { email: { contains: input.query } },
        ],
      },
      take: input.limit || 10,
      select: { id: true, name: true, phone: true, email: true },
    });
    return { count: clients.length, clients };
  }

  private async searchProperties(auth: AuthContext, input: any) {
    const where: any = { tenantId: auth.tenantId };
    if (input.query) where.OR = [{ addressLine: { contains: input.query } }];
    if (input.type) where.type = input.type;
    if (input.status) where.status = input.status;
    if (input.minPrice || input.maxPrice) {
      where.salePrice = {};
      if (input.minPrice) where.salePrice.gte = input.minPrice;
      if (input.maxPrice) where.salePrice.lte = input.maxPrice;
    }

    const properties = await this.prisma.property.findMany({
      where,
      take: input.limit || 10,
      select: { id: true, addressLine: true, type: true, status: true, salePrice: true },
    });
    return { count: properties.length, properties };
  }

  private async findMatchingProperties(auth: AuthContext, input: any) {
    // Verificar se cliente é seu
    const client = await this.prisma.client.findFirst({
      where: { id: input.clientId, tenantId: auth.tenantId },
    });
    if (!client) throw new ForbiddenException("Cliente não encontrado");

    // Simular matching por interesse genérico
    const properties = await this.prisma.property.findMany({
      where: { tenantId: auth.tenantId, status: "AVAILABLE" },
      take: input.limit || 5,
      select: { id: true, addressLine: true, type: true, salePrice: true },
    });
    return { client: client.name, matches: properties };
  }

  private async getBrokerPerformance(auth: AuthContext, input: any) {
    // Se brokerId não informado, retornar própria performance
    const brokerId = input.brokerId || auth.userId;

    const sales = await this.prisma.sale.findMany({
      where: { tenantId: auth.tenantId, brokerId },
      select: { id: true, finalSalePrice: true, saleDate: true },
    });

    const total = sales.reduce((sum, s) => sum + Number(s.finalSalePrice || 0), 0);
    return { brokerId, totalSales: sales.length, totalAmount: total, avgSale: sales.length > 0 ? total / sales.length : 0 };
  }

  private async getOverdueRentals(auth: AuthContext) {
    const charges = await this.prisma.rentCharge.findMany({
      where: { tenantId: auth.tenantId, status: "OVERDUE" },
      include: { lease: true },
      take: 10,
    });
    return { count: charges.length, charges: charges.map((c) => ({id: c.id, amount: Number(c.totalAmount), lease: c.lease?.id})) };
  }

  private async getExpiringLeases(auth: AuthContext, input: { days?: number }) {
    const days = input.days || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const leases = await this.prisma.lease.findMany({
      where: { tenantId: auth.tenantId, endDate: { lte: futureDate, gte: new Date() } },
      take: 10,
      select: { id: true, monthlyRent: true, endDate: true },
    });
    return { count: leases.length, leases };
  }

  private async getAvailableLots(auth: AuthContext, input: { developmentId?: string }) {
    const where: any = { tenantId: auth.tenantId, status: "AVAILABLE" };
    if (input.developmentId) where.developmentId = input.developmentId;

    const lots = await this.prisma.lot.findMany({
      where,
      take: 10,
      select: { id: true, lotNumber: true, basePrice: true, areaM2: true },
    });
    return { count: lots.length, lots };
  }

  private async createFollowUpDraft(auth: AuthContext, input: any) {
    const client = await this.prisma.client.findFirst({
      where: { id: input.clientId, tenantId: auth.tenantId },
    });
    if (!client) throw new ForbiddenException("Cliente não encontrado");

    // Gerar rascunho (texto assistivo, não salva automaticamente)
    return {
      clientId: input.clientId,
      draft: `Olá ${client.name}, tudo bem? Gostaria de acompanhar como você está com relação aos imóveis que compartilhei. Alguma dúvida?`,
      requiresApproval: true,
    };
  }

  private mapConversationDto(conv: any): AiConversationDto {
    return {
      id: conv.id,
      title: conv.title,
      provider: conv.provider,
      status: conv.status,
      messagesCount: conv.messagesCount,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  }

  private mapMessageDto(msg: any): AiMessageDto {
    return {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      toolName: msg.toolName,
      toolInput: msg.toolInput,
      toolOutput: msg.toolOutput,
      createdAt: msg.createdAt,
    };
  }
}
