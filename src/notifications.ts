import { ObjectId } from 'mongodb';

// ============================================================================
// NOTIFICATION TYPES AND ENUMS
// ============================================================================

/**
 * Tipos de notificação disponíveis no sistema
 */
export enum NotificationType {
  // System notifications
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  SYSTEM_ALERT = 'system_alert',

  // Authentication and security
  AUTH_FAILURE = 'auth_failure',
  AUTH_SUCCESS = 'auth_success',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',

  // Integration events
  INTEGRATION_CONNECTED = 'integration_connected',
  INTEGRATION_DISCONNECTED = 'integration_disconnected',
  INTEGRATION_ERROR = 'integration_error',
  CALENDAR_SYNC_COMPLETE = 'calendar_sync_complete',
  CALENDAR_SYNC_FAILED = 'calendar_sync_failed',

  // Channel events (System Alerts)
  CHANNEL_DISCONNECTED = 'channel_disconnected',
  CHANNEL_CONNECTED = 'channel_connected',

  // Ticket and conversation events
  TICKET_ASSIGNED = 'ticket_assigned',
  TICKET_STATUS_CHANGED = 'ticket_status_changed',
  TICKET_COMMENT_ADDED = 'ticket_comment_added',
  // SLA (2026-08-15) — dois níveis nativos (decisão 9): aviso e violação.
  // O nível `l2` da política mapeia para SLA_BREACH com prioridade URGENT;
  // tudo além disso é gatilho de workflow por `slaBreachTime`.
  //
  // Nenhuma entrada em `NOTIFICATION_TYPE_SUPPORTED_CHANNELS`: o default de
  // `getSupportedChannelsForType` já é `['inApp','push','email','whatsapp']`,
  // que é exatamente o conjunto desejado — entrada no mapa só RESTRINGE.
  SLA_WARNING = 'sla_warning',
  SLA_BREACH = 'sla_breach',
  CONVERSATION_ASSIGNED = 'conversation_assigned',
  CONVERSATION_MESSAGE_RECEIVED = 'conversation_message_received',

  // Projects
  PROJECT_TASK_UNBLOCKED = 'project_task_unblocked',
  PROJECT_TASK_COMPLETED = 'project_task_completed',
  PROJECT_COMPLETED = 'project_completed',
  PROJECT_TASK_OVERDUE = 'project_task_overdue',

  // Lead events
  LEAD_ASSIGNED = 'lead_assigned',
  LEAD_STATUS_CHANGED = 'lead_status_changed',
  LEAD_ACTIVITY_ASSIGNED = 'lead_activity_assigned',
  // Lead inactivity alerts (2026-07-17)
  LEAD_ALERT_WARNING = 'lead_alert_warning',
  LEAD_ALERT_CRITICAL = 'lead_alert_critical',
  LEAD_WEEKLY_DIGEST = 'lead_weekly_digest',

  // Checklist events (modulo Checklists+Units)
  CHECKLIST_ASSIGNED = 'checklist_assigned',
  CHECKLIST_DUE_SOON = 'checklist_due_soon',
  CHECKLIST_EXPIRED = 'checklist_expired',
  CHECKLIST_COMPLETED = 'checklist_completed',
  CHECKLIST_APPROVED = 'checklist_approved',
  CHECKLIST_REJECTED = 'checklist_rejected',

  // Escalation events
  ESCALATION_TRIGGERED = 'escalation_triggered',
  ESCALATION_REASSIGNED = 'escalation_reassigned',

  // Payment events
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  // Créditos acabando (2026-10-05): 70/80/90/100% de consumo desde a última
  // entrada de créditos, e os alertas que a empresa cadastra no Faturamento.
  CREDIT_USAGE_ALERT = 'credit_usage_alert',

  // Team events
  TEAM_MEMBER_ADDED = 'team_member_added',
  TEAM_MEMBER_REMOVED = 'team_member_removed',
  SHIFT_REMINDER = 'shift_reminder',

