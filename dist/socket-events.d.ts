/**
 * Socket.IO Event Types - Shared between Frontend and Backend
 *
 * Prevents event name mismatches and ensures type safety for socket events
 */
import type { SoundKey } from './notifications';
import type { ChannelDisconnectInfo } from './channels';
import type { ChannelSyncStatus, ChannelActivityType } from './channel-dashboard';
import type { LeadCaptureSession } from './lead-capture';
import type { InternalAgentRunStartedEvent, InternalAgentRunDeltaEvent, InternalAgentRunStepEvent, InternalAgentRunFinishedEvent, InternalAgentSessionUpdatedEvent, InternalAgentSessionDeletedEvent, InternalAgentConfirmationUpdatedEvent } from './internal-agents';
export declare const SOCKET_EVENTS: {
    readonly CONVERSATION_MESSAGE: "conversation:message";
    readonly CONVERSATION_UPDATED: "conversation:updated";
    readonly CONVERSATION_DELETED: "conversation:deleted";
    readonly CONVERSATION_OPEN: "conversation:open";
    readonly CONVERSATION_UNREAD_RESET: "conversation:unread-reset";
    readonly CONVERSATION_ERROR: "conversation:error";
    readonly UNREAD_COUNT_UPDATE: "unread-count:update";
    readonly CONVERSATION_MESSAGE_NOTIFY: "conversation:message:notify";
    readonly MESSAGE_STATUS: "message:status";
    readonly MESSAGE_DELIVERED: "message:delivered";
    readonly MESSAGE_READ: "message:read";
    readonly MESSAGE_DELETED: "message:deleted";
    readonly MESSAGE_REACTION: "message:reaction";
    readonly MESSAGE_EDITED: "message:edited";
    readonly MESSAGE_TRANSCRIBED: "message:transcribed";
    readonly CHANNEL_QR: "channel:qr";
    readonly CHANNEL_CONNECTED: "channel:connected";
    readonly CHANNEL_DISCONNECTED: "channel:disconnected";
    readonly CHANNEL_ACCOUNT_UPDATED: "channel:account-updated";
    readonly CHANNEL_SYNC_STARTED: "channel:sync-started";
    readonly CHANNEL_SYNC_COMPLETED: "channel:sync-completed";
    readonly CHANNEL_SYNC_ERROR: "channel:sync-error";
    readonly CHANNEL_MEDIA_PUBLISHED: "channel:media-published";
    readonly CHANNEL_COMMENT_RECEIVED: "channel:comment-received";
    readonly CHANNEL_ACTIVITY_RECEIVED: "channel:activity-received";
    readonly USER_TYPING: "user:typing";
    readonly USER_ONLINE: "user:online";
    readonly USER_OFFLINE: "user:offline";
    readonly ASSIGNMENT_CREATED: "assignment:created";
    readonly ASSIGNMENT_UPDATED: "assignment:updated";
    readonly ASSIGNMENT_COMPLETED: "assignment:completed";
    readonly CONTACT_IDENTIFIERS_SYNCED: "contact:identifiers:synced";
    readonly CONTACT_SYNC_FAILED: "contact:sync:failed";
    readonly INTEGRATION_SYNC_STARTED: "integration:sync-started";
    readonly INTEGRATION_SYNC_PROGRESS: "integration:sync-progress";
    readonly INTEGRATION_SYNC_COMPLETED: "integration:sync-completed";
    readonly INTEGRATION_SYNC_FAILED: "integration:sync-failed";
    readonly DATABASE_SYNC_STARTED: "database:sync-started";
    readonly DATABASE_SYNC_PROGRESS: "database:sync-progress";
    readonly DATABASE_SYNC_COMPLETED: "database:sync-completed";
    readonly DATABASE_SYNC_FAILED: "database:sync-failed";
    readonly NOTIFICATION_NEW: "notification:new";
    readonly NOTIFICATION_READ: "notification:read";
    readonly NOTIFICATION_SOUND: "notification:sound";
    readonly TEMPLATE_STATUS_UPDATED: "template:status-updated";
    readonly AI_AGENT_EXECUTED: "ai:agent:executed";
    readonly CAMPAIGN_MESSAGE_STATUS: "campaign:message-status";
    readonly CAMPAIGN_PROGRESS: "campaign:progress";
    readonly CAMPAIGN_COMPLETED: "campaign:completed";
    readonly AUDIENCE_IMPORT_STARTED: "audience:import-started";
    readonly AUDIENCE_IMPORT_PROGRESS: "audience:import-progress";
    readonly AUDIENCE_IMPORT_COMPLETED: "audience:import-completed";
    readonly AUDIENCE_IMPORT_FAILED: "audience:import-failed";
    readonly TEAM_MESSAGE: "team:message";
    readonly TEAM_MESSAGE_READ: "team:message:read";
    readonly TEAM_TYPING: "team:typing";
    readonly TEAM_USER_ONLINE: "team:user:online";
    readonly TEAM_USER_OFFLINE: "team:user:offline";
    readonly TEAM_UNREAD_COUNT: "team:unread-count";
    readonly TEAM_HEARTBEAT: "team:heartbeat";
    readonly CREDIT_PAYMENT_CONFIRMED: "credit:payment:confirmed";
    readonly HISTORY_IMPORT_QR: "history-import:qr";
    readonly HISTORY_IMPORT_STATUS: "history-import:status";
    readonly HISTORY_IMPORT_PROGRESS: "history-import:progress";
    readonly HISTORY_IMPORT_COMPLETED: "history-import:completed";
    readonly HISTORY_IMPORT_FAILED: "history-import:failed";
    readonly LEAD_CAPTURE_SESSION_UPDATED: "lead-capture:session-updated";
    readonly INTERNAL_AGENT_RUN_STARTED: "internal-agent:run-started";
    readonly INTERNAL_AGENT_RUN_DELTA: "internal-agent:run-delta";
    readonly INTERNAL_AGENT_RUN_STEP: "internal-agent:run-step";
    readonly INTERNAL_AGENT_RUN_FINISHED: "internal-agent:run-finished";
    readonly INTERNAL_AGENT_SESSION_UPDATED: "internal-agent:session-updated";
    readonly INTERNAL_AGENT_SESSION_DELETED: "internal-agent:session-deleted";
    readonly INTERNAL_AGENT_CONFIRMATION_UPDATED: "internal-agent:confirmation-updated";
};
export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
/**
 * Conversation Message Event
 * Emitted when a new message is received in a conversation
 */
