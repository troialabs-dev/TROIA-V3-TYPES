"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NOTIFICATION_TYPES = exports.FACTORY_EXCLUDED_NOTIFICATION_TYPES = exports.OPT_IN_FACTORY_NOTIFICATION_TYPES = exports.OPT_IN_NOTIFICATION_CHANNELS = exports.NOTIFICATION_TYPE_SUPPORTED_CHANNELS = exports.NotificationCategory = exports.NotificationPriority = exports.NotificationType = void 0;
exports.getSupportedChannelsForType = getSupportedChannelsForType;
exports.isOptInNotificationChannel = isOptInNotificationChannel;
exports.getDefaultNotificationTypesForChannel = getDefaultNotificationTypesForChannel;
// ============================================================================
// NOTIFICATION TYPES AND ENUMS
// ============================================================================
/**
 * Tipos de notificação disponíveis no sistema
 */
var NotificationType;
(function (NotificationType) {
    // System notifications
    NotificationType["SYSTEM_MAINTENANCE"] = "system_maintenance";
    NotificationType["SYSTEM_UPDATE"] = "system_update";
    NotificationType["SYSTEM_ALERT"] = "system_alert";
    // Authentication and security
    NotificationType["AUTH_FAILURE"] = "auth_failure";
    NotificationType["AUTH_SUCCESS"] = "auth_success";
    NotificationType["PASSWORD_RESET"] = "password_reset";
    NotificationType["TWO_FACTOR_ENABLED"] = "two_factor_enabled";
    // Integration events
    NotificationType["INTEGRATION_CONNECTED"] = "integration_connected";
    NotificationType["INTEGRATION_DISCONNECTED"] = "integration_disconnected";
    NotificationType["INTEGRATION_ERROR"] = "integration_error";
    NotificationType["CALENDAR_SYNC_COMPLETE"] = "calendar_sync_complete";
    NotificationType["CALENDAR_SYNC_FAILED"] = "calendar_sync_failed";
    // Channel events (System Alerts)
    NotificationType["CHANNEL_DISCONNECTED"] = "channel_disconnected";
    NotificationType["CHANNEL_CONNECTED"] = "channel_connected";
    // Ticket and conversation events
    NotificationType["TICKET_ASSIGNED"] = "ticket_assigned";
    NotificationType["TICKET_STATUS_CHANGED"] = "ticket_status_changed";
    NotificationType["TICKET_COMMENT_ADDED"] = "ticket_comment_added";
    // SLA (2026-08-15) — dois níveis nativos (decisão 9): aviso e violação.
    // O nível `l2` da política mapeia para SLA_BREACH com prioridade URGENT;
    // tudo além disso é gatilho de workflow por `slaBreachTime`.
    //
    // Nenhuma entrada em `NOTIFICATION_TYPE_SUPPORTED_CHANNELS`: o default de
    // `getSupportedChannelsForType` já é `['inApp','push','email','whatsapp']`,
    // que é exatamente o conjunto desejado — entrada no mapa só RESTRINGE.
    NotificationType["SLA_WARNING"] = "sla_warning";
    NotificationType["SLA_BREACH"] = "sla_breach";
    NotificationType["CONVERSATION_ASSIGNED"] = "conversation_assigned";
    NotificationType["CONVERSATION_MESSAGE_RECEIVED"] = "conversation_message_received";
    // Projects
    NotificationType["PROJECT_TASK_UNBLOCKED"] = "project_task_unblocked";
    NotificationType["PROJECT_TASK_COMPLETED"] = "project_task_completed";
    NotificationType["PROJECT_COMPLETED"] = "project_completed";
    NotificationType["PROJECT_TASK_OVERDUE"] = "project_task_overdue";
    // Lead events
    NotificationType["LEAD_ASSIGNED"] = "lead_assigned";
    NotificationType["LEAD_STATUS_CHANGED"] = "lead_status_changed";
    NotificationType["LEAD_ACTIVITY_ASSIGNED"] = "lead_activity_assigned";
    // Lead inactivity alerts (2026-07-17)
    NotificationType["LEAD_ALERT_WARNING"] = "lead_alert_warning";
    NotificationType["LEAD_ALERT_CRITICAL"] = "lead_alert_critical";
    NotificationType["LEAD_WEEKLY_DIGEST"] = "lead_weekly_digest";
    // Checklist events (modulo Checklists+Units)
    NotificationType["CHECKLIST_ASSIGNED"] = "checklist_assigned";
    NotificationType["CHECKLIST_DUE_SOON"] = "checklist_due_soon";
    NotificationType["CHECKLIST_EXPIRED"] = "checklist_expired";
    NotificationType["CHECKLIST_COMPLETED"] = "checklist_completed";
    NotificationType["CHECKLIST_APPROVED"] = "checklist_approved";
    NotificationType["CHECKLIST_REJECTED"] = "checklist_rejected";
    // Escalation events
    NotificationType["ESCALATION_TRIGGERED"] = "escalation_triggered";
    NotificationType["ESCALATION_REASSIGNED"] = "escalation_reassigned";
    // Payment events
    NotificationType["PAYMENT_RECEIVED"] = "payment_received";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["SUBSCRIPTION_RENEWED"] = "subscription_renewed";
    NotificationType["SUBSCRIPTION_EXPIRED"] = "subscription_expired";
    NotificationType["SUBSCRIPTION_CANCELED"] = "subscription_canceled";
    // Créditos acabando (2026-10-05): 70/80/90/100% de consumo desde a última
    // entrada de créditos, e os alertas que a empresa cadastra no Faturamento.
    NotificationType["CREDIT_USAGE_ALERT"] = "credit_usage_alert";
    // Team events
    NotificationType["TEAM_MEMBER_ADDED"] = "team_member_added";
    NotificationType["TEAM_MEMBER_REMOVED"] = "team_member_removed";
    NotificationType["SHIFT_REMINDER"] = "shift_reminder";
    // Calendar / agenda (2026-07-24)
    NotificationType["EVENT_REMINDER"] = "event_reminder";
    NotificationType["AGENDA_DAILY_SUMMARY"] = "agenda_daily_summary";
    // Automação (2026-08-22)
    NotificationType["WORKFLOW_AUTO_PAUSED"] = "workflow_auto_paused";
    // Campanhas e integrações (2026-08-27)
    NotificationType["CAMPAIGN_AUTO_PAUSED"] = "campaign_auto_paused";
    NotificationType["WORKFLOW_FREQUENT_FAILURES"] = "workflow_frequent_failures";
    // Custom notifications
    NotificationType["CUSTOM_NOTIFICATION"] = "custom_notification";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
/**
 * Prioridade da notificação
 */
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["NORMAL"] = "normal";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
/**
 * Categoria da notificação para organização
 */
var NotificationCategory;
(function (NotificationCategory) {
    NotificationCategory["SYSTEM"] = "system";
    NotificationCategory["SECURITY"] = "security";
    NotificationCategory["INTEGRATION"] = "integration";
    NotificationCategory["CHANNELS"] = "channels";
    NotificationCategory["TICKETS"] = "tickets";
    NotificationCategory["CONVERSATIONS"] = "conversations";
    NotificationCategory["LEADS"] = "leads";
    NotificationCategory["CHECKLISTS"] = "checklists";
    NotificationCategory["PAYMENT"] = "payment";
    NotificationCategory["TEAM"] = "team";
    NotificationCategory["CALENDAR"] = "calendar";
    NotificationCategory["AUTOMATION"] = "automation";
    NotificationCategory["CUSTOM"] = "custom";
})(NotificationCategory || (exports.NotificationCategory = NotificationCategory = {}));
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
exports.NOTIFICATION_TYPE_SUPPORTED_CHANNELS = {
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
function getSupportedChannelsForType(type) {
    const restricted = exports.NOTIFICATION_TYPE_SUPPORTED_CHANNELS[type];
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
exports.OPT_IN_NOTIFICATION_CHANNELS = ['email', 'whatsapp'];
/**
 * `true` quando o canal nasce de fábrica com lista VAZIA (nada marcado).
 * Ver `OPT_IN_NOTIFICATION_CHANNELS`.
 */
function isOptInNotificationChannel(channel) {
    return exports.OPT_IN_NOTIFICATION_CHANNELS.includes(channel);
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
exports.OPT_IN_FACTORY_NOTIFICATION_TYPES = [
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
exports.FACTORY_EXCLUDED_NOTIFICATION_TYPES = [
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
exports.DEFAULT_NOTIFICATION_TYPES = [
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
function getDefaultNotificationTypesForChannel(channel) {
    return isOptInNotificationChannel(channel)
        ? [...exports.OPT_IN_FACTORY_NOTIFICATION_TYPES]
        : [...exports.DEFAULT_NOTIFICATION_TYPES];
}