  // Calendar / agenda (2026-07-24)
  EVENT_REMINDER = 'event_reminder',            // Lembrete de evento (X min antes) — event.reminders
  AGENDA_DAILY_SUMMARY = 'agenda_daily_summary', // Resumo diário da agenda às 08:00

  // Automação (2026-08-22)
  WORKFLOW_AUTO_PAUSED = 'workflow_auto_paused', // Workflow pausado sozinho (10 falhas seguidas ou canal excluído)

  // Campanhas e integrações (2026-08-27)
  CAMPAIGN_AUTO_PAUSED = 'campaign_auto_paused', // Campanha pausada sozinha (canal desconectado ou excluído)
  WORKFLOW_FREQUENT_FAILURES = 'workflow_frequent_failures', // Workflow falhando com frequência (sem chegar a pausar)

  // Custom notifications
  CUSTOM_NOTIFICATION = 'custom_notification',
}

/**
 * Prioridade da notificação
 */
export enum NotificationPriority {
  LOW = 'low',          // Informacional, não urgente
  NORMAL = 'normal',    // Notificação padrão
  HIGH = 'high',        // Requer atenção
  URGENT = 'urgent',    // Requer ação imediata
}

/**
 * Categoria da notificação para organização
 */
export enum NotificationCategory {
  SYSTEM = 'system',
  SECURITY = 'security',
  INTEGRATION = 'integration',
  CHANNELS = 'channels',
  TICKETS = 'tickets',
  CONVERSATIONS = 'conversations',
  LEADS = 'leads',
  CHECKLISTS = 'checklists',
  PAYMENT = 'payment',
  TEAM = 'team',
  CALENDAR = 'calendar',
  AUTOMATION = 'automation',
  CUSTOM = 'custom',
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
export const NOTIFICATION_TYPE_SUPPORTED_CHANNELS: Partial<Record<NotificationType, NotificationChannel[]>> = {
  [NotificationType.CONVERSATION_MESSAGE_RECEIVED]: ['push', 'sound'],
  // Conversa Atribuída: SEM 'email' — não é oferecido na UI de preferências
  // nem despachado por email (quem já tinha ativado deixa de receber, pois o
  // dispatch filtra pelos canais suportados). Lead/Ticket atribuído mantêm email.
  [NotificationType.CONVERSATION_ASSIGNED]: ['inApp', 'push', 'whatsapp'],
  // Agenda: lembrete de evento respeita o método configurado no evento
  // (popup/notification → inApp/push; email → email). Resumo diário só in-app/push.
  [NotificationType.EVENT_REMINDER]: ['inApp', 'push', 'email'],
  [NotificationType.AGENDA_DAILY_SUMMARY]: ['inApp', 'push'],
  // Créditos acabando: sino, e-mail e WhatsApp (decisão do dono 05/10/2026) —
  // sem push nem som.
  [NotificationType.CREDIT_USAGE_ALERT]: ['inApp', 'email', 'whatsapp'],
};

/**
 * Retorna os canais suportados pra um tipo. Default: 4 canais clássicos
 * (sem `sound` — opt-in explícito via mapa).
 */
export function getSupportedChannelsForType(type: NotificationType | string): NotificationChannel[] {
  const restricted = NOTIFICATION_TYPE_SUPPORTED_CHANNELS[type as NotificationType];
  return restricted ?? ['inApp', 'push', 'email', 'whatsapp'];
}

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
export const OPT_IN_NOTIFICATION_CHANNELS: readonly NotificationChannel[] = ['email', 'whatsapp'];

/**
 * `true` quando o canal nasce de fábrica com lista VAZIA (nada marcado).
 * Ver `OPT_IN_NOTIFICATION_CHANNELS`.
 */
export function isOptInNotificationChannel(channel: NotificationChannel): boolean {
  return OPT_IN_NOTIFICATION_CHANNELS.includes(channel);
}

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
export const OPT_IN_FACTORY_NOTIFICATION_TYPES: readonly NotificationType[] = [
  NotificationType.CREDIT_USAGE_ALERT,
];

/**
 * Tipos deliberadamente FORA da lista de fábrica.
 *
 * Os avisos de SLA entraram em produção em 17/08/2026 sem ninguém ter pedido —
 * o atalho "usuário sem preferências recebe tudo" (removido no mesmo dia)
 * entregou 307 notificações para 41 usuários. Decisão do dono: SLA só chega em
 * quem ligar na tela.
 */
export const FACTORY_EXCLUDED_NOTIFICATION_TYPES: readonly NotificationType[] = [
  NotificationType.SLA_WARNING,
  NotificationType.SLA_BREACH,
];

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
export const DEFAULT_NOTIFICATION_TYPES: readonly NotificationType[] = [
  // System
  NotificationType.SYSTEM_MAINTENANCE,
  NotificationType.SYSTEM_UPDATE,
  NotificationType.SYSTEM_ALERT,
  // Auth / security
  NotificationType.AUTH_FAILURE,
  NotificationType.AUTH_SUCCESS,
  NotificationType.PASSWORD_RESET,
  NotificationType.TWO_FACTOR_ENABLED,
  // Integrations
  NotificationType.INTEGRATION_CONNECTED,
  NotificationType.INTEGRATION_DISCONNECTED,
  NotificationType.INTEGRATION_ERROR,
  NotificationType.CALENDAR_SYNC_COMPLETE,
  NotificationType.CALENDAR_SYNC_FAILED,
  // Channels
  NotificationType.CHANNEL_DISCONNECTED,
  NotificationType.CHANNEL_CONNECTED,
  // Tickets (SLA_WARNING / SLA_BREACH ficam de fora — ver excluded)
  NotificationType.TICKET_ASSIGNED,
  NotificationType.TICKET_STATUS_CHANGED,
  NotificationType.TICKET_COMMENT_ADDED,
  // Conversations
  NotificationType.CONVERSATION_ASSIGNED,
  NotificationType.CONVERSATION_MESSAGE_RECEIVED,
  // Projects
  NotificationType.PROJECT_TASK_UNBLOCKED,
  NotificationType.PROJECT_TASK_COMPLETED,
  NotificationType.PROJECT_COMPLETED,
  NotificationType.PROJECT_TASK_OVERDUE,
  // Leads
  NotificationType.LEAD_ASSIGNED,
  NotificationType.LEAD_STATUS_CHANGED,
  NotificationType.LEAD_ACTIVITY_ASSIGNED,
  NotificationType.LEAD_ALERT_WARNING,
  NotificationType.LEAD_ALERT_CRITICAL,
  NotificationType.LEAD_WEEKLY_DIGEST,
  // Checklists
  NotificationType.CHECKLIST_ASSIGNED,
  NotificationType.CHECKLIST_DUE_SOON,
  NotificationType.CHECKLIST_EXPIRED,
  NotificationType.CHECKLIST_COMPLETED,
  NotificationType.CHECKLIST_APPROVED,
  NotificationType.CHECKLIST_REJECTED,
  // Escalation
  NotificationType.ESCALATION_TRIGGERED,
  NotificationType.ESCALATION_REASSIGNED,
  // Payment
  NotificationType.PAYMENT_RECEIVED,
  NotificationType.PAYMENT_FAILED,
  NotificationType.SUBSCRIPTION_RENEWED,
  NotificationType.SUBSCRIPTION_EXPIRED,
  NotificationType.SUBSCRIPTION_CANCELED,
  // Créditos acabando — nasce marcado para usuário NOVO. SEGUNDA EXCEÇÃO à
  // regra do usuário existente (decisão do dono 05/10/2026): a migração
  // 2026-10-05-001 marcou este aviso, em sino, e-mail e WhatsApp, em quem já
  // existe e vê o módulo Empresa. Ver CLAUDE.md NUNCA #87.
  NotificationType.CREDIT_USAGE_ALERT,
  // Team
  NotificationType.TEAM_MEMBER_ADDED,
  NotificationType.TEAM_MEMBER_REMOVED,
  NotificationType.SHIFT_REMINDER,
  // Calendar / agenda
  NotificationType.EVENT_REMINDER,
  NotificationType.AGENDA_DAILY_SUMMARY,
  // Automação — nasce marcado para usuário NOVO (decisão do dono 22/08). EXCEÇÃO
  // em 15/09/2026: a migração 2026-09-15-001 marcou estes dois em quem já
  // existe e tem `workflows:update` (pausa de 01/09 passou calada e virou
  // 2.525 leads duplicados). Ver CLAUDE.md NUNCA #87.
  NotificationType.WORKFLOW_AUTO_PAUSED,
  NotificationType.WORKFLOW_FREQUENT_FAILURES,
  // Campanha — mesma regra: marcado para usuário NOVO, existente marca na tela
  // (decisão do dono 27/08). Avisa sobre campanha que PAROU sozinha e que
  // ninguém descobria sem olhar o log.
  NotificationType.CAMPAIGN_AUTO_PAUSED,
  // Custom
  NotificationType.CUSTOM_NOTIFICATION,
];

/**
 * Lista de fábrica do canal: sino/push/som recebem `DEFAULT_NOTIFICATION_TYPES`,
 * e-mail/WhatsApp nascem só com `OPT_IN_FACTORY_NOTIFICATION_TYPES`.
 *
 * Retorna cópia mutável — o chamador grava no documento do usuário.
 */
export function getDefaultNotificationTypesForChannel(
  channel: NotificationChannel,
): NotificationType[] {
  return isOptInNotificationChannel(channel)
    ? [...OPT_IN_FACTORY_NOTIFICATION_TYPES]
    : [...DEFAULT_NOTIFICATION_TYPES];
}

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
  providerId?: string;        // ID do provider usado (ex: 'email-smtp', 'whatsapp-gateway')
  providerResponse?: unknown;     // Resposta do provider (MessageID, etc.)
}

