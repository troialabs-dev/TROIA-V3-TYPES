// Lead Types - Sales system with universal source

import type { KanbanBoardResponse, KanbanSortMode } from './kanban';
import type { AlertLevel, AlertReason } from './alerts';

// ============================================================================
// CANONICAL ENUMS — single source of truth para Lead.source / Lead.medium / Lead.channel
// ============================================================================
//
// Estes 3 enums vivem aqui (no @troia-v3/types) e são consumidos por:
// - Backend: Zod validation (`@/modules/leads/validation`), reports
// - Frontend: dropdowns de formulário, filtros, dashboards (CRM + Marketing),
//   ícones (`@/shared/icons/LeadSourceIcon`), labels pt-BR
//
// Adicionar novo valor aqui propaga: enum + type + label + Zod + UI options.
// NUNCA duplicar essas listas em outros arquivos — sempre importar daqui.

/** Plataforma/origem de marketing do lead (espelha campos UTM). */
export const LEAD_SOURCES = [
  'meta',
  'google',
  'tiktok',
  'linkedin',
  'microsoft',
  'organic',
  'referral',
  'email',
  'offline',
  'partner',
  'outbound',
  'direct',
] as const;
export type LeadSource = typeof LEAD_SOURCES[number];

/** Tipo de tráfego (orgânico vs pago). */
export const LEAD_MEDIUMS = ['organic', 'paid'] as const;
export type LeadMedium = typeof LEAD_MEDIUMS[number];

/** Sub-canal semântico de captura (NÃO confundir com Channel collection / channelId). */
export const LEAD_CHANNELS = [
  'whatsapp',
  'instagram',
  'facebook',
  'messenger',
  'telegram',
  'email',
  'website',
  'phone',
  'google',
  'youtube',
  'tiktok',
  'linkedin',
  'bing',
  /**
   * Presencial — loja, quiosque, escritório. Genérico de propósito: cobre
   * qualquer ponto físico. É o canal do lead capturado no balcão (QR Code) e
   * das visitas contadas por sensor de fluxo.
   */
  'physical',
  'other',
] as const;
export type LeadChannel = typeof LEAD_CHANNELS[number];

/** Labels pt-BR canônicos por enum — único lugar onde a string é definida. */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  meta: 'Meta',
  google: 'Google',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  microsoft: 'Microsoft',
  organic: 'Orgânico',
  referral: 'Indicação',
  email: 'Email',
  offline: 'Offline',
  partner: 'Parceiros',
  outbound: 'Outbound',
  direct: 'Direto',
};

export const LEAD_MEDIUM_LABELS: Record<LeadMedium, string> = {
  organic: 'Orgânico',
  paid: 'Pago',
};

export const LEAD_CHANNEL_LABELS: Record<LeadChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  messenger: 'Messenger',
  telegram: 'Telegram',
  email: 'Email',
  website: 'Website',
  phone: 'Telefone',
  google: 'Google',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  bing: 'Bing',
  physical: 'Físico',
  other: 'Outro',
};

/** Helpers — retornam label canônico ou o próprio valor (defensivo contra valores legacy). */
export const getLeadSourceLabel = (s: string): string =>
  (LEAD_SOURCE_LABELS as Record<string, string>)[s] ?? s;
export const getLeadMediumLabel = (m: string): string =>
  (LEAD_MEDIUM_LABELS as Record<string, string>)[m] ?? m;
export const getLeadChannelLabel = (c: string): string =>
  (LEAD_CHANNEL_LABELS as Record<string, string>)[c] ?? c;

/** Type guards. */
export const isLeadSource = (v: string): v is LeadSource =>
  (LEAD_SOURCES as readonly string[]).includes(v);
export const isLeadMedium = (v: string): v is LeadMedium =>
  (LEAD_MEDIUMS as readonly string[]).includes(v);
export const isLeadChannel = (v: string): v is LeadChannel =>
  (LEAD_CHANNELS as readonly string[]).includes(v);

// ============================================================================
// END CANONICAL ENUMS
// ============================================================================

