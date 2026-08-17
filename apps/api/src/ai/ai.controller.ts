import { Controller, Post, Get, Body, Param, UseGuards, HttpCode } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Auth } from "../auth/decorators";
import type { AuthContext } from "../auth/auth.types";
import { AiService } from "./ai.service";
import type {
  AiConversationDto,
  AiMessageDto,
  SendMessageRequest,
  SendMessageResponse,
} from "@sena/shared";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("conversations")
  @HttpCode(201)
  async startConversation(
    @Auth() auth: AuthContext,
    @Body() dto: { title: string }
  ): Promise<AiConversationDto> {
    return this.aiService.startConversation(auth, dto.title);
  }

  @Post("conversations/:conversationId/messages")
  @HttpCode(201)
  async sendMessage(
    @Auth() auth: AuthContext,
    @Param("conversationId") conversationId: string,
    @Body() dto: SendMessageRequest
  ): Promise<SendMessageResponse> {
    const result = await this.aiService.sendMessage(auth, conversationId, dto.message);
    return {
      conversationId: result.conversation.id,
      messages: result.messages,
    };
  }
}
