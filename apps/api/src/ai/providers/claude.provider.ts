import { AiProvider, type AiGenerateRequest, type AiGenerateResult } from "../ai-provider";
import { Anthropic } from "@anthropic-ai/sdk";

export class ClaudeProvider extends AiProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    const tools = req.tools?.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    })) as any;

    const response = await this.client.messages.create({
      model: req.model || "claude-3-5-sonnet-20241022",
      max_tokens: req.maxTokens || 1024,
      temperature: req.temperature || 0.7,
      system: "Você é um assistente especialista em imobiliária. Responda de forma concisa e útil.",
      messages: req.messages.map((m) => ({
        role: m.role === "system" ? "user" : m.role,
        content: m.content,
      })) as any,
      tools,
    } as any);

    return {
      content: response.content as any,
      stopReason: response.stop_reason as "end_turn" | "tool_use" | "max_tokens",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model: req.model || "claude-3-5-sonnet-20241022",
    };
  }
}