// Step history entry for tracking funnel movement
export interface StepHistoryEntry {
  stepId: string;
  stepName?: string;     // Denormalized for display without lookup
  funnelId?: string;     // Optional - lead might be moved without explicit funnel
  funnelName?: string;   // Denormalized for display without lookup
  enteredAt: string;     // When the lead entered this step
  exitedAt?: string;     // When the lead exited (null if current step)
  movedBy?: string;      // userId who moved the lead (for audit)
  movedByName?: string;  // User name who moved the lead (for display)
  duration?: number;     // Time spent in this step (milliseconds) - calculated when exitedAt is set
}

/**
 * Bloco persistido no lead com a "foto" de onde a venda/captura aconteceu —
 * histórico e gamificação. NÃO usa `lead.teamId` (que significa "fila da
 * equipe" na distribuição): a equipe/unidade da captura vivem aqui.
 *
 * Dois fluxos preenchem este bloco de formas diferentes:
 *  - `origin: 'qrcode'` (captura por QR Code, spec §4.1): fluxo completo —
 *    `sessionUuid`, `code` (formato `CAT-XXXX`) e `capturedBy` são
 *    obrigatórios nesse caminho (validados por `LeadCaptureInfoSchema` no
 *    backend, que continua exigindo os três).
 *  - `origin: 'erp'` (venda importada de ERP via node de workflow): fluxo
 *    parcial — só `unitId`/`teamId` são preenchidos; não existe sessão de QR
 *    nem código, por isso `sessionUuid`, `code` e `capturedBy` são opcionais
 *    aqui. `filledAt` também é opcional: quando a venda do ERP reaproveita um
 *    lead que ainda não tinha bloco `capture`, só unidade/origem são gravadas
 *    (não houve preenchimento de formulário nenhum para datar).
 */
export interface LeadCaptureInfo {
  sessionUuid?: string;
  code?: string;
  /** Vendedor que gerou o QR. Ausente no fluxo `origin: 'erp'`. */
  capturedBy?: string;
  teamId?: string;
  unitId?: string;
  /** Quando o formulário/captura foi preenchido. Ausente em lead que só
   * recebeu unidade/origem por reaproveitamento de venda do ERP. */
  filledAt?: string;
  confirmedAt?: string;
  conversationId?: string;
  /** 'qrcode' (captura por QR, preenche tudo) | 'erp' (venda do ERP: unitId/teamId, e filledAt só quando o lead é criado do zero). */
  origin?: 'qrcode' | 'erp';
}

/**
 * Carrega o carimbo de autoria (`createdBy` + `createdByType`) desde
 * 2026-08-30. Os dois são opcionais: registro anterior a essa data não tem a
 * informação, e ausente é a verdade. Ver `CreatorStamp` em `common.ts`.
 */
export interface Lead extends CreatorStamp {
  id: string;
  appId: string;
  companyId: string;

  // Base relationship
  contactId: string;

  // Basic data
  score: number;
  segment: string;
  description?: string;

  // Marketing attribution: source → channel → origin
  source?: LeadSource;
  medium?: LeadMedium;
  channel?: LeadChannel;
  channelId?: string;

  // User-defined classification
  type?: string;

  // Status and temperature — unions literais + (string & {}) para aceitar valores livres
  // vindos de integração/importação preservando autocomplete no IntelliSense
  status: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'lost' | (string & {});
  priority: 'low' | 'medium' | 'high' | 'urgent' | (string & {});
  temperature: 'cold' | 'warm' | 'hot' | (string & {});
  qualifyStatus: 'pending' | 'qualified' | 'disqualified' | (string & {});
  /** Timestamp do último change em qualifyStatus — usado por métricas de qualificação no dashboard. */
  qualifyStatusChangedAt?: Date | string;

  // Sales funnel
  funnelId?: string;
  stepId?: string;
  stepsHistory?: StepHistoryEntry[]; // History of all step changes for funnel analytics

  // Assignment (standard assignments pattern)
  assigneeId?: string;
  teamId?: string;
  assignmentType?: string;
  assignedAt?: string;
  assignedBy?: string;

  // Financial
  budget?: number;
  wonValue?: number;

