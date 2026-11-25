/**
 * Socket.IO Event Types - Shared between Frontend and Backend
 *
 * Prevents event name mismatches and ensures type safety for socket events
 */

import type { SoundKey } from './notifications';
import type { ChannelDisconnectInfo } from './channels';
import type { ChannelSyncStatus, ChannelActivityType } from './channel-dashboard';
import type { LeadCaptureSession } from './lead-capture';
import type {
  InternalAgentRunStartedEvent,
  InternalAgentRunDeltaEvent,
  InternalAgentRunStepEvent,
  InternalAgentRunFinishedEvent,
  InternalAgentSessionUpdatedEvent,
  InternalAgentSessionDeletedEvent,
  InternalAgentConfirmationUpdatedEvent,
} from './internal-agents';

// ============================================================================
// EVENT NAMES (String Literals for Type Safety)
// ============================================================================

export const SOCKET_EVENTS = {
  // Conversation Events
  CONVERSATION_MESSAGE: 'conversation:message',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_DELETED: 'conversation:deleted',
  CONVERSATION_OPEN: 'conversation:open',               // ✅ Arch 3.4: User opens conversation
  CONVERSATION_UNREAD_RESET: 'conversation:unread-reset', // ✅ Arch 3.4: Unread counter reset
  CONVERSATION_ERROR: 'conversation:error',             // ✅ Arch 3.4: Error in conversation operations
  UNREAD_COUNT_UPDATE: 'unread-count:update',         // ✅ Optimization: Backend sends updated counters

  // ✅ Transient notification trigger — emitido user-specific APENAS para
  // destinatários elegíveis (não-mutados) quando chega mensagem inbound.
  // Presença do evento = permissão pra tocar toast+som. Diferente de
  // CONVERSATION_MESSAGE (broadcast pra UI state), este é dedicado ao
  // gatilho de notificação — sem cache no frontend, sem leak de mutedBy.
  CONVERSATION_MESSAGE_NOTIFY: 'conversation:message:notify',

  // Message Events
  MESSAGE_STATUS: 'message:status',                 // ✅ Generic status update (sent, delivered, read, failed)
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_REACTION: 'message:reaction',             // ✅ Reaction added/removed on a message
  MESSAGE_EDITED: 'message:edited',                 // ✅ Message content edited (inbound via webhook / outbound via UI)
  MESSAGE_TRANSCRIBED: 'message:transcribed',       // ✅ Audio/video transcription (STT) saved on message plainText

  // Channel Events
  CHANNEL_QR: 'channel:qr',
  CHANNEL_CONNECTED: 'channel:connected',
  CHANNEL_DISCONNECTED: 'channel:disconnected',
  CHANNEL_ACCOUNT_UPDATED: 'channel:account-updated', // ✅ Info da conta conectada atualizada (foto, push name, etc.)
  CHANNEL_SYNC_STARTED: 'channel:sync-started',
  CHANNEL_SYNC_COMPLETED: 'channel:sync-completed',
  CHANNEL_SYNC_ERROR: 'channel:sync-error',
  CHANNEL_MEDIA_PUBLISHED: 'channel:media-published',
  CHANNEL_COMMENT_RECEIVED: 'channel:comment-received',
  CHANNEL_ACTIVITY_RECEIVED: 'channel:activity-received',

  // User Events
  USER_TYPING: 'user:typing',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // Assignment Events
  ASSIGNMENT_CREATED: 'assignment:created',
  ASSIGNMENT_UPDATED: 'assignment:updated',
  ASSIGNMENT_COMPLETED: 'assignment:completed',

  // Contact Events
  CONTACT_IDENTIFIERS_SYNCED: 'contact:identifiers:synced',
  CONTACT_SYNC_FAILED: 'contact:sync:failed',

  // Integration Sync Events
  INTEGRATION_SYNC_STARTED: 'integration:sync-started',
  INTEGRATION_SYNC_PROGRESS: 'integration:sync-progress',
  INTEGRATION_SYNC_COMPLETED: 'integration:sync-completed',
  INTEGRATION_SYNC_FAILED: 'integration:sync-failed',

  // Database Sync Events
  DATABASE_SYNC_STARTED: 'database:sync-started',
  DATABASE_SYNC_PROGRESS: 'database:sync-progress',
  DATABASE_SYNC_COMPLETED: 'database:sync-completed',
  DATABASE_SYNC_FAILED: 'database:sync-failed',

  // Notification Events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_SOUND: 'notification:sound',     // ✅ Canal `sound` first-class — backend emite quando preferences permitem

  // Template Events
  TEMPLATE_STATUS_UPDATED: 'template:status-updated',

  // AI Agent Events
  AI_AGENT_EXECUTED: 'ai:agent:executed',

  // Campaign Events
  CAMPAIGN_MESSAGE_STATUS: 'campaign:message-status',   // Individual message status update
  CAMPAIGN_PROGRESS: 'campaign:progress',               // Overall campaign progress
  CAMPAIGN_COMPLETED: 'campaign:completed',             // Campaign finished

  // Audience Events
  AUDIENCE_IMPORT_STARTED: 'audience:import-started',
  AUDIENCE_IMPORT_PROGRESS: 'audience:import-progress',
  AUDIENCE_IMPORT_COMPLETED: 'audience:import-completed',
  AUDIENCE_IMPORT_FAILED: 'audience:import-failed',

  // Team Chat Events (internal user-to-user chat)
  TEAM_MESSAGE: 'team:message',                         // New message sent/received
  TEAM_MESSAGE_READ: 'team:message:read',               // Message marked as read
  TEAM_TYPING: 'team:typing',                           // Typing indicator
  TEAM_USER_ONLINE: 'team:user:online',                 // User came online
  TEAM_USER_OFFLINE: 'team:user:offline',               // User went offline
  TEAM_UNREAD_COUNT: 'team:unread-count',               // Unread count update
  TEAM_HEARTBEAT: 'team:heartbeat',                     // Client heartbeat to keep presence alive

  // Credit Payment Events
  CREDIT_PAYMENT_CONFIRMED: 'credit:payment:confirmed', // PIX payment confirmed via webhook

  // History Import Events (Importação de Histórico WhatsApp)
  HISTORY_IMPORT_QR: 'history-import:qr',
  HISTORY_IMPORT_STATUS: 'history-import:status',
  HISTORY_IMPORT_PROGRESS: 'history-import:progress',
  HISTORY_IMPORT_COMPLETED: 'history-import:completed',
  HISTORY_IMPORT_FAILED: 'history-import:failed',

  // Lead Capture (QR Code) — emitido SÓ na sala `user:{userId}` do vendedor
  // a cada mudança de status da sessão (waiting_scan → filled → confirmed → …)
  LEAD_CAPTURE_SESSION_UPDATED: 'lead-capture:session-updated',

  // Agentes internos (E1, 24/11/2026) — sempre na sala user:{dono da conversa}
  INTERNAL_AGENT_RUN_STARTED: 'internal-agent:run-started',
  INTERNAL_AGENT_RUN_DELTA: 'internal-agent:run-delta',
  INTERNAL_AGENT_RUN_STEP: 'internal-agent:run-step',
  INTERNAL_AGENT_RUN_FINISHED: 'internal-agent:run-finished',
  INTERNAL_AGENT_SESSION_UPDATED: 'internal-agent:session-updated',
  INTERNAL_AGENT_SESSION_DELETED: 'internal-agent:session-deleted',
  // E2: cartão de confirmação criado, decidido, expirado ou que falhou
  INTERNAL_AGENT_CONFIRMATION_UPDATED: 'internal-agent:confirmation-updated',
} as const;

// Type for event names
export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

// ============================================================================
// EVENT PAYLOAD INTERFACES
// ============================================================================

/**
 * Conversation Message Event
 * Emitted when a new message is received in a conversation
 */
export interface ConversationMessageEvent {
  conversationId: string;
  messageId: string;
  direction: 'inbound' | 'outbound';  // ✅ CRITICAL: Diferencia mensagens recebidas vs enviadas
  from?: {
    id: string;
    name: string;
    picture?: string;
    isBusinessAccount?: boolean;
  };
  content?: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';
  timestamp?: string;
  contactId?: string;
  channelId?: string;

  // ✅ Media metadata for real-time display
  mediaUrl?: string;
  mediaType?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    duration?: number;
    filename?: string;
  };

  // ✅ Location data
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  };

  // ✅ Contact data
  contact?: {
    name: string;
    phone?: string;
    email?: string;
    vcard?: string;
  };

  // ✅ Reaction data
  reaction?: {
    emoji: string;
    targetMessageId: string;
  };

  // ✅ Forwarded flags — mensagem encaminhada (inbound via webhook ou outbound via UI)
  isForwarded?: boolean;
  forwardedFromMessageId?: string;

  // ✅ Contexto da conversation anexado ao payload do evento — permite que
  // handlers globais decidam comportamento (ex: tocar som diferente quando
  // a conversa ainda está 'waiting' vs 'active') sem round-trip extra.
  conversationStatus?: 'waiting' | 'active' | 'closed';
  conversationAssigneeId?: string;
}

/**
 * Payload do evento `CONVERSATION_MESSAGE_NOTIFY` — user-specific.
 *
 * Emitido pelo backend APENAS nos rooms `user:{userId}` dos destinatários
 * elegíveis (não-mutados). Frontend: presença do evento é permissão pra
 * tocar toast+som — sem lookup de cache, sem check de mute.
 *
 * Carrega mínimo necessário pra:
 *   - identificar conv (conversationId)
 *   - escolher som (conversationStatus → active=message.mp3, outros=queue.wav)
 *   - logs/debug (direction sempre 'inbound' nesse evento)
 */
export interface ConversationMessageNotifyEvent {
  conversationId: string;
  direction: 'inbound';
  conversationStatus: 'waiting' | 'active' | 'closed';
  conversationAssigneeId?: string;
  contactId?: string;
  groupId?: string;
}

/**
 * Payload do evento `NOTIFICATION_SOUND` — user-specific.
 *
 * Minimalista: o backend resolve a `soundKey` via `resolveSoundKey` (mapping
 * notificationType → SoundKey) ANTES do dispatch. O frontend só executa via
 * mapping `playSoundByKey`. Sem `notificationId`, `notificationType` ou
 * `data` — observabilidade vive no audit `notification.deliveryStatus[]` no
 * Mongo, não no payload do socket.
 *
 * Adicionar som novo: estender `SoundKey` em `notifications.ts` +
 * `resolveSoundKey` (backend) + `players` (frontend).
 */
export interface SoundNotificationEvent {
  soundKey: SoundKey;
}

/**
 * Conversation Updated Event
 * Emitted when conversation metadata is updated
 */
export interface ConversationUpdatedEvent {
  conversationId: string;
  updates: {
    status?: string;
    subject?: string;
    priority?: string;
    lastMessage?: string;
    lastMessageAt?: string;
  };
}

/**
 * Conversation Deleted Event
 */
export interface ConversationDeletedEvent {
  conversationId: string;
  deletedAt: string;
}

/**
 * Message Status Event
 * Generic status update for messages (sent, delivered, read, failed)
 */
export interface MessageStatusEvent {
  messageId: string;                    // MongoDB message ID
  providerMessageId?: string;           // WhatsApp provider message ID
  conversationId?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  failedReason?: string;                // Only for failed status — human-readable reason
  failedCode?: number;                  // Only for failed status — código numérico estruturado do provider (ex.: 131047 da Meta)
  timestamp: Date;
}

/**
 * Message Delivered Event
 */
export interface MessageDeliveredEvent {
  messageId: string;
  conversationId: string;
  deliveredAt: string;
}

/**
 * Message Read Event
 */
export interface MessageReadEvent {
  messageId: string;
  conversationId: string;
  readAt: string;
}

/**
 * Message Reaction Event
 * Fired when a reaction is added or removed on a message (via webhook or UI)
 */
export interface MessageReactionEvent {
  conversationId: string;
  messageId: string;            // MongoDB _id da mensagem alvo
  reaction: {
    emoji: string;
    userId?: string;            // Reactions de usuários da plataforma (UI)
    userName?: string;
    remoteJid?: string;         // Reactions de contatos WhatsApp (webhook)
    contactName?: string;
    createdAt: string;
  };
  action: 'add' | 'remove';
}

/**
 * Message Edited Event
 * Emitido quando uma mensagem é editada (inbound via webhook ou outbound via UI).
 * Frontend deve atualizar content/plainText e marcar visualmente como editada.
 */
export interface MessageEditedEvent {
  conversationId: string;
  messageId: string;            // MongoDB _id da mensagem editada
  newContent: unknown;          // Novo MessageContent[] (tipo serializado)
  newPlainText: string;
  editedAt: string;
  source: 'webhook' | 'ui';     // webhook = cliente editou no WhatsApp; ui = usuário TROIA editou
}

/**
 * Message Transcribed Event
 * Emitido quando a transcrição STT de um áudio/vídeo é gerada sob demanda e
 * salva no plainText da mensagem. Frontend deve atualizar apenas o plainText
 * (NÃO marca a mensagem como editada).
 */
export interface MessageTranscribedEvent {
  conversationId: string;
  messageId: string;            // MongoDB _id da mensagem transcrita
  plainText: string;            // Texto transcrito
}

/**
 * Message Deleted Event
 * Emitido quando uma mensagem é soft-deleted.
 * - source='ui': usuário TROIA clicou "Apagar" na interface (com ou sem revoke no WhatsApp)
 * - source='webhook': cliente revogou a mensagem no WhatsApp (chega via webhook)
 * Frontend deve remover a mensagem do cache local.
 */
export interface MessageDeletedEvent {
  conversationId: string;
  messageId: string;            // MongoDB _id da mensagem deletada
  deletedAt: string;
  source: 'webhook' | 'ui';
  deleteForEveryone?: boolean;  // true quando o backend revogou no provider (ui "apagar para todos")
}

/**
 * Channel QR Code Event
 */
export interface ChannelQREvent {
  instanceKey: string;
  qrCode: string;
  channelId: string;
}

/**
 * Channel Connected Event
 */
export interface ChannelConnectedEvent {
  instanceKey: string;
  channelId: string;
  connectedAt: string;
}

/**
 * Channel Sync Status Event
 * Emitido pelo motor de sync do Dashboard de Canal ao iniciar/concluir/falhar
 * uma sincronização de perfil/métricas — frontend atualiza o estado em tempo real.
 */
export interface ChannelSyncStatusEvent {
  channelId: string;
  syncStatus: ChannelSyncStatus;
  trigger?: string;
  error?: string;
}

/**
 * Channel Media Published Event
 * Emitido quando uma publicação agendada/rascunho é publicada com sucesso no provider
 * (Dashboard de Canal — F3) — frontend atualiza a fila e o feed.
 */
export interface ChannelMediaPublishedEvent {
  channelId: string;
  mediaId: string;
  providerMediaId?: string;
  permalink?: string;
  mediaType: string;
}

/**
 * Channel Comment Received Event
 * Emitido quando um comentário novo (webhook Instagram) é persistido — frontend
 * atualiza a moderação em tempo real (Dashboard de Canal — F4).
 */
export interface ChannelCommentReceivedEvent {
  channelId: string;
  mediaId: string;
  commentId: string;
  text: string;
  authorUsername: string;
}

/**
 * Channel Activity Received Event
 * Emitido quando uma atividade nova é materializada na timeline do canal
 * (comment / mention / follower_delta) — frontend (F5b) faz nudge de realtime.
 */
export interface ChannelActivityReceivedEvent {
  channelId: string;
  activityId: string;
  activityType: ChannelActivityType;
  occurredAt: string;
}

/**
 * Channel Account Updated Event
 * Emitido quando o provider envia informações atualizadas da conta conectada
 * (nome, foto, plataforma, etc.) — frontend atualiza o card em tempo real.
 */
export interface ChannelAccountUpdatedEvent {
  channelId: string;
  identifier: string;            // apenas dígitos
  accountInfo: {
    pushName?: string;
    verifiedName?: string;
    businessName?: string;
    platform?: string;
    profilePictureUrl?: string;
    hasProfilePicture?: boolean;
    coverPhotoUrl?: string;
    status?: string;
    description?: string;
    email?: string;
    address?: string;
    websites?: string[];
    category?: string;
    categories?: string[];
    businessHours?: Array<{
      dayOfWeek: string;
      mode: string;
      openTime?: number;
      closeTime?: number;
    }>;
    timezone?: string;
    updatedAt: string;
  };
}

/**
 * Channel Disconnected Event
 * Emitido quando um canal perde a conexão via provider oficial, gateway ou health check.
 * Frontend deve atualizar o status do canal em tempo real e exibir o motivo.
 */
export interface ChannelDisconnectedEvent {
  channelId: string;
  status: 'pending' | 'error';
  disconnectInfo: ChannelDisconnectInfo;
}

/**
 * User Typing Event
 */
export interface UserTypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/**
 * Assignment Created Event
 */
export interface AssignmentCreatedEvent {
  assignmentId: string;
  resourceType: 'ticket' | 'conversation';
  resourceId: string;
  assignedTo: string;
  assignedBy: string;
  priority?: string;
}

/**
 * Assignment Updated Event
 */
export interface AssignmentUpdatedEvent {
  assignmentId: string;
  updates: {
    status?: 'pending' | 'assigned' | 'completed';
    assignedTo?: string;
    priority?: string;
  };
}


/**
 * Conversation Open Event (Arch 3.4)
 * Client-to-Server: User opens a conversation
 */
export interface ConversationOpenEvent {
  conversationId: string;
}

/**
 * Conversation Unread Reset Event (Arch 3.4)
 * Server-to-Client: Confirms unread counter has been reset
 */
export interface ConversationUnreadResetEvent {
  conversationId: string;
  unreadCount: number;
}

/**
 * Unread Count Update Event
 * Server-to-Client: Updated unread counters (total + by type)
 * Optimization: Sent after message creation to avoid frontend HTTP requests
 */
export interface UnreadCountUpdateEvent {
  userId: string;              // User ID who will receive this update
  totalUnread: number;         // Total unread messages across all conversations
  byType: {                    // Unread count by conversation type
    ai: number;                // AI agent conversations (agentId + agentStatus: 'active')
    individual: number;        // Individual chats (contactId + no groupId + no active agent)
    group: number;             // Group conversations (groupId)
    email: number;             // Email conversations (source: 'email')
  };
  timestamp: string;           // ISO timestamp of update
}

/**
 * Conversation Error Event (Arch 3.4)
 * Server-to-Client: Error during conversation operations
 */
export interface ConversationErrorEvent {
  message: string;
  error?: string;
}

/**
 * Contact Identifiers Synced Event
 * Server-to-Client: WhatsApp identifiers successfully synchronized
 */
export interface ContactIdentifiersSyncedPayload {
  contactId: string;
  identifiers: string[];
  avatarUrl?: string;
}

/**
 * Contact Sync Failed Event
 * Server-to-Client: Failed to synchronize WhatsApp identifiers
 */
export interface ContactSyncFailedPayload {
  contactId: string;
  error: string;
}

/**
 * Integration Sync Started Event
 * Server-to-Client: Integration sync process has started
 */
export interface IntegrationSyncStartedEvent {
  integrationId: string;
  integrationType: 'app' | 'company' | 'user';
  providerType: string;
  syncType: 'full' | 'incremental';
  totalItems?: number; // Estimated total items if available
  timestamp: string;
}

/**
 * Integration Sync Progress Event
 * Server-to-Client: Progress update during sync
 */
export interface IntegrationSyncProgressEvent {
  integrationId: string;
  integrationType: 'app' | 'company' | 'user';
  currentItem: number;
  totalItems: number;
  itemType: 'event' | 'contact' | 'email' | 'task'; // Type of item being synced
  message?: string; // Optional progress message (e.g., "Syncing event: Meeting with John")
  timestamp: string;
}

/**
 * Integration Sync Completed Event
 * Server-to-Client: Sync process completed successfully
 */
export interface IntegrationSyncCompletedEvent {
  integrationId: string;
  integrationType: 'app' | 'company' | 'user';
  itemsSynced: number;
  duration: number; // Duration in milliseconds
  success: boolean;
  timestamp: string;
}

/**
 * Integration Sync Failed Event
 * Server-to-Client: Sync process failed with error
 */
export interface IntegrationSyncFailedEvent {
  integrationId: string;
  integrationType: 'app' | 'company' | 'user';
  error: string;
  itemsProcessed: number;
  timestamp: string;
}

/**
 * Database Sync Started Event
 * Server-to-Client: Database sync process has started
 */
export interface DatabaseSyncStartedEvent {
  integrationId: string;
  providerId: string;
  syncDirection: 'pull' | 'push';
  timestamp: string;
}

/**
 * Database Sync Progress Event
 * Server-to-Client: Progress update during database sync
 */
export interface DatabaseSyncProgressEvent {
  integrationId: string;
  currentItem: number;
  totalItems: number;
  message?: string; // Optional progress message
  timestamp: string;
}

/**
 * Database Sync Completed Event
 * Server-to-Client: Database sync completed successfully
 */
export interface DatabaseSyncCompletedEvent {
  integrationId: string;
  itemsSynced: number;
  duration: number; // Duration in milliseconds
  success: boolean;
  timestamp: string;
}

/**
 * Database Sync Failed Event
 * Server-to-Client: Database sync failed with error
 */
export interface DatabaseSyncFailedEvent {
  integrationId: string;
  error: string;
  itemsProcessed: number;
  timestamp: string;
}

/**
 * Template Status Updated Event
 * Server-to-Client: Template approval status changed (APPROVED/REJECTED)
 */
