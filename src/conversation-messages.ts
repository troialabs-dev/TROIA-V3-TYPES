// ConversationMessage Types - Sistema de mensagens multi-canal com conteúdo rico

// Message Content Types
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  url: string;
  caption?: string;
  width?: number;
  height?: number;
  size?: number; // bytes
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface VideoContent {
  type: 'video';
  url: string;
  caption?: string;
  duration?: number; // seconds
  width?: number;
  height?: number;
  size?: number; // bytes
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface AudioContent {
  type: 'audio';
  url: string;
  duration?: number; // seconds
  size?: number; // bytes
  mimeType?: string;
  // Dual-file de voz gravada na UI: `url` = derivada MP3 (toca em qualquer
  // browser, incl. Safari/iOS < 18.4) e `originalUrl` = Ogg/Opus original,
  // que é o que vai ao provider (voice note ptt exige ogg/opus).
  originalUrl?: string;
}

export interface DocumentContent {
  type: 'document';
  url: string;
  filename: string;
  caption?: string;
  size?: number; // bytes
  mimeType?: string;
}

export interface LocationContent {
  type: 'location';
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

/**
 * Enquete recebida do WhatsApp (criação). Guardar as `options` é o que torna
 * possível traduzir um voto depois: o voto trafega como SHA-256 do texto da
 * opção, então sem a enquete original o hash é irreversível.
 */
export interface PollContent {
  type: 'poll';
  /** Pergunta da enquete. */
  name: string;
  /** Opções, na ordem em que o autor criou. */
  options: string[];
  /** Quantas opções o votante pode marcar (1 = escolha única). */
  selectableCount?: number;
}

/**
 * Voto em enquete. O WhatsApp entrega apenas os HASHES das opções escolhidas
 * (SHA-256 do texto); o backend resolve para o texto cruzando com a
 * `PollContent` da enquete original — ver `resolvePollVoteOptions`.
 */
export interface PollVoteContent {
  type: 'poll-vote';
  /** providerMessageId da enquete votada. */
  pollMessageId: string;
  /** Pergunta da enquete (preenchida na resolução, para exibir sem novo fetch). */
  pollTitle?: string;
  /** Opções votadas em TEXTO. Vazio = hash não resolvido (enquete não encontrada). */
  options: string[];
  /** Hashes crus (hex) — auditoria e reprocessamento se a enquete chegar depois. */
  optionHashes?: string[];
  /** Voto vazio = o votante DESMARCOU a escolha anterior (protocolo do WhatsApp). */
  isRetraction?: boolean;
}

export interface ContactContent {
  type: 'contact';
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
}

export interface LinkContent {
  type: 'link';
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface ReactionContent {
  type: 'reaction';
  emoji: string;
  messageId: string; // ID of message being reacted to
}

export interface SystemContent {
  type: 'system';
  action: 'conversation_started' | 'conversation_ended' | 'user_joined' | 'user_left' | 'assignment_changed' | 'status_changed';
  details?: Record<string, unknown>;
}

// Interactive Message Types (WhatsApp buttons, lists, templates)

export interface ButtonItem {
  id: string;
  text: string;
}

export interface ButtonsContent {
  type: 'buttons';
  text: string;
  footer?: string;
  buttons: ButtonItem[];
}

export interface ListSection {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export interface ListContent {
  type: 'list';
  text: string;
  title?: string;
  buttonText: string;
  footer?: string;
  sections: ListSection[];
}

export interface TemplateButton {
  type: 'url' | 'quick_reply' | 'call';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface TemplateContent {
  type: 'template';
  text: string;
  buttons: TemplateButton[];
}

export type MessageContent =
  | TextContent
  | ImageContent
  | VideoContent
  | AudioContent
  | DocumentContent
  | LocationContent
  | ContactContent
  | PollContent
  | PollVoteContent
  | LinkContent
  | ReactionContent
  | SystemContent
  | ButtonsContent
  | ListContent
  | TemplateContent;

// Sender information (unified object)
export interface Sender {
  id: string;
  name: string;
  picture?: string;
  type: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
}

// Main ConversationMessage interface
export interface ConversationMessage {
  id: string;
  appId: string;
  companyId: string;
  conversationId: string;
  channelId?: string; // denormalizado da conversation (D10 — dedup por canal)

  // Message content
  content: MessageContent[];
  plainText?: string; // Extracted text for search/indexing
  html?: string; // Original HTML body (email messages)

  // Message metadata
  direction: 'inbound' | 'outbound';
  messageType: 'user' | 'system' | 'ai' | 'automation';

  // ✅ NEW: Unified sender object (populated via aggregation)
  sender?: Sender;

  // DEPRECATED: Legacy fields (kept for backward compatibility, will be removed in future)
  senderId?: string; // @deprecated Use sender.id instead
  senderName?: string; // @deprecated Use sender.name instead
  senderType?: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow'; // @deprecated Use sender.type instead

  // External provider integration
  providerMessageId?: string; // External message ID
  providerData?: Record<string, unknown>; // Provider-specific metadata

  // Message relationships
  replyToMessageId?: string; // Message this replies to
  reply?: Partial<ConversationMessage>; // ✅ NOVO: Populated reply message via aggregation (partial to avoid circular reference)
  forwardedFromMessageId?: string; // Original message if forwarded (só preenchido quando a plataforma encaminhou)
  forwarded?: Partial<ConversationMessage>; // ✅ NOVO: Populated forwarded message via aggregation (partial to avoid circular reference)
  isForwarded?: boolean; // true se mensagem foi recebida com flag isForwarded do WhatsApp (inbound) ou encaminhada pela plataforma (outbound)
  threadId?: string; // For threaded conversations

  // Status and delivery
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
  /** Código numérico do erro do provider (ex.: 131047 da Meta). Permite classificar a falha sem parsear string. */
  failedCode?: number;

  // Message actions
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;

  // Reactions and interactions
  reactions: MessageReaction[];

  // ✅ AI Agent Tool Call/Result (UNIFIED - Recommended)
  // For messaging tools (send_text_message, send_audio_message, send_media_message):
  //   - Message content already represents the tool execution
  //   - toolCall + toolResult track what AI did
  //
  // For system tools (check_availability, create_lead, etc):
  //   - messageType: 'system' with plainText describing action
  //   - toolCall + toolResult for OpenAI context reconstruction
  toolCall?: {
    id: string;              // Tool call ID for OpenAI context
    name: string;            // Tool name (e.g., 'send_text_message')
    arguments: Record<string, unknown>;  // Tool arguments
  };

  toolResult?: {
    tool_call_id: string;    // Matches toolCall.id
    tool_name: string;       // Matches toolCall.name
    output: string;          // Tool execution result
  };

  // @deprecated Legacy format (use toolCall/toolResult instead)
  // Will be removed in future version
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;

  // @deprecated Legacy format (use toolCall/toolResult instead)
  // Will be removed in future version
  toolResults?: Array<{
    tool_call_id: string;
    tool_name: string;
    output: unknown;
  }>;

  // Internal notes (agent-only)
  internalNote?: string;
  isInternal: boolean; // True for agent-only messages

  // Timestamps
  sentAt: string;
  createdAt: string;
  updatedAt: string;

  // ✅ Duplicate detection flag (Arch 3.5 - Message Loop Fix)
  wasExisting?: boolean; // True when message already existed (duplicate detection)

  // ✅ DeepSeek R1 reasoning content (required for multi-turn tool calls)
  reasoningContent?: string;
}

export interface MessageReaction {
  emoji: string;
  userId?: string;       // Reactions de usuários da plataforma (UI)
  userName?: string;
  remoteJid?: string;    // Reactions de contatos WhatsApp (webhook)
  contactName?: string;  // Nome do contato (se disponível)
  createdAt: string;
}

export interface CreateConversationMessageRequest {
  conversationId: string;
  content: MessageContent[];
  plainText?: string;
  direction: 'inbound' | 'outbound';
  messageType: 'user' | 'system' | 'ai' | 'automation';
  senderId?: string; // Will be used to build sender object
  senderName?: string;
  senderType: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
  providerMessageId?: string;
  providerData?: Record<string, unknown>;
  replyToMessageId?: string;
  forwardedFromMessageId?: string;
  isForwarded?: boolean; // true se a mensagem é um forward (inbound via WhatsApp ou outbound via UI)
  threadId?: string;
  internalNote?: string;
  isInternal?: boolean;
  sentAt?: string;
  /**
   * Só uso INTERNO (nunca chega por HTTP — o Zod de create não expõe):
   * `pending` = gravada para sair pela fila de saída; ausente = `sent`.
   */
  status?: 'sent' | 'pending';

  // ✅ NEW: Unified tool call/result (recommended)
  toolCall?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  };
  toolResult?: {
    tool_call_id: string;
    tool_name: string;
    output: string;
  };

  // @deprecated Legacy format (use toolCall/toolResult instead)
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  toolResults?: Array<{
    tool_call_id: string;
    tool_name: string;
    output: unknown;
  }>;

  // ✅ DeepSeek R1 reasoning content (required for multi-turn tool calls)
  reasoningContent?: string;
}

export interface UpdateConversationMessageRequest {
  content?: MessageContent[];
  plainText?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  /** Carimbado no DESPACHO para mensagem que saiu pela fila (nasceu `pending`). */
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
  /** Código numérico do erro do provider (ex.: 131047 da Meta). Permite classificar a falha sem parsear string. */
  failedCode?: number;
  internalNote?: string;
}

export type ConversationMessageResponse = ConversationMessage;

export interface ConversationMessageQuery extends PaginationQuery {
  conversationId?: string;
  filters?: {
    direction?: 'inbound' | 'outbound';
    messageType?: 'user' | 'system' | 'ai' | 'automation';
    senderType?: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
    senderId?: string;
    status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
    contentType?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'poll' | 'poll-vote' | 'link' | 'reaction' | 'system' | 'buttons' | 'list' | 'template';
    isInternal?: boolean;
    isEdited?: boolean;
    isDeleted?: boolean;
    hasReactions?: boolean;
    threadId?: string;
    providerMessageId?: string;
    sentFrom?: string;
    sentTo?: string;
    createdFrom?: string;
    createdTo?: string;
  };
}

export interface ConversationMessageListResponse extends ListResponse<ConversationMessageResponse> {}

// Message actions
export interface SendMessageRequest {
  conversationId: string;
  content: MessageContent[];
  replyToMessageId?: string;
  internalNote?: string;
  isInternal?: boolean;

  // ✅ Optional fields for automation/system messages
  senderType?: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
  senderId?: string;
  senderName?: string;
  messageType?: 'user' | 'system' | 'ai' | 'automation';
}

export interface EditMessageRequest {
  content: MessageContent[];
  plainText?: string;
}

export interface SendTemplateRequest {
  conversationId: string;
  templateId: string;
  variables: Record<string, string>;
}

export interface ForwardMessageRequest {
  originalMessageId: string;
  contactIds: string[]; // Backend busca/cria conversas para cada contato no mesmo canal da mensagem original (máx 5)
  additionalContent?: MessageContent[];
  internalNote?: string;
}

/**
 * Resposta detalhada do forward: separa sucessos e falhas por contato,
 * para o frontend poder mostrar ao usuário exatamente o que funcionou.
 */
export interface ForwardMessageResponse {
  successful: Array<{
    contactId: string;
    conversationId: string;
    messageId: string;
  }>;
  failed: Array<{
    contactId: string;
    reason: string;
  }>;
}

export interface AddReactionRequest {
  messageId: string;
  emoji: string;
}

export interface RemoveReactionRequest {
  messageId: string;
  emoji: string;
}

export interface MarkAsReadRequest {
  messageIds: string[];
}

export interface DeleteMessageRequest {
  messageId: string;
  reason?: string;
  // true: revoke no WhatsApp (apagar para todos) — só outbound com providerMessageId
  // false/undefined: soft-delete apenas local (apagar para mim)
  deleteForEveryone?: boolean;
}

// Message search
export interface MessageSearchRequest {
  query: string;
  conversationId?: string;
  filters?: {
    direction?: 'inbound' | 'outbound';
    messageType?: 'user' | 'system' | 'ai' | 'automation';
    senderType?: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
    contentType?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
  limit?: number;
  offset?: number;
}

export interface MessageSearchResponse {
  messages: ConversationMessageResponse[];
  total: number;
  highlights: Record<string, string[]>; // messageId -> highlighted snippets
}

// ============================================================================
// "Fio" da conversa (plano 2026-11-24, Parte 3): a conversa aberta + os
// atendimentos anteriores do mesmo contato no mesmo canal que o usuário
// enxerga. Rotas: GET /conversations/:id/thread/search e /thread/messages.
// ============================================================================

/** Um resultado da lupa: leve, sem a mensagem inteira. */
export interface ConversationThreadSearchHit {
  messageId: string;
  conversationId: string;
  /** `true` quando a mensagem é do atendimento aberto (não do histórico). */
  isCurrentConversation: boolean;
  sentAt: string;
  direction: 'inbound' | 'outbound';
  senderName?: string;
  /** Trecho em volta do termo (~120 caracteres), com "…" quando corta. */
  snippet: string;
}

export interface ConversationThreadSearchResponse {
  items: ConversationThreadSearchHit[];
  /** Contado até `totalCap`; acima disso `totalCapped: true`. */
  total: number;
  totalCapped: boolean;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** `around` = a mensagem + vizinhas dos dois lados; `older`/`newer` = estritamente antes/depois dela. */
export type ConversationThreadDirection = 'around' | 'older' | 'newer';

/** Janela de mensagens do fio (modo "em volta da mensagem"). Itens newest first. */
export interface ConversationThreadMessagesResponse {
  items: ConversationMessageResponse[];
  /** Há mensagem mais antiga que a última da lista. */
  hasOlder: boolean;
  /** Há mensagem mais nova que a primeira da lista. */
  hasNewer: boolean;
}

// Bulk operations
export interface BulkMessageOperationRequest {
  messageIds: string[];
  operation: 'markAsRead' | 'markAsUnread' | 'delete' | 'addReaction' | 'removeReaction';
  data?: {
    emoji?: string;
    reason?: string;
  };
}

// Message statistics
export interface MessageStats {
  total: number;
  byDirection: Record<string, number>;
  byType: Record<string, number>;
  byContentType: Record<string, number>;
  byStatus: Record<string, number>;
  totalUnread: number;
  totalWithReactions: number;
}

// Import types
import { PaginationQuery, ListResponse } from './common';