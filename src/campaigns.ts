import { TenantAwareDocument, PaginationQuery, ListResponse } from './common';

/**
 * Campaign - Campanha de marketing multi-canal
 */
export interface Campaign extends TenantAwareDocument {
  name: string;
  description: string;
  channelId: string;               // Channel de comunicação
  templateId: string;              // Template vinculado
  audienceType: AudienceType;      // leads, customers, groups, manual
  audienceFilter?: AudienceFilter; // Filtros de seleção
  recipientIds?: string[];         // IDs manuais (se audienceType = manual)
  audienceId?: string;             // NOVO — usado quando audienceType === CUSTOM_AUDIENCE
  variableMapping: VariableMapping; // Mapeia variáveis do template
  schedulingType: SchedulingType;  // immediate, scheduled, recurring
  scheduledFor?: string;           // Data/hora agendada (ISO string)
  recurringConfig?: RecurringConfig; // Config de recorrência
  status: CampaignStatus;
  stats: CampaignStats;
  /** Preenchido quando a campanha se pausa sozinha; limpo ao retomar. */
  autoPause?: CampaignAutoPauseInfo;
  /**
   * Vincular respostas (2026-11-05). Ausente ou `enabled: false` = comportamento
   * de antes: nenhum envio grava `replyLink` e a resposta segue a distribuição
   * normal do canal. Só pode mudar com a campanha em `draft`/`scheduled`.
   */
  replyLink?: CampaignReplyLinkConfig;
}

/** Prazo, em dias a partir do envio, em que a resposta do cliente fica vinculada à campanha. */
export const CAMPAIGN_REPLY_WINDOW_DAYS = 7;

/**
 * Interruptor "vincular respostas" da campanha. `userIds` são os usuários do
 * rodízio ("dividir entre"): recebem quem não tem dono de lead nem responsável
 * na lista do público.
 */
export interface CampaignReplyLinkConfig {
  enabled: boolean;
  userIds: string[];
}

/**
 * De qual passo da ordem veio o responsável da resposta:
 * dono do lead → responsável na lista do público → rodízio no envio → rodízio na resposta.
 */
export type CampaignReplyStep = 'lead_owner' | 'audience_owner' | 'send_rotation' | 'reply_rotation';

/**
 * Vínculo de UM envio com a resposta do cliente. Gravado só quando a campanha
 * tem o interruptor ligado. Guarda TODOS os candidatos (não só o primeiro),
 * para o "próximo da ordem" funcionar na hora da resposta.
 */
export interface CampaignMessageReplyLink {
  /** Canal da campanha — a resposta só conta se vier por ele. */
  channelId: string;
  contactId?: string;
  /** Chave de comparação: `phoneDedupeKey` do telefone ou e-mail em minúsculas. */
  recipientKey: string;
  leadOwnerId?: string;
  leadId?: string;
  audienceOwnerId?: string;
  rotationUserId?: string;
  /** Responsável esperado no envio; trocado pelo responsável real quando o cliente responde. */
  ownerId?: string;
  ownerStep?: CampaignReplyStep;
  /** Texto como foi enviado; é o que entra na conversa quando o cliente responde. */
  renderedText?: string;
  /** Fim do prazo (envio + 7 dias), ISO. */
  expiresAt?: string;
  /** Quando o cliente respondeu (ISO). Presente = vínculo já usado. */
  repliedAt?: string;
  conversationId?: string;
}

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
export const CAMPAIGN_AUTO_PAUSE_REASONS = ['channel_disconnected', 'channel_missing', 'rate_limit_horizon', 'insufficient_credits'] as const;
export type CampaignAutoPauseReason = (typeof CAMPAIGN_AUTO_PAUSE_REASONS)[number];

export interface CampaignAutoPauseDetails {
  channelId?: string;
  channelName?: string;
  /** Erro do provider que motivou a pausa (ex.: 409 instância desconectada). */
  providerError?: string;
  /** Mensagem da campanha em que a falha apareceu — âncora para investigar. */
  campaignMessageId?: string;
  /** `rate_limit_horizon`: quantos horários a reserva tentou pedir de uma vez. */
  requestedSlots?: number;
  /** `rate_limit_horizon`: quando o último envio cairia, no ritmo atual do canal (ISO). */
  projectedLastSlot?: string;
  /** `insufficient_credits`: quantas mensagens desta campanha ainda esperavam envio. */
  pendingMessages?: number;
  /** `insufficient_credits`: custo estimado (créditos) para cobrir `pendingMessages`. */
  creditsNeeded?: number;
}

export interface CampaignAutoPauseInfo {
  reason: CampaignAutoPauseReason;
  at: Date;
  details: CampaignAutoPauseDetails;
}