export interface TemplateStatusUpdatedEvent {
  templateId: string;
  name: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  previousStatus?: string;
  reason?: string;
  timestamp: string;
}

/**
 * AI Agent Executed Event
 * Emitted when an AI agent finishes executing in a conversation
 */
export interface AIAgentExecutedEvent {
  conversationId: string;
  agentId: string;
  agentName: string;
  success: boolean;
  response: string;
  toolCallsExecuted: number;
  iterations: number;
  timestamp: string;
}

/**
 * Campaign Message Status Event
 * Server-to-Client: Individual campaign message status update
 */
export interface CampaignMessageStatusEvent {
  campaignId: string;
  messageId: string;               // MongoDB campaign-message ID
  providerMessageId?: string;      // WhatsApp provider message ID
  recipientIdentifier: string;
  recipientName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  previousStatus?: string;
  timestamp: string;
  failureReason?: string;          // Only for failed status
}

/**
 * Campaign Progress Event
 * Server-to-Client: Overall campaign progress update
 */
export interface CampaignProgressEvent {
  campaignId: string;
  campaignName: string;
  stats: {
    totalMessages: number;
    messagesSent: number;
    messagesDelivered: number;
    messagesRead: number;
    messagesFailed: number;
    messagesProcessing: number;    // pending + queued + sending
  };
  percentComplete: number;         // 0-100
  timestamp: string;
}

/**
 * Team Chat Message Event
 * Bidirectional: Sender emits → Server forwards to recipient
 */
export interface TeamMessageEvent {
  roomId: string;
  message: {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    type: 'text' | 'file' | 'audio' | 'image';
    content?: string;
    mediaUrl?: string;
    mediaName?: string;
    mediaMimeType?: string;
    mediaSize?: number;
    readBy: string[];
    createdAt: string;
  };
}

/**
 * Team Message Read Event
 * Client-to-Server: User opened a chat room (marks messages as read)
 */
export interface TeamMessageReadEvent {
  roomId: string;
}

/**
 * Team Typing Event
 * Bidirectional: Sender emits → Server forwards to recipient
 */
export interface TeamTypingEvent {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

/**
 * Team User Online Event
 * Server-to-Client: Broadcast to company room when user connects
 */
export interface TeamUserOnlineEvent {
  userId: string;
  status: 'online';
}

/**
 * Team User Offline Event
 * Server-to-Client: Broadcast to company room when user disconnects
 */
export interface TeamUserOfflineEvent {
  userId: string;
  status: 'offline';
  lastSeen: string;
}

/**
 * Team Unread Count Event
 * Server-to-Client: Updated unread count for team chat
 */
export interface TeamUnreadCountEvent {
  userId: string;
  totalUnread: number;
  byUser: Record<string, number>; // { [targetUserId]: unreadCount }
}

/**
 * Campaign Completed Event
 * Server-to-Client: Campaign finished (all messages processed)
 */
export interface CampaignCompletedEvent {
  campaignId: string;
  campaignName: string;
  finalStatus: 'completed' | 'failed' | 'cancelled';
  stats: {
    totalMessages: number;
    messagesSent: number;
    messagesDelivered: number;
    messagesRead: number;
    messagesFailed: number;
  };
  duration: number;                // Total duration in milliseconds
  startedAt: string;
  completedAt: string;
}

/**
 * Credit Payment Confirmed Event
 * Server-to-Client: PIX payment confirmed via Asaas webhook
 */
export interface CreditPaymentConfirmedEvent {
  companyId: string;
  planName: string;
  creditsPerCycle: number;
  paymentId: string;
  status: 'active';
}

/**
 * Payload do evento `LEAD_CAPTURE_SESSION_UPDATED` — user-specific.
 * Carrega a sessão inteira (já é o que a modal renderiza); a modal/dashboard
 * invalidam `['lead-capture-session', uuid]` e `['seller-dashboard']`.
 */
export interface LeadCaptureSessionUpdatedPayload {
  session: LeadCaptureSession;
}

// ============================================================================
// SOCKET EVENT MAP (For Type-Safe Emit/On)
// ============================================================================

export interface SocketEventMap {
  // Conversation Events
  [SOCKET_EVENTS.CONVERSATION_MESSAGE]: ConversationMessageEvent;
  [SOCKET_EVENTS.CONVERSATION_MESSAGE_NOTIFY]: ConversationMessageNotifyEvent;  // ✅ user-specific notify
  [SOCKET_EVENTS.CONVERSATION_UPDATED]: ConversationUpdatedEvent;
  [SOCKET_EVENTS.CONVERSATION_DELETED]: ConversationDeletedEvent;
  [SOCKET_EVENTS.CONVERSATION_OPEN]: ConversationOpenEvent;               // ✅ Arch 3.4
  [SOCKET_EVENTS.CONVERSATION_UNREAD_RESET]: ConversationUnreadResetEvent; // ✅ Arch 3.4
  [SOCKET_EVENTS.CONVERSATION_ERROR]: ConversationErrorEvent;             // ✅ Arch 3.4
  [SOCKET_EVENTS.UNREAD_COUNT_UPDATE]: UnreadCountUpdateEvent;            // ✅ Optimization

