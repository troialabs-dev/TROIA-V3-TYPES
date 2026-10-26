import { ObjectId } from 'mongodb';
/**
 * Tipos de notificação disponíveis no sistema
 */
export declare enum NotificationType {
    SYSTEM_MAINTENANCE = "system_maintenance",
    SYSTEM_UPDATE = "system_update",
    SYSTEM_ALERT = "system_alert",
    AUTH_FAILURE = "auth_failure",
    AUTH_SUCCESS = "auth_success",
    PASSWORD_RESET = "password_reset",
    TWO_FACTOR_ENABLED = "two_factor_enabled",
    INTEGRATION_CONNECTED = "integration_connected",
    INTEGRATION_DISCONNECTED = "integration_disconnected",
    INTEGRATION_ERROR = "integration_error",
    CALENDAR_SYNC_COMPLETE = "calendar_sync_complete",
    CALENDAR_SYNC_FAILED = "calendar_sync_failed",
    CHANNEL_DISCONNECTED = "channel_disconnected",
    CHANNEL_CONNECTED = "channel_connected",
    TICKET_ASSIGNED = "ticket_assigned",
    TICKET_STATUS_CHANGED = "ticket_status_changed",
    TICKET_COMMENT_ADDED = "ticket_comment_added",
    SLA_WARNING = "sla_warning",
    SLA_BREACH = "sla_breach",
    CONVERSATION_ASSIGNED = "conversation_assigned",
    CONVERSATION_MESSAGE_RECEIVED = "conversation_message_received",
    PROJECT_TASK_UNBLOCKED = "project_task_unblocked",
    PROJECT_TASK_COMPLETED = "project_task_completed",
    PROJECT_COMPLETED = "project_completed",
    PROJECT_TASK_OVERDUE = "project_task_overdue",
    LEAD_ASSIGNED = "lead_assigned",
    LEAD_STATUS_CHANGED = "lead_status_changed",
    LEAD_ACTIVITY_ASSIGNED = "lead_activity_assigned",
    LEAD_ALERT_WARNING = "lead_alert_warning",
    LEAD_ALERT_CRITICAL = "lead_alert_critical",
    LEAD_WEEKLY_DIGEST = "lead_weekly_digest",
    CHECKLIST_ASSIGNED = "checklist_assigned",
    CHECKLIST_DUE_SOON = "checklist_due_soon",
    CHECKLIST_EXPIRED = "checklist_expired",
    CHECKLIST_COMPLETED = "checklist_completed",
    CHECKLIST_APPROVED = "checklist_approved",
    CHECKLIST_REJECTED = "checklist_rejected",
    ESCALATION_TRIGGERED = "escalation_triggered",
    ESCALATION_REASSIGNED = "escalation_reassigned",
    PAYMENT_RECEIVED = "payment_received",
    PAYMENT_FAILED = "payment_failed",
    SUBSCRIPTION_RENEWED = "subscription_renewed",
    SUBSCRIPTION_EXPIRED = "subscription_expired",
    SUBSCRIPTION_CANCELED = "subscription_canceled",
    CREDIT_USAGE_ALERT = "credit_usage_alert",
    TEAM_MEMBER_ADDED = "team_member_added",
    TEAM_MEMBER_REMOVED = "team_member_removed",
    SHIFT_REMINDER = "shift_reminder",
    EVENT_REMINDER = "event_reminder",// Lembrete de evento (X min antes) — event.reminders
    AGENDA_DAILY_SUMMARY = "agenda_daily_summary",// Resumo diário da agenda às 08:00
    WORKFLOW_AUTO_PAUSED = "workflow_auto_paused",// Workflow pausado sozinho (10 falhas seguidas ou canal excluído)
    CAMPAIGN_AUTO_PAUSED = "campaign_auto_paused",// Campanha pausada sozinha (canal desconectado ou excluído)
    WORKFLOW_FREQUENT_FAILURES = "workflow_frequent_failures",// Workflow falhando com frequência (sem chegar a pausar)
    CUSTOM_NOTIFICATION = "custom_notification"
}
/**
 * Prioridade da notificação
 */
export declare enum NotificationPriority {
    LOW = "low",// Informacional, não urgente
    NORMAL = "normal",// Notificação padrão
    HIGH = "high",// Requer atenção
    URGENT = "urgent"
}
/**
 * Categoria da notificação para organização
 */