// ============================================================================
// NOTIFICATION ENTITY
// ============================================================================

/**
 * Entidade de notificação (Database schema)
 */
export interface SystemNotification {
  _id?: ObjectId;
  appId: ObjectId;
  companyId: ObjectId;
  userId: string;                           // Destinatário da notificação

  // Conteúdo da notificação
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;               // Dados adicionais (IDs de recursos, metadados)

  // Canais e status de entrega
  channels: NotificationChannel[];          // Canais solicitados para envio
  deliveryStatus: ChannelDeliveryStatus[];  // Status por canal

  // Estado da notificação
  read: boolean;                            // Lida pelo usuário (inApp)
  readAt?: Date;                            // Data de leitura (inApp)
  archived: boolean;                        // Arquivada pelo usuário
  archivedAt?: Date;

  // Action link (opcional)
  actionUrl?: string;                       // URL para ação (ex: /tickets/123)
  actionLabel?: string;                     // Label do botão (ex: "Ver Ticket")

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;                         // Data de expiração (auto-delete)
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

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
  channels?: NotificationChannel[];         // Se não informado, usa preferências do user
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;                        // ISO date string from client
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
  read?: boolean;                           // Filtrar por lidas/não lidas
  archived?: boolean;                       // Filtrar por arquivadas
  type?: NotificationType;                  // Filtrar por tipo
  category?: NotificationCategory;          // Filtrar por categoria
  priority?: NotificationPriority;          // Filtrar por prioridade
  dateFrom?: string;                        // Data de criação (ISO string)
  dateTo?: string;
}

/**
 * Request para marcar notificação como lida
 */
export interface MarkNotificationsAsReadRequest {
  notificationIds: string[];                // Array de IDs para bulk update
}

/**
 * Request para arquivar notificação
 */
export interface ArchiveNotificationRequest {
  notificationIds: string[];                // Array de IDs para bulk update
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

// ============================================================================
// SOCKET.IO EVENTS (InApp Channel)
// ============================================================================

/**
 * Payload do evento Socket.IO para nova notificação
 */
export interface InAppNotificationEvent {
  notification: NotificationResponse;
  unreadCount: number;                      // Contador atualizado de não lidas
}

/**
 * Payload do evento Socket.IO para marcar como lida
 */
export interface NotificationReadEvent {
  notificationIds: string[];
  unreadCount: number;
}
