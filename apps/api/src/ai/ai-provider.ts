export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface AiGenerateRequest {
  model: string;
  messages: AiMessage[];
  tools?: AiToolDefinition[];
  maxTokens?: number;
  temperature?: number;
}

export interface AiToolUse {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface AiTextBlock {
  type: "text";
  text: string;
}

export interface AiGenerateResult {
  content: Array<AiTextBlock | AiToolUse>;
  stopReason: "end_turn" | "tool_use" | "max_tokens";
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export abstract class AiProvider {
  abstract generate(req: AiGenerateRequest): Promise<AiGenerateResult>;
}