  // Message Events
  [SOCKET_EVENTS.MESSAGE_STATUS]: MessageStatusEvent;           // ✅ Generic status event
  [SOCKET_EVENTS.MESSAGE_DELIVERED]: MessageDeliveredEvent;
  [SOCKET_EVENTS.MESSAGE_READ]: MessageReadEvent;
  [SOCKET_EVENTS.MESSAGE_REACTION]: MessageReactionEvent;       // ✅ Reaction add/remove
  [SOCKET_EVENTS.MESSAGE_EDITED]: MessageEditedEvent;           // ✅ Message content edited
  [SOCKET_EVENTS.MESSAGE_TRANSCRIBED]: MessageTranscribedEvent; // ✅ STT transcription saved on plainText
  [SOCKET_EVENTS.MESSAGE_DELETED]: MessageDeletedEvent;         // ✅ Message soft-deleted (ui/webhook)

  // Channel Events
  [SOCKET_EVENTS.CHANNEL_QR]: ChannelQREvent;
  [SOCKET_EVENTS.CHANNEL_CONNECTED]: ChannelConnectedEvent;
  [SOCKET_EVENTS.CHANNEL_DISCONNECTED]: ChannelDisconnectedEvent;
  [SOCKET_EVENTS.CHANNEL_ACCOUNT_UPDATED]: ChannelAccountUpdatedEvent;
  [SOCKET_EVENTS.CHANNEL_SYNC_STARTED]: ChannelSyncStatusEvent;
  [SOCKET_EVENTS.CHANNEL_SYNC_COMPLETED]: ChannelSyncStatusEvent;
  [SOCKET_EVENTS.CHANNEL_SYNC_ERROR]: ChannelSyncStatusEvent;
  [SOCKET_EVENTS.CHANNEL_MEDIA_PUBLISHED]: ChannelMediaPublishedEvent;
  [SOCKET_EVENTS.CHANNEL_COMMENT_RECEIVED]: ChannelCommentReceivedEvent;
  [SOCKET_EVENTS.CHANNEL_ACTIVITY_RECEIVED]: ChannelActivityReceivedEvent;

  // User Events
  [SOCKET_EVENTS.USER_TYPING]: UserTypingEvent;

  // Assignment Events
  [SOCKET_EVENTS.ASSIGNMENT_CREATED]: AssignmentCreatedEvent;
  [SOCKET_EVENTS.ASSIGNMENT_UPDATED]: AssignmentUpdatedEvent;

  // Contact Events
  [SOCKET_EVENTS.CONTACT_IDENTIFIERS_SYNCED]: ContactIdentifiersSyncedPayload;
  [SOCKET_EVENTS.CONTACT_SYNC_FAILED]: ContactSyncFailedPayload;

  // Integration Sync Events
  [SOCKET_EVENTS.INTEGRATION_SYNC_STARTED]: IntegrationSyncStartedEvent;
  [SOCKET_EVENTS.INTEGRATION_SYNC_PROGRESS]: IntegrationSyncProgressEvent;
  [SOCKET_EVENTS.INTEGRATION_SYNC_COMPLETED]: IntegrationSyncCompletedEvent;
  [SOCKET_EVENTS.INTEGRATION_SYNC_FAILED]: IntegrationSyncFailedEvent;

  // Database Sync Events
  [SOCKET_EVENTS.DATABASE_SYNC_STARTED]: DatabaseSyncStartedEvent;
  [SOCKET_EVENTS.DATABASE_SYNC_PROGRESS]: DatabaseSyncProgressEvent;
  [SOCKET_EVENTS.DATABASE_SYNC_COMPLETED]: DatabaseSyncCompletedEvent;
  [SOCKET_EVENTS.DATABASE_SYNC_FAILED]: DatabaseSyncFailedEvent;