  // Business outcome
  businessStatus?: 'pending' | 'won' | 'lost';
  wonDate?: string;

  // Activity tracking (calculated by backend based on activities)
  // no_activities: No activities registered (red/problem)
  // overdue: Has pending activities past their occurredAt date (orange/warning)
  // up_to_date: All activities completed or pending with future dates (green/success)
  activityStatus?: 'no_activities' | 'overdue' | 'up_to_date';

  // ── Alertas de inatividade ────────────────────────────────────────────────
  /** Snooze do usuário (ISO). Enquanto no futuro, o alerta fica 'snoozed'. */
  alertSnoozedUntil?: string;
  /** Denormalizado: nº de activities não-deletadas do lead. Base de no_activities. */
  activityCount?: number;
  /** Denormalizado (ISO): menor occurredAt entre activities pending. < now = atrasada; >= now = futura agendada. */
  earliestPendingActivityAt?: string;
  /** Computado (read-only): cor final do card sobrepondo as regras de atividade. */
  alertLevel?: AlertLevel;
  /** Computado (read-only): motivo governante da cor, p/ tooltip. */
  alertReason?: AlertReason;
  /** Computado (read-only): dias desde a última atividade. */
  daysSinceActivity?: number;
  /** Computado (read-only): dias na etapa atual. */
  daysInStep?: number;
  /**
   * Último nível de alerta computado no scan (idempotência de transição —
   * detecta mudança de cor entre scans, warning/critical/ok/snoozed).
   * `notifiedAt` é OPCIONAL (opção B, 2026-07-17): só é gravado quando uma
   * notificação foi DE FATO enviada (decision.type setado + destinatário
   * elegível) — transições ok/snoozed atualizam `level` mas preservam o
   * `notifiedAt` anterior.
   */
  alertNotifyState?: { level: AlertLevel; notifiedAt?: string };

  // Control dates
  customerId?: string;        // Renamed from convertedToCustomerId
  lostDate?: string;
  lastInteractionAt?: string;
  lastFollowUpAt?: string;
  lastStepAt?: string;
  lastActivityAt?: string;

  /** Rank fractional do modo de ordenação manual do kanban (SP2). Ausente = nunca ordenado manualmente. */
  kanbanRank?: string;

  // Origin (free-text classification)
  origin?: string;

  // Campaign/Ad tracking
  campaignName?: string;
  adsetName?: string;
  adName?: string;

  // External tracking (from public endpoint / webhooks)
  formId?: string;
  externalLeadId?: string;
  pageId?: string;
  pageName?: string;

  // Loss/disqualification reasons
  lostReason?: string;

  // Interests - Database documents the lead is interested in
  interests?: LeadInterest[];

