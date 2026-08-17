export enum AiToolName {
  SEARCH_CLIENTS = "SEARCH_CLIENTS",
  SEARCH_PROPERTIES = "SEARCH_PROPERTIES",
  FIND_MATCHING_PROPERTIES = "FIND_MATCHING_PROPERTIES",
  GET_BROKER_PERFORMANCE = "GET_BROKER_PERFORMANCE",
  GET_COMMISSION_SUMMARY = "GET_COMMISSION_SUMMARY",
  GET_OVERDUE_RENTALS = "GET_OVERDUE_RENTALS",
  GET_EXPIRING_LEASES = "GET_EXPIRING_LEASES",
  GET_AVAILABLE_LOTS = "GET_AVAILABLE_LOTS",
  CREATE_FOLLOWUP_DRAFT = "CREATE_FOLLOWUP_DRAFT",
}

export interface AiConversationDto {
  id: string;
  title: string;
  provider: string;
  status: string;
  messagesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiMessageDto {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolName?: AiToolName;
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
  createdAt: Date;
}

export interface AiConsumptionDto {
  id: string;
  provider: string;
  model: string;
  toolName?: AiToolName;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  createdAt: Date;
}

export interface AiToolCall {
  name: AiToolName;
  arguments: Record<string, any>;
}

export interface AiToolResult {
  name: AiToolName;
  result: Record<string, any>;
  error?: string;
}

export interface SearchClientsInput {
  query: string;
  limit?: number;
}

export interface SearchPropertiesInput {
  query?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface FindMatchingPropertiesInput {
  clientId: string;
  limit?: number;
}

export interface GetBrokerPerformanceInput {
  brokerId?: string;
  period?: "month" | "quarter" | "year";
}

export interface GetCommissionSummaryInput {
  brokerId?: string;
  period?: "month" | "quarter" | "year";
}

export interface CreateFollowUpDraftInput {
  clientId: string;
  leadId?: string;
  template?: "contact" | "followup" | "proposal";
  context?: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
  useTool?: AiToolName;
  confirmAction?: boolean;
}

export interface SendMessageResponse {
  conversationId: string;
  messages: AiMessageDto[];
  toolCalls?: AiToolCall[];
  needsConfirmation?: boolean;
}