  // Template Events
  [SOCKET_EVENTS.TEMPLATE_STATUS_UPDATED]: TemplateStatusUpdatedEvent;

  // AI Agent Events
  [SOCKET_EVENTS.AI_AGENT_EXECUTED]: AIAgentExecutedEvent;

  // Campaign Events
  [SOCKET_EVENTS.CAMPAIGN_MESSAGE_STATUS]: CampaignMessageStatusEvent;
  [SOCKET_EVENTS.CAMPAIGN_PROGRESS]: CampaignProgressEvent;
  [SOCKET_EVENTS.CAMPAIGN_COMPLETED]: CampaignCompletedEvent;

  // Team Chat Events
  [SOCKET_EVENTS.TEAM_MESSAGE]: TeamMessageEvent;
  [SOCKET_EVENTS.TEAM_MESSAGE_READ]: TeamMessageReadEvent;
  [SOCKET_EVENTS.TEAM_TYPING]: TeamTypingEvent;
  [SOCKET_EVENTS.TEAM_USER_ONLINE]: TeamUserOnlineEvent;
  [SOCKET_EVENTS.TEAM_USER_OFFLINE]: TeamUserOfflineEvent;
  [SOCKET_EVENTS.TEAM_UNREAD_COUNT]: TeamUnreadCountEvent;

  // Credit Payment Events
  [SOCKET_EVENTS.CREDIT_PAYMENT_CONFIRMED]: CreditPaymentConfirmedEvent;

  // Notification Sound (canal `sound` first-class)
  [SOCKET_EVENTS.NOTIFICATION_SOUND]: SoundNotificationEvent;

  // Lead Capture (QR Code)
  [SOCKET_EVENTS.LEAD_CAPTURE_SESSION_UPDATED]: LeadCaptureSessionUpdatedPayload;

  // Agentes internos (sala user:{dono da conversa})
  [SOCKET_EVENTS.INTERNAL_AGENT_RUN_STARTED]: InternalAgentRunStartedEvent;
  [SOCKET_EVENTS.INTERNAL_AGENT_RUN_DELTA]: InternalAgentRunDeltaEvent;
  [SOCKET_EVENTS.INTERNAL_AGENT_RUN_STEP]: InternalAgentRunStepEvent;
  [SOCKET_EVENTS.INTERNAL_AGENT_RUN_FINISHED]: InternalAgentRunFinishedEvent;
  [SOCKET_EVENTS.INTERNAL_AGENT_SESSION_UPDATED]: InternalAgentSessionUpdatedEvent;
  [SOCKET_EVENTS.INTERNAL_AGENT_SESSION_DELETED]: InternalAgentSessionDeletedEvent;
  [SOCKET_EVENTS.INTERNAL_AGENT_CONFIRMATION_UPDATED]: InternalAgentConfirmationUpdatedEvent;
}

// ============================================================================
// ROOM PATTERNS
// ============================================================================

export const SOCKET_ROOMS = {
  /**
   * Company room - all users of a company
   * Pattern: company:{companyId}
   */
  company: (companyId: string) => `company:${companyId}`,

  /**
   * Conversation room - users in a specific conversation
   * Pattern: conversation:{conversationId}
   */
  conversation: (conversationId: string) => `conversation:${conversationId}`,

  /**
   * User room - specific user
   * Pattern: user:{userId}
   */
  user: (userId: string) => `user:${userId}`,

  /**
   * Channel room - specific channel
   * Pattern: channel:{channelId}
   */
  channel: (channelId: string) => `channel:${channelId}`,
} as const;

// ============================================================================
// TYPE-SAFE HELPERS
// ============================================================================

/**
 * Type-safe event emitter helper
 *
 * @example
 * emitEvent(io, SOCKET_EVENTS.CONVERSATION_MESSAGE, {
 *   conversationId: '123',
 *   messageId: 'msg-456',
 *   content: 'Hello'
 * });
 */
export type EmitEvent = <K extends keyof SocketEventMap>(
  eventName: K,
  payload: SocketEventMap[K]
) => void;

/**
 * Type-safe event listener helper
 *
 * @example
 * onEvent(socket, SOCKET_EVENTS.CONVERSATION_MESSAGE, (data) => {
 *   console.log(data.conversationId); // TypeScript knows the structure
 * });
 */
export type OnEvent = <K extends keyof SocketEventMap>(
  eventName: K,
  handler: (payload: SocketEventMap[K]) => void
) => void;