/** Forma na API (`at` em ISO). */
export interface CampaignAutoPauseResponse {
  reason: CampaignAutoPauseReason;
  at: string;
  details: CampaignAutoPauseDetails;
}

/**
 * Campaign Status
 */
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Audience Type - Tipo de audiência da campanha
 */
export enum AudienceType {
  LEADS = 'leads',                       // Leads collection (via contactId)
  CONTACTS = 'contacts',                 // Contacts collection
  CUSTOM_AUDIENCE = 'custom_audience'    // Audiences module (CSV imports)
}

/**
 * Human-readable labels for AudienceType values.
 * Single source of truth — consumed by the UI to render campaign metadata.
 */
export const AUDIENCE_TYPE_LABELS: Record<AudienceType, string> = {
  [AudienceType.LEADS]: 'Leads',
  [AudienceType.CONTACTS]: 'Contatos',
  [AudienceType.CUSTOM_AUDIENCE]: 'Público personalizado',
};

/**
 * Audience Filter - Filtros para seleção de audiência
 */
export interface AudienceFilter {
  // Shared
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  // Leads-specific
  priority?: string[];
  businessStatus?: string[];
  temperature?: string[];
  qualifyStatus?: string[];
  source?: string[];
  medium?: string[];
  channel?: string[];
  origin?: string[];
  type?: string[];
  segment?: string[];
  campaignName?: string[];
  adsetName?: string[];
  adName?: string[];
  // Contacts-specific
  channelType?: string[];
}

/**
 * Variable Mapping - Mapeamento de variáveis do template
 */
export interface VariableMapping {
  [position: number]: FieldMapping;
}

/**
 * Field Mapping - Mapeamento de um campo específico
 */
export interface FieldMapping {
  source: 'field' | 'static';
  fieldName?: string;        // Ex: "name", "email", "phone"
  staticValue?: string;      // Valor fixo
}

/**
 * Scheduling Type - Tipo de agendamento
 */
export enum SchedulingType {
  IMMEDIATE = 'immediate',   // Enviar imediatamente
  SCHEDULED = 'scheduled',   // Enviar em data/hora específica
  RECURRING = 'recurring'    // Enviar periodicamente
}

/**
 * Human-readable labels for SchedulingType values.
 * Single source of truth — consumed by the UI to render campaign metadata.
 */
export const SCHEDULING_TYPE_LABELS: Record<SchedulingType, string> = {
  [SchedulingType.IMMEDIATE]: 'Imediato',
  [SchedulingType.SCHEDULED]: 'Agendado',
  [SchedulingType.RECURRING]: 'Recorrente',
};

/**
 * Recurring Config - Configuração de recorrência
 */
export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;        // 0-6 (se weekly)
  dayOfMonth?: number;       // 1-31 (se monthly)
  hour: number;              // 0-23
  minute: number;            // 0-59
  timezone: string;          // Ex: "America/Sao_Paulo"
  endDate?: string;          // Data final de recorrência (ISO string)
}

/**
 * Campaign Stats - Estatísticas da campanha
 */
export interface CampaignStats {
  totalRecipients: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesFailed: number;
  messagesRead: number;
  /** Envios cuja resposta foi vinculada (interruptor "vincular respostas"). Ausente em campanhas antigas. */
  messagesReplied?: number;
  startedAt?: string;      // ISO string
  completedAt?: string;    // ISO string
  /** Quando a PRIMEIRA mensagem da campanha está agendada para sair. ISO string. */
  firstDispatchAt?: string;
  /** Quando a ÚLTIMA mensagem está agendada, no ritmo atual do canal. ISO string. */
  estimatedCompletionAt?: string;
}

/**
 * Campaign Response - Response type sem _id
 */
export interface CampaignResponse extends Omit<Campaign, '_id' | 'autoPause'> {
  id: string;
  /** `at` chega em ISO na API — mesmo padrão de `WorkflowResponse.autoPause`. */
  autoPause?: CampaignAutoPauseResponse;
}

/**
 * Campaign List Response
 */
export interface CampaignListResponse extends ListResponse<CampaignResponse> {}

/**
 * Create Campaign Request
 */
export interface CreateCampaignRequest {
  name: string;
  description: string;
  channelId: string;
  templateId: string;
  audienceType: AudienceType;
  audienceFilter?: AudienceFilter;
  recipientIds?: string[];
  audienceId?: string;             // NOVO — usado quando audienceType === CUSTOM_AUDIENCE
  variableMapping: VariableMapping;
  schedulingType: SchedulingType;
  scheduledFor?: string | null;    // ISO string, null for immediate
  recurringConfig?: RecurringConfig;
  replyLink?: CampaignReplyLinkConfig;
}