export declare enum NotificationCategory {
    SYSTEM = "system",
    SECURITY = "security",
    INTEGRATION = "integration",
    CHANNELS = "channels",
    TICKETS = "tickets",
    CONVERSATIONS = "conversations",
    LEADS = "leads",
    CHECKLISTS = "checklists",
    PAYMENT = "payment",
    TEAM = "team",
    CALENDAR = "calendar",
    AUTOMATION = "automation",
    CUSTOM = "custom"
}
/**
 * Canais de entrega disponíveis
 *
 * `sound` é canal first-class (2026-04-29): emite socket `notification:sound`
 * dedicado pra tocar áudio no cliente. Respeita preferences igual aos outros.
 */
export type NotificationChannel = 'email' | 'whatsapp' | 'push' | 'inApp' | 'sound';
/**
 * Sound keys disponíveis pro canal `sound`. Cada chave corresponde a um
 * arquivo de áudio em `public/assets/notifications/audio/` no frontend.
 *
 * O backend (`resolveSoundKey`) decide qual chave usar baseado em
 * `notification.type` + dados auxiliares. Adicionar tipo com som novo:
 *   1. registrar `'sound'` em NOTIFICATION_TYPE_SUPPORTED_CHANNELS
 *   2. acrescentar entrada nesse union (se for som novo)
 *   3. estender `resolveSoundKey` no backend
 *   4. registrar player no mapping `players` do frontend
 */
export type SoundKey = 'message' | 'queue' | 'lead' | 'ticket' | 'alert';
/**
 * Canais suportados por tipo de notificação.
 *
 * Mapa sparse: tipos AUSENTES aqui aceitam o conjunto default abaixo
 * (`['inApp', 'push', 'email', 'whatsapp']`). `'sound'` NÃO está no default —
 * é uma allowlist conservadora: cada tipo precisa listá-lo explicitamente
 * pra ganhar checkbox na UI de preferências e dispatch no backend. Hoje só
 * `CONVERSATION_MESSAGE_RECEIVED` declara, mas o caminho está aberto pra
 * outros tipos (ex: `TICKET_ASSIGNED`).
 */
export declare const NOTIFICATION_TYPE_SUPPORTED_CHANNELS: Partial<Record<NotificationType, NotificationChannel[]>>;
/**
 * Retorna os canais suportados pra um tipo. Default: 4 canais clássicos
 * (sem `sound` — opt-in explícito via mapa).
 */
export declare function getSupportedChannelsForType(type: NotificationType | string): NotificationChannel[];
/**
 * Canais que nascem **quase sem nenhum tipo marcado** na lista de fábrica
 * (`getDefaultNotificationTypesForChannel`): e-mail e WhatsApp custam dinheiro
 * e invadem canal pessoal, então o usuário precisa marcar o que quer receber.
 * A única coisa que nasce marcada neles é `OPT_IN_FACTORY_NOTIFICATION_TYPES`.
 *
 * ⚠️ Mudança de papel em 2026-08-17 (REGRA ÚNICA de despacho): esta lista NÃO
 * decide mais nada no dispatch. Desde a regra única, `types` ausente ou vazio
 * significa "nada" em TODOS os canais — não existe mais semântica dupla por
 * canal (o antigo `undefinedMeansAll` morreu junto com o atalho
 * "sem preferências → recebe tudo"). O que sobrou aqui é exclusivamente a
 * composição da lista de FÁBRICA de um usuário novo.
 */
export declare const OPT_IN_NOTIFICATION_CHANNELS: readonly NotificationChannel[];
/**
 * `true` quando o canal nasce de fábrica com lista VAZIA (nada marcado).
 * Ver `OPT_IN_NOTIFICATION_CHANNELS`.
 */
export declare function isOptInNotificationChannel(channel: NotificationChannel): boolean;
/**
 * Avisos que nascem marcados TAMBÉM em e-mail e WhatsApp (2026-10-05).
 *
 * Lista deliberadamente mínima. O aviso de créditos acabando entrou aqui por
 * decisão do dono: em 29/09–05/10/2026 uma empresa ficou com saldo negativo
 * três vezes e 86 respostas de atendentes falharam por falta de créditos sem
 * ninguém ter sido avisado. Um aviso desses que só chega no sino não alcança
 * quem não está com o sistema aberto. O usuário continua podendo desmarcar.
 *
 * Acrescentar um tipo aqui é decidir que TODO usuário novo passa a receber
 * e-mail e WhatsApp dele sem ter pedido — mesma régua de
 * `DEFAULT_NOTIFICATION_TYPES`: decisão consciente, nunca de carona.
 */
export declare const OPT_IN_FACTORY_NOTIFICATION_TYPES: readonly NotificationType[];
/**
 * Tipos deliberadamente FORA da lista de fábrica.
 *
 * Os avisos de SLA entraram em produção em 17/08/2026 sem ninguém ter pedido —
 * o atalho "usuário sem preferências recebe tudo" (removido no mesmo dia)
 * entregou 307 notificações para 41 usuários. Decisão do dono: SLA só chega em
 * quem ligar na tela.
 */