  /** Captura por QR Code (spec §4.1). Ausente = lead não veio de QR. */
  capture?: LeadCaptureInfo;
  /**
   * Cupons do lead para sorteio (2026-09-29) — números gerados pelo sistema,
   * nunca editados à mão: pela página de captura (funil com "Dar cupom a quem
   * se cadastrar") e pelo nó "Número sequencial" no modo "Gerar cupom do
   * lead". Um contador por empresa, sem repetir (último + 1); "Zerar cupons"
   * limpa o campo de todos os leads e a numeração recomeça do 1.
   */
  coupons?: number[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  contactId?: string;  // ✅ OPTIONAL: will be created from name/emails/phones if not provided
  score?: number;
  segment: string;
  description?: string;
  source?: LeadSource;
  medium?: LeadMedium;
  channel?: LeadChannel;
  channelId?: string;
  type?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'lost' | (string & {});
  priority?: 'low' | 'medium' | 'high' | 'urgent' | (string & {});
  temperature?: 'cold' | 'warm' | 'hot' | (string & {});
  qualifyStatus?: 'pending' | 'qualified' | 'disqualified' | (string & {});
  funnelId?: string;
  stepId?: string;
  assigneeId?: string;
  teamId?: string;
  budget?: number;

  // Origin (free-text)
  origin?: string;

  // Campaign/Ad tracking
  campaignName?: string;
  adsetName?: string;
  adName?: string;

  // External tracking
  formId?: string;
  externalLeadId?: string;
  pageId?: string;
  pageName?: string;

  // ✅ NEW: Contact data for automatic contact creation (if contactId not provided)
  name?: string;
  company?: string;
  position?: string;
  emails?: string[];
  phones?: string[];

  /** Só o fluxo interno de captura por QR preenche (nunca vem do cliente HTTP — Zod de `POST /leads` não expõe). */
  capture?: LeadCaptureInfo;
}

export interface UpdateLeadRequest {
  contactId?: string;
  score?: number;
  segment?: string;
  description?: string;
  source?: LeadSource;
  medium?: LeadMedium;
  channel?: LeadChannel;
  channelId?: string;
  type?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'lost' | (string & {});
  priority?: 'low' | 'medium' | 'high' | 'urgent' | (string & {});
  temperature?: 'cold' | 'warm' | 'hot' | (string & {});
  qualifyStatus?: 'pending' | 'qualified' | 'disqualified' | (string & {});
  funnelId?: string;
  stepId?: string;
  // Optional fields for step history tracking (denormalized data)
  stepName?: string;          // Denormalized step name for stepsHistory
  funnelName?: string;        // Denormalized funnel name for stepsHistory
  movedBy?: string;           // User ID who moved the lead (for audit)
  movedByName?: string;       // User name who moved the lead (for display)
  assigneeId?: string;
  teamId?: string;
  /**
   * `null` LIMPA o orçamento (vira `$unset` no repositório) — nunca é
   * gravado como null. A tela do CRM devolve null quando o usuário esvazia
   * o campo, e leads antigos já têm null no banco; recusar o null fazia
   * "abrir e salvar" um lead antigo devolver 422 (incidente 27/08/2026).
   */
  budget?: number | null;
  wonValue?: number;
  businessStatus?: 'pending' | 'won' | 'lost';
  wonDate?: string;
  lostDate?: string;
  // activityStatus is calculated automatically by backend - not updatable
  customerId?: string;
  lostReason?: string;
  lastInteractionAt?: string;
  lastFollowUpAt?: string;
  lastStepAt?: string;
  kanbanRank?: string;
  origin?: string;
  campaignName?: string;
  adsetName?: string;
  adName?: string;
  formId?: string;
  externalLeadId?: string;
  pageId?: string;
  pageName?: string;
  /**
   * Atualização parcial da foto de captura (merge por campo). Usado pelo
   * workflow ao reatribuir uma venda do ERP.
   *
   * `teamId: null` REMOVE a equipe da foto (`$unset` de `capture.teamId`) — a
   * gamificação passa a usar a equipe atual do responsável, e não a equipe de
   * quem capturou o lead originalmente. É o que acontece quando a venda troca
   * de vendedor no reaproveitamento.
   */
  capture?: { unitId?: string; teamId?: string | null; origin?: 'qrcode' | 'erp' };
}

export interface LeadResponse extends Lead {
  // Populated relationships (from aggregation lookups)
  contact?: {
    id: string;
    name: string;
    picture?: string;
    tags?: string[];
    identifiers?: {
      email?: string[];
      phone?: string[];
      whatsapp?: string[];
      instagram?: string[];
      facebook?: string[];
      telegram?: string[];
    };
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  customer?: {
    id: string;
    name: string;
  };
  channelConfig?: {
    id: string;
    name: string;
  };
  step?: {
    id: string;
    name: string;
    /** Cor da etapa (funnel-steps.color) — usada na pill de etapa da listagem. */
    color?: string;
  };
  funnel?: {
    id: string;
    name: string;
  };
}

export interface LeadQuery extends PaginationQuery {
  filters?: {
    contactId?: string;
    segment?: string | string[];                                                                                                    // Multiple selection
    source?: LeadSource | LeadSource[];
    medium?: LeadMedium | LeadMedium[];
    channel?: LeadChannel | LeadChannel[];
    origin?: string | string[];
    channelId?: string | string[];                                                                                                  // Multiple selection
    status?: ('new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'lost') | ('new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'lost')[];
    priority?: ('low' | 'medium' | 'high' | 'urgent') | ('low' | 'medium' | 'high' | 'urgent')[];
    temperature?: ('cold' | 'warm' | 'hot') | ('cold' | 'warm' | 'hot')[];
    qualifyStatus?: ('pending' | 'qualified' | 'disqualified') | ('pending' | 'qualified' | 'disqualified')[];                    // Default: ['pending', 'qualified']
    businessStatus?: ('pending' | 'won' | 'lost') | ('pending' | 'won' | 'lost')[];                                               // Default: ['pending', 'won']
    funnelId?: string | string[];                                                                                                   // Multiple selection
    stepId?: string | string[];                                                                                                     // Multiple selection
    assigneeId?: string | string[];                                                                                                 // Multiple selection
    teamId?: string | string[];                                                                                                     // Multiple selection
    /**
     * Filtro por respostas de formulário (D3 — duas fases via
     * `checklists.answers`). Só campos de escolha. As perguntas são do
     * formulário `formAnswersFormId`; sem ele, do formulário de captura do
     * funil (exige `funnelId` único).
     */
    formAnswers?: Array<{ fieldId: string; values: string[] }>;
    /**
     * Formulário do filtro por resposta (2026-09-28) — qualquer formulário, não
     * só o de captura. Sozinho (sem `formAnswers`) filtra os leads que têm
     * alguma resposta enviada dele.
     */
    formAnswersFormId?: string;
    customerId?: string;
    scoreMin?: number;
    scoreMax?: number;
    budgetMin?: number;
    budgetMax?: number;
    dateFrom?: string;
    dateTo?: string;
    /** Range sobre `wonDate` (Data do ganho) — string ISO ou YYYY-MM-DD. */
    wonDateFrom?: string;
    wonDateTo?: string;
    /** Range sobre `lostDate` (Data da perda) — string ISO ou YYYY-MM-DD. */
    lostDateFrom?: string;
    lostDateTo?: string;
    campaignName?: string | string[];
    adsetName?: string | string[];
    adName?: string | string[];
    tags?: string | string[];
    type?: string | string[];
    contactIdIn?: string[];
    /** Filtro por cor de alerta de inatividade (kanban) — computado server-side antes da janela. */
    alertLevel?: AlertLevel;
  };
}

export interface LeadListResponse extends ListResponse<LeadResponse> {}

// Lead conversion
export interface ConvertLeadRequest {
  customerId: string;
  wonValue?: number;
  conversionNotes?: string;
}

// Lead assignment
export interface AssignLeadRequest {
  assigneeId?: string;
  teamId?: string;
  assignmentType?: string;
}

// Lead interests
export interface LeadInterest {
  documentId: string;
  status: 'pending' | 'approved';
  addedAt?: string;
}

export interface AddLeadInterestsRequest {
  documentIds: string[];
}

// Import types
import { CreatorStamp, ListResponse, PaginationQuery } from './common';

// ============================================================================
// KANBAN EM ESCALA (SP1 — 2026-07-16)
// Projeção enxuta do card + queries dos endpoints /leads/kanban.
// Campos = exatamente o que LeadCard.tsx renderiza (ver spec §4).
// ============================================================================

export interface LeadKanbanCardContact {
  id: string;
  name?: string;
  picture?: string;
  tags?: string[];
  identifiers?: {
    email?: string[];
    phone?: string[];
    whatsapp?: string[];
  };
}

export interface LeadKanbanCard {
  id: string;
  stepId: string;
  funnelId: string;
  description?: string;
  budget?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  businessStatus?: 'pending' | 'won' | 'lost';
  qualifyStatus?: 'pending' | 'qualified' | 'disqualified';
  /** Temperatura do lead — flame do card (.tk-t do DS). */
  temperature?: 'cold' | 'warm' | 'hot';
  /** Sub-canal semântico de captura — ícone do .tk-sub do card. */
  channel?: LeadChannel;
  /** Plataforma de origem — chip do card (.tk-chip). */
  source?: LeadSource;
  /** Sintético — calculado no backend a partir de activities. */
  activityStatus: 'no_activities' | 'overdue' | 'up_to_date';
  /** Cor final do card (alertas de inatividade) — sobrepõe activityStatus. Computado server-side. */
  alertLevel: AlertLevel;
  /** Motivo governante da cor, p/ tooltip. */
  alertReason?: AlertReason;
  /** Dias desde a última atividade (contador do card). */
  daysSinceActivity?: number;
  /** Dias na etapa atual (contador do card). */
  daysInStep?: number;
  /** Snooze ativo (ISO), se houver — o card mostra sino cortado. */
  alertSnoozedUntil?: string;
  lastInteractionAt?: string;
  createdAt: string;
  /** Rank do modo manual — o client precisa dele pra calcular a posição entre vizinhos. */
  kanbanRank?: string;
  /**
   * Próxima atividade PENDENTE do lead (ISO). É o mesmo
   * `earliestPendingActivityAt` que já alimentava o motor de alerta — pode
   * estar no passado (follow-up atrasado) ou no futuro (agendado). O card
   * de Detalhes rotula como "Follow-up".
   */
  nextFollowUpAt?: string;
  contact?: LeadKanbanCardContact;
  /** `picture` vem de `users.avatar` (nome do campo na collection). */
  assignee?: { id: string; name: string; picture?: string };
  /**
   * Empresa do contato — caminho `lead.contactId → contact.customerId →
   * customer.name`. NÃO é `lead.customerId`, que significa "cliente
   * resultante da conversão" e só existe depois de `POST /leads/:id/convert`
   * (spec §10). Ausente quando o contato não tem cliente associado.
   */
  customer?: { id: string; name: string };
  /**
   * Respostas do formulário de captura, já ROTULADAS (label da opção) — só
   * vem quando o filtro "Formulário" está ativo (Parte 3, `LeadsService.attachFormAnswersToCards`).
   * Chips lilás no card do kanban (mockup 12-B).
   */
  formAnswers?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
}

/**
 * Limiares efetivos de UMA etapa, já resolvidos pela cascata etapa → funil →
 * sistema no backend. Relógio DESLIGADO (`enabled: false`) é omitido — o card
 * não deve anunciar "limite Xd" de um relógio que nunca vai disparar.
 *
 * Vive no envelope do board e não no card porque é configuração da etapa,
 * idêntica para todos os cards da mesma coluna.
 */
export interface LeadKanbanStepThresholds {
  inactivity?: { warningDays: number; criticalDays: number };
  timeInStep?: { warningDays: number; criticalDays: number };
}

/**
 * Envelope do board de leads: o board genérico + os limiares por etapa.
 * Estende `KanbanBoardResponse<LeadKanbanCard>`, então todo consumidor que
 * ainda tipa pelo genérico continua compilando.
 */
export interface LeadKanbanBoard extends KanbanBoardResponse<LeadKanbanCard> {
  /** Chave = `stepId`. Uma entrada por coluna do board. */
  stepThresholds?: Record<string, LeadKanbanStepThresholds>;
}

export interface LeadKanbanQuery {
  funnelId: string;
  search?: string;
  /** Tamanho da janela por coluna (default 50, máx 100 — validado no backend). */
  windowSize?: number;
  /** Modo de ordenação (default 'created'). Import de './kanban'. */
  sortMode?: KanbanSortMode;
  /** Mesmos filtros da listagem, exceto funnelId (top-level) e stepId (por rota). */
  filters?: LeadQuery['filters'];
}

export interface LeadKanbanColumnQuery extends LeadKanbanQuery {
  stepId: string;
  cursor?: string;
}

// ============================================================================
// CUPONS DO LEAD (sorteio — 2026-09-29)
// ============================================================================

/** Dígitos com zero à esquerda na exibição do cupom (0012). */
export const LEAD_COUPON_PAD_LENGTH = 4;

/** Cupom como o cliente vê: `12` → `"0012"`. */
export function formatLeadCoupon(coupon: number): string {
  return String(coupon).padStart(LEAD_COUPON_PAD_LENGTH, '0');
}

/** `POST /api/leads/coupons/reset` — quantos leads perderam os cupons. */
export interface LeadCouponsResetResponse {
  clearedLeads: number;
}