export interface ConversationMessageEvent {
    conversationId: string;
    messageId: string;
    direction: 'inbound' | 'outbound';
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
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
        name?: string;
    };
    contact?: {
        name: string;
        phone?: string;
        email?: string;
        vcard?: string;
    };
    reaction?: {
        emoji: string;
        targetMessageId: string;
    };
    isForwarded?: boolean;
    forwardedFromMessageId?: string;
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
    messageId: string;
    providerMessageId?: string;
    conversationId?: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    failedReason?: string;
    failedCode?: number;
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
    messageId: string;
    reaction: {
        emoji: string;
        userId?: string;
        userName?: string;
        remoteJid?: string;
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
    messageId: string;
    newContent: unknown;
    newPlainText: string;
    editedAt: string;
    source: 'webhook' | 'ui';
}
/**
 * Message Transcribed Event
 * Emitido quando a transcrição STT de um áudio/vídeo é gerada sob demanda e
 * salva no plainText da mensagem. Frontend deve atualizar apenas o plainText
 * (NÃO marca a mensagem como editada).
 */
export interface MessageTranscribedEvent {
    conversationId: string;
    messageId: string;
    plainText: string;
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
    messageId: string;
    deletedAt: string;
    source: 'webhook' | 'ui';
    deleteForEveryone?: boolean;
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
    identifier: string;
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
    userId: string;
    totalUnread: number;
    byType: {
        ai: number;
        individual: number;
        group: number;
        email: number;
    };
    timestamp: string;
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
    totalItems?: number;
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
    itemType: 'event' | 'contact' | 'email' | 'task';
    message?: string;
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
    duration: number;
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
    message?: string;
    timestamp: string;
}
/**
 * Database Sync Completed Event
 * Server-to-Client: Database sync completed successfully
 */
