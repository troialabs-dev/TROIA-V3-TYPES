"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignMessageStatus = exports.SCHEDULING_TYPE_LABELS = exports.SchedulingType = exports.AUDIENCE_TYPE_LABELS = exports.AudienceType = exports.CampaignStatus = exports.CAMPAIGN_AUTO_PAUSE_REASONS = exports.CAMPAIGN_REPLY_WINDOW_DAYS = void 0;
/** Prazo, em dias a partir do envio, em que a resposta do cliente fica vinculada à campanha. */
exports.CAMPAIGN_REPLY_WINDOW_DAYS = 7;
/**
 * Pausa automática (2026-08-27): uma campanha em andamento vira `paused`
 * sozinha quando o canal que ela usa não está utilizável — desconectado, ou
 * excluído no meio do disparo.
 *
 * Existe porque em 26–27/08/2026 duas campanhas queimaram 105 tentativas de
 * envio contra canais fora do ar (um nunca conectou, o outro foi excluído
 * depois do início) e ficaram travadas em "em andamento", com 86 mensagens
 * paradas — o dono via "rodando" e nada era entregue.
 *
 * `rate_limit_horizon` (31/08/2026): o teto de 30 dias de reserva do relógio
 * de disparo (`RateLimitHorizonError`) NÃO é passageiro como as falhas de
 * Redis — só some se o dono aumentar a velocidade do canal ou dividir a
 * campanha. Sem pausar com esse motivo, a campanha ficava piscando
 * `in_progress`/`scheduled` a cada minuto pra sempre, sem nenhum aviso.
 *
 * `insufficient_credits` (31/08/2026, rodada 3): a falta de crédito durante o
 * disparo (`CampaignHandler.pauseCampaignForInsufficientCredits`) já pausava
 * a campanha, mas só gravava `stats.pauseReason` — campo write-only, sem tipo
 * de resposta e sem nenhum leitor. O dono via "pausada" e mais nada; foi o
 * primeiro elo do incidente de 31/08/2026 (a madrugada inteira sem saber por
 * quê). Passa a usar o mesmo mecanismo de `autoPause`.
 */
exports.CAMPAIGN_AUTO_PAUSE_REASONS = ['channel_disconnected', 'channel_missing', 'rate_limit_horizon', 'insufficient_credits'];
/**
 * Campaign Status
 */
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "draft";
    CampaignStatus["SCHEDULED"] = "scheduled";
    CampaignStatus["IN_PROGRESS"] = "in_progress";
    CampaignStatus["PAUSED"] = "paused";
    CampaignStatus["COMPLETED"] = "completed";
    CampaignStatus["FAILED"] = "failed";
    CampaignStatus["CANCELLED"] = "cancelled";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
/**
 * Audience Type - Tipo de audiência da campanha
 */
var AudienceType;
(function (AudienceType) {
    AudienceType["LEADS"] = "leads";
    AudienceType["CONTACTS"] = "contacts";
    AudienceType["CUSTOM_AUDIENCE"] = "custom_audience"; // Audiences module (CSV imports)
})(AudienceType || (exports.AudienceType = AudienceType = {}));
/**
 * Human-readable labels for AudienceType values.
 * Single source of truth — consumed by the UI to render campaign metadata.
 */
exports.AUDIENCE_TYPE_LABELS = {
    [AudienceType.LEADS]: 'Leads',
    [AudienceType.CONTACTS]: 'Contatos',
    [AudienceType.CUSTOM_AUDIENCE]: 'Público personalizado',
};
/**
 * Scheduling Type - Tipo de agendamento
 */
var SchedulingType;
(function (SchedulingType) {
    SchedulingType["IMMEDIATE"] = "immediate";
    SchedulingType["SCHEDULED"] = "scheduled";
    SchedulingType["RECURRING"] = "recurring"; // Enviar periodicamente
})(SchedulingType || (exports.SchedulingType = SchedulingType = {}));
/**
 * Human-readable labels for SchedulingType values.
 * Single source of truth — consumed by the UI to render campaign metadata.
 */
exports.SCHEDULING_TYPE_LABELS = {
    [SchedulingType.IMMEDIATE]: 'Imediato',
    [SchedulingType.SCHEDULED]: 'Agendado',
    [SchedulingType.RECURRING]: 'Recorrente',
};
// ============================================================
// CAMPAIGN MESSAGES - Tracking de mensagens individuais
// ============================================================
/**
 * Campaign Message Status - Status de cada mensagem individual
 */
var CampaignMessageStatus;
(function (CampaignMessageStatus) {
    CampaignMessageStatus["PENDING"] = "pending";
    CampaignMessageStatus["QUEUED"] = "queued";
    CampaignMessageStatus["SENDING"] = "sending";
    CampaignMessageStatus["SENT"] = "sent";
    CampaignMessageStatus["DELIVERED"] = "delivered";
    CampaignMessageStatus["READ"] = "read";
    CampaignMessageStatus["FAILED"] = "failed";
    CampaignMessageStatus["CANCELLED"] = "cancelled"; // Cancelado (campanha pausada/cancelada)
})(CampaignMessageStatus || (exports.CampaignMessageStatus = CampaignMessageStatus = {}));
