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
    size?: number;
    mimeType?: string;
    thumbnailUrl?: string;
}
export interface VideoContent {
    type: 'video';
    url: string;
    caption?: string;
    duration?: number;
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
    thumbnailUrl?: string;
}
export interface AudioContent {
    type: 'audio';
    url: string;
    duration?: number;
    size?: number;
    mimeType?: string;
    originalUrl?: string;
}
export interface DocumentContent {
    type: 'document';
    url: string;
    filename: string;
    caption?: string;
    size?: number;
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
    messageId: string;
}
export interface SystemContent {
    type: 'system';
    action: 'conversation_started' | 'conversation_ended' | 'user_joined' | 'user_left' | 'assignment_changed' | 'status_changed';
    details?: Record<string, unknown>;
}
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
export type MessageContent = TextContent | ImageContent | VideoContent | AudioContent | DocumentContent | LocationContent | ContactContent | PollContent | PollVoteContent | LinkContent | ReactionContent | SystemContent | ButtonsContent | ListContent | TemplateContent;
export interface Sender {
    id: string;
    name: string;
    picture?: string;
    type: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
}
export interface ConversationMessage {
    id: string;
    appId: string;
    companyId: string;
    conversationId: string;
    channelId?: string;
    content: MessageContent[];
    plainText?: string;
    html?: string;
    direction: 'inbound' | 'outbound';
    messageType: 'user' | 'system' | 'ai' | 'automation';
    sender?: Sender;
    senderId?: string;
    senderName?: string;
    senderType?: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
    providerMessageId?: string;
    providerData?: Record<string, unknown>;
    replyToMessageId?: string;
    reply?: Partial<ConversationMessage>;
    forwardedFromMessageId?: string;
    forwarded?: Partial<ConversationMessage>;
    isForwarded?: boolean;
    threadId?: string;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
    deliveredAt?: string;
    readAt?: string;
    failedReason?: string;
    /** Código numérico do erro do provider (ex.: 131047 da Meta). Permite classificar a falha sem parsear string. */
    failedCode?: number;
    isEdited: boolean;
    editedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    deletedBy?: string;
    reactions: MessageReaction[];
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
    internalNote?: string;
    isInternal: boolean;
    sentAt: string;
    createdAt: string;
    updatedAt: string;
    wasExisting?: boolean;
    reasoningContent?: string;
}
export interface MessageReaction {
    emoji: string;
    userId?: string;
    userName?: string;
    remoteJid?: string;
    contactName?: string;
    createdAt: string;
}
export interface CreateConversationMessageRequest {
    conversationId: string;
    content: MessageContent[];
    plainText?: string;
    direction: 'inbound' | 'outbound';
    messageType: 'user' | 'system' | 'ai' | 'automation';
    senderId?: string;
    senderName?: string;
    senderType: 'contact' | 'user' | 'system' | 'ai' | 'automation' | 'automation-follow';
    providerMessageId?: string;
    providerData?: Record<string, unknown>;
    replyToMessageId?: string;
    forwardedFromMessageId?: string;
    isForwarded?: boolean;
    threadId?: string;
    internalNote?: string;
    isInternal?: boolean;
    sentAt?: string;
    /**
     * Só uso INTERNO (nunca chega por HTTP — o Zod de create não expõe):
     * `pending` = gravada para sair pela fila de saída; ausente = `sent`.
     */
    status?: 'sent' | 'pending';
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
export interface ConversationMessageListResponse extends ListResponse<ConversationMessageResponse> {
}
export interface SendMessageRequest {
    conversationId: string;
    content: MessageContent[];
    replyToMessageId?: string;
    internalNote?: string;
    isInternal?: boolean;
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
    contactIds: string[];
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
    deleteForEveryone?: boolean;
}
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
    highlights: Record<string, string[]>;
}
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
export interface BulkMessageOperationRequest {
    messageIds: string[];
    operation: 'markAsRead' | 'markAsUnread' | 'delete' | 'addReaction' | 'removeReaction';
    data?: {
        emoji?: string;
        reason?: string;
    };
}
export interface MessageStats {
    total: number;
    byDirection: Record<string, number>;
    byType: Record<string, number>;
    byContentType: Record<string, number>;
    byStatus: Record<string, number>;
    totalUnread: number;
    totalWithReactions: number;
}
import { PaginationQuery, ListResponse } from './common';