export interface DatabaseSyncCompletedEvent {
    integrationId: string;
    itemsSynced: number;
    duration: number;
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
    messageId: string;
    providerMessageId?: string;
    recipientIdentifier: string;
    recipientName?: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    previousStatus?: string;
    timestamp: string;
    failureReason?: string;
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
        messagesProcessing: number;
    };
    percentComplete: number;
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
    byUser: Record<string, number>;
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
    duration: number;
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
export interface SocketEventMap {
    [SOCKET_EVENTS.CONVERSATION_MESSAGE]: ConversationMessageEvent;
    [SOCKET_EVENTS.CONVERSATION_MESSAGE_NOTIFY]: ConversationMessageNotifyEvent;
    [SOCKET_EVENTS.CONVERSATION_UPDATED]: ConversationUpdatedEvent;
    [SOCKET_EVENTS.CONVERSATION_DELETED]: ConversationDeletedEvent;
    [SOCKET_EVENTS.CONVERSATION_OPEN]: ConversationOpenEvent;
    [SOCKET_EVENTS.CONVERSATION_UNREAD_RESET]: ConversationUnreadResetEvent;
    [SOCKET_EVENTS.CONVERSATION_ERROR]: ConversationErrorEvent;
    [SOCKET_EVENTS.UNREAD_COUNT_UPDATE]: UnreadCountUpdateEvent;
    [SOCKET_EVENTS.MESSAGE_STATUS]: MessageStatusEvent;
    [SOCKET_EVENTS.MESSAGE_DELIVERED]: MessageDeliveredEvent;
    [SOCKET_EVENTS.MESSAGE_READ]: MessageReadEvent;
    [SOCKET_EVENTS.MESSAGE_REACTION]: MessageReactionEvent;
    [SOCKET_EVENTS.MESSAGE_EDITED]: MessageEditedEvent;
    [SOCKET_EVENTS.MESSAGE_TRANSCRIBED]: MessageTranscribedEvent;
    [SOCKET_EVENTS.MESSAGE_DELETED]: MessageDeletedEvent;
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
    [SOCKET_EVENTS.USER_TYPING]: UserTypingEvent;
    [SOCKET_EVENTS.ASSIGNMENT_CREATED]: AssignmentCreatedEvent;
    [SOCKET_EVENTS.ASSIGNMENT_UPDATED]: AssignmentUpdatedEvent;
    [SOCKET_EVENTS.CONTACT_IDENTIFIERS_SYNCED]: ContactIdentifiersSyncedPayload;
    [SOCKET_EVENTS.CONTACT_SYNC_FAILED]: ContactSyncFailedPayload;
    [SOCKET_EVENTS.INTEGRATION_SYNC_STARTED]: IntegrationSyncStartedEvent;
    [SOCKET_EVENTS.INTEGRATION_SYNC_PROGRESS]: IntegrationSyncProgressEvent;
    [SOCKET_EVENTS.INTEGRATION_SYNC_COMPLETED]: IntegrationSyncCompletedEvent;
    [SOCKET_EVENTS.INTEGRATION_SYNC_FAILED]: IntegrationSyncFailedEvent;
    [SOCKET_EVENTS.DATABASE_SYNC_STARTED]: DatabaseSyncStartedEvent;
    [SOCKET_EVENTS.DATABASE_SYNC_PROGRESS]: DatabaseSyncProgressEvent;
    [SOCKET_EVENTS.DATABASE_SYNC_COMPLETED]: DatabaseSyncCompletedEvent;
    [SOCKET_EVENTS.DATABASE_SYNC_FAILED]: DatabaseSyncFailedEvent;
    [SOCKET_EVENTS.TEMPLATE_STATUS_UPDATED]: TemplateStatusUpdatedEvent;
    [SOCKET_EVENTS.AI_AGENT_EXECUTED]: AIAgentExecutedEvent;
    [SOCKET_EVENTS.CAMPAIGN_MESSAGE_STATUS]: CampaignMessageStatusEvent;
    [SOCKET_EVENTS.CAMPAIGN_PROGRESS]: CampaignProgressEvent;
    [SOCKET_EVENTS.CAMPAIGN_COMPLETED]: CampaignCompletedEvent;
    [SOCKET_EVENTS.TEAM_MESSAGE]: TeamMessageEvent;
    [SOCKET_EVENTS.TEAM_MESSAGE_READ]: TeamMessageReadEvent;
    [SOCKET_EVENTS.TEAM_TYPING]: TeamTypingEvent;
    [SOCKET_EVENTS.TEAM_USER_ONLINE]: TeamUserOnlineEvent;
    [SOCKET_EVENTS.TEAM_USER_OFFLINE]: TeamUserOfflineEvent;
    [SOCKET_EVENTS.TEAM_UNREAD_COUNT]: TeamUnreadCountEvent;
    [SOCKET_EVENTS.CREDIT_PAYMENT_CONFIRMED]: CreditPaymentConfirmedEvent;
    [SOCKET_EVENTS.NOTIFICATION_SOUND]: SoundNotificationEvent;
    [SOCKET_EVENTS.LEAD_CAPTURE_SESSION_UPDATED]: LeadCaptureSessionUpdatedPayload;
    [SOCKET_EVENTS.INTERNAL_AGENT_RUN_STARTED]: InternalAgentRunStartedEvent;
    [SOCKET_EVENTS.INTERNAL_AGENT_RUN_DELTA]: InternalAgentRunDeltaEvent;
    [SOCKET_EVENTS.INTERNAL_AGENT_RUN_STEP]: InternalAgentRunStepEvent;
    [SOCKET_EVENTS.INTERNAL_AGENT_RUN_FINISHED]: InternalAgentRunFinishedEvent;
    [SOCKET_EVENTS.INTERNAL_AGENT_SESSION_UPDATED]: InternalAgentSessionUpdatedEvent;
    [SOCKET_EVENTS.INTERNAL_AGENT_SESSION_DELETED]: InternalAgentSessionDeletedEvent;
    [SOCKET_EVENTS.INTERNAL_AGENT_CONFIRMATION_UPDATED]: InternalAgentConfirmationUpdatedEvent;
}
export declare const SOCKET_ROOMS: {
    /**
     * Company room - all users of a company
     * Pattern: company:{companyId}
     */
    readonly company: (companyId: string) => string;
    /**
     * Conversation room - users in a specific conversation
     * Pattern: conversation:{conversationId}
     */
    readonly conversation: (conversationId: string) => string;
    /**
     * User room - specific user
     * Pattern: user:{userId}
     */
    readonly user: (userId: string) => string;
    /**
     * Channel room - specific channel
     * Pattern: channel:{channelId}
     */
    readonly channel: (channelId: string) => string;
};
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
export type EmitEvent = <K extends keyof SocketEventMap>(eventName: K, payload: SocketEventMap[K]) => void;
/**
 * Type-safe event listener helper
 *
 * @example
 * onEvent(socket, SOCKET_EVENTS.CONVERSATION_MESSAGE, (data) => {
 *   console.log(data.conversationId); // TypeScript knows the structure
 * });
 */
export type OnEvent = <K extends keyof SocketEventMap>(eventName: K, handler: (payload: SocketEventMap[K]) => void) => void;