/**
 * Update Campaign Request
 */
export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  channelId?: string;
  templateId?: string;
  audienceType?: AudienceType;
  audienceFilter?: AudienceFilter;
  recipientIds?: string[];
  audienceId?: string;             // NOVO — usado quando audienceType === CUSTOM_AUDIENCE
  variableMapping?: VariableMapping;
  schedulingType?: SchedulingType;
  scheduledFor?: string | null;    // ISO string, null for immediate
  recurringConfig?: RecurringConfig;
  /** Só aceito com a campanha em `draft`/`scheduled` (422 depois de iniciada). */
  replyLink?: CampaignReplyLinkConfig;
  status?: CampaignStatus;
}

/**
 * Campaign Query
 */
export interface CampaignQuery extends PaginationQuery {
  status?: CampaignStatus | CampaignStatus[];
  templateId?: string;
  audienceType?: AudienceType;
  schedulingType?: SchedulingType;
  search?: string;
}

/**
 * Campaign Stats Response
 */
export interface CampaignStatsResponse {
  totalRecipients: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesFailed: number;
  messagesRead: number;
  deliveryRate: number;       // (messagesDelivered / messagesSent) * 100
  readRate: number;           // (messagesRead / messagesDelivered) * 100
  failureRate: number;        // (messagesFailed / messagesSent) * 100
  messagesReplied: number;
  replyRate: number;          // (messagesReplied / messagesSent) * 100
  startedAt?: string;
  completedAt?: string;
  duration?: number;          // ms
}

/**
 * Test Campaign Request
 */
export interface TestCampaignRequest {
  testRecipients: string[];   // Array de IDs para teste
  variableMapping: VariableMapping;
}

// ============================================================
// CAMPAIGN MESSAGES - Tracking de mensagens individuais
// ============================================================

/**
 * Campaign Message Status - Status de cada mensagem individual
 */
export enum CampaignMessageStatus {
  PENDING = 'pending',        // Aguardando envio
  QUEUED = 'queued',          // Na fila do BullMQ
  SENDING = 'sending',        // Em processo de envio
  SENT = 'sent',              // Enviado ao provider
  DELIVERED = 'delivered',    // Entregue ao destinatário
  READ = 'read',              // Lido pelo destinatário
  FAILED = 'failed',          // Falhou no envio
  CANCELLED = 'cancelled'     // Cancelado (campanha pausada/cancelada)
}

/**
 * Campaign Message - Documento de tracking por destinatário
 */
export interface CampaignMessage extends TenantAwareDocument {
  campaignId: string;               // Referência à campanha
  recipientId: string;              // ID do lead/contato ou número manual
  recipientIdentifier: string;      // Identificador do destinatário (phone, email, etc.)
  recipientName?: string;           // Nome para variáveis
  recipientData?: Record<string, unknown>; // Dados extras para variáveis
  status: CampaignMessageStatus;
  providerMessageId?: string;       // ID retornado pelo WhatsApp/Gateway
  sentAt?: string;                  // ISO string
  deliveredAt?: string;             // ISO string
  readAt?: string;                  // ISO string
  failedAt?: string;                // ISO string
  failureReason?: string;
  retryCount: number;
  /** Vínculo com a resposta do cliente — só em campanha com "vincular respostas" ligado. */
  replyLink?: CampaignMessageReplyLink;
}

/**
 * Campaign Message Response - Response type sem _id
 */
export interface CampaignMessageResponse extends Omit<CampaignMessage, '_id'> {
  id: string;
}

/**
 * Campaign Message List Response
 */
export interface CampaignMessageListResponse extends ListResponse<CampaignMessageResponse> {}

/**
 * Campaign Message Query
 */
export interface CampaignMessageQuery extends PaginationQuery {
  campaignId?: string;
  status?: CampaignMessageStatus | CampaignMessageStatus[];
  recipientIdentifier?: string;
  search?: string;
  /** Filtra pelo responsável do envio (`replyLink.ownerId`). */
  ownerId?: string;
}

/**
 * Campaign Message Job Data - Dados do job na queue BullMQ
 */
export interface CampaignMessageJobData {
  campaignMessageId: string;  // ID do documento campaign-messages
  campaignId: string;
  channelId: string;
  templateId: string;
  recipientIdentifier: string;
  recipientName?: string;
  variables: Record<string, string>;  // Variáveis já resolvidas
  appId: string;
  companyId: string;
}

/**
 * Campaign Message Stats By Status - Agregação por status
 */
export interface CampaignMessageStatsByStatus {
  status: CampaignMessageStatus;
  count: number;
}