export declare const FACTORY_EXCLUDED_NOTIFICATION_TYPES: readonly NotificationType[];
/**
 * **Lista de fábrica** dos canais sino/push/som (2026-08-17).
 *
 * É a lista gravada em usuário novo (`buildDefaultNotificationPreferences`) e
 * nos canais sem lista durante a migração `2026-08-17-002`. Contém TODOS os
 * tipos existentes hoje EXCETO `FACTORY_EXCLUDED_NOTIFICATION_TYPES` — o que
 * preserva exatamente o que um usuário sem preferências recebia pelo atalho
 * antigo, menos os avisos de SLA.
 *
 * ⚠️ Lista EXPLÍCITA de propósito, nunca derivada de `Object.values`. Tipo novo
 * no enum NÃO entra aqui de carona: o precedente "migração marca o tipo novo
 * nas listas de todo mundo" (`2026-08-15-005`) foi REVOGADO pelo dono. Quem
 * adiciona um tipo decide conscientemente se ele nasce marcado para usuários
 * NOVOS (entra aqui) ou fica desligado até alguém marcar na tela (entra em
 * `FACTORY_EXCLUDED_NOTIFICATION_TYPES`). Usuário EXISTENTE nunca é marcado
 * automaticamente, em nenhum dos dois casos.
 *
 * O teste `tests/unit/notifications/factory-defaults.test.ts` (backend) falha
 * quando o enum cresce sem que o tipo novo apareça em uma das duas listas —
 * é ele que força a decisão em vez de deixá-la passar em branco.
 */
export declare const DEFAULT_NOTIFICATION_TYPES: readonly NotificationType[];
/**
 * Lista de fábrica do canal: sino/push/som recebem `DEFAULT_NOTIFICATION_TYPES`,
 * e-mail/WhatsApp nascem só com `OPT_IN_FACTORY_NOTIFICATION_TYPES`.
 *
 * Retorna cópia mutável — o chamador grava no documento do usuário.
 */
export declare function getDefaultNotificationTypesForChannel(channel: NotificationChannel): NotificationType[];
/**
 * Status de entrega por canal
 */
export interface ChannelDeliveryStatus {
    channel: NotificationChannel;
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    error?: string;
    providerId?: string;
    providerResponse?: unknown;
}
/**
 * Entidade de notificação (Database schema)
 */
export interface SystemNotification {
    _id?: ObjectId;
    appId: ObjectId;
    companyId: ObjectId;
    userId: string;
    type: NotificationType;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    channels: NotificationChannel[];
    deliveryStatus: ChannelDeliveryStatus[];
    read: boolean;
    readAt?: Date;
    archived: boolean;
    archivedAt?: Date;
    actionUrl?: string;
    actionLabel?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
}
/**
 * Request para criar notificação
 */
export interface CreateNotificationRequest {
    userId: string;
    type: NotificationType;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    channels?: NotificationChannel[];
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
}
/**
 * Response de notificação (API)
 */
export interface NotificationResponse extends Omit<SystemNotification, '_id' | 'appId' | 'companyId' | 'createdAt' | 'updatedAt' | 'readAt' | 'archivedAt' | 'expiresAt'> {
    id: string;
    appId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    readAt?: string;
    archivedAt?: string;
    expiresAt?: string;
}
/**
 * Response de listagem de notificações
 */
export interface NotificationListResponse {
    notifications: NotificationResponse[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
}
/**
 * Query parameters para listagem de notificações
 */
export interface NotificationQuery {
    page?: number;
    limit?: number;
    read?: boolean;
    archived?: boolean;
    type?: NotificationType;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    dateFrom?: string;
    dateTo?: string;
}
/**
 * Request para marcar notificação como lida
 */
export interface MarkNotificationsAsReadRequest {
    notificationIds: string[];
}
/**
 * Request para arquivar notificação
 */
export interface ArchiveNotificationRequest {
    notificationIds: string[];
}
/**
 * Estatísticas de notificações (Dashboard)
 */
export interface NotificationStats {
    total: number;
    unread: number;
    byCategory: Record<NotificationCategory, number>;
    byPriority: Record<NotificationPriority, number>;
    recentNotifications: NotificationResponse[];
}
/**
 * Payload do evento Socket.IO para nova notificação
 */
export interface InAppNotificationEvent {
    notification: NotificationResponse;
    unreadCount: number;
}
/**
 * Payload do evento Socket.IO para marcar como lida
 */
export interface NotificationReadEvent {
    notificationIds: string[];
    unreadCount: number;
}
