/**
 * Gamificação — tabela de pontos, níveis, livro-caixa e ranking (spec §4.5).
 */

export type GamificationRuleKey = 'lead_captured' | 'form_completed' | 'lead_won';

export interface GamificationRule {
  key: GamificationRuleKey;
  label: string;
  points: number;
  enabled: boolean;
  /** Teto de eventos confirmados por dia por usuário (só `lead_captured`). */
  dailyCap?: number;
  /** Janela de estorno em dias (só `lead_won`). */
  reversalDays?: number;
}

export interface GamificationLevel {
  name: string;
  minPoints: number;
}

export type GamificationPeriod = 'week' | 'month' | 'quarter';

export type GamificationRankingScope = 'users' | 'users_by_team' | 'users_by_unit' | 'teams' | 'units';

/** D8 — o admin escolhe; padrão `full`. */
export type GamificationVisibility = 'full' | 'top3_and_me' | 'only_me';

export interface GamificationConfig {
  id: string;
  appId: string;
  companyId: string;
  enabled: boolean;
  rules: GamificationRule[];
  levels: GamificationLevel[];
  period: GamificationPeriod;
  /** Recortes ligados (D4). */
  rankings: GamificationRankingScope[];
  visibility: GamificationVisibility;
  celebrate: { onComplete: boolean; onWon: boolean; sound: boolean };
  createdAt: string;
  updatedAt: string;
}

export type UpdateGamificationConfigRequest = Partial<
  Omit<GamificationConfig, 'id' | 'appId' | 'companyId' | 'createdAt' | 'updatedAt'>
>;

export const DEFAULT_GAMIFICATION_RULES: GamificationRule[] = [
  { key: 'lead_captured', label: 'Lead captado e confirmado', points: 1, enabled: true, dailyCap: 15 },
  { key: 'form_completed', label: 'Formulário de captura preenchido', points: 3, enabled: true },
  { key: 'lead_won', label: 'Venda fechada', points: 10, enabled: true, reversalDays: 7 },
];

export const DEFAULT_GAMIFICATION_LEVELS: GamificationLevel[] = [
  { name: 'Bronze', minPoints: 0 },
  { name: 'Prata', minPoints: 500 },
  { name: 'Ouro', minPoints: 2000 },
  { name: 'Diamante', minPoints: 5000 },
];

export type GamificationEventStatus = 'pending' | 'confirmed' | 'reversed';

export type GamificationSourceType = 'lead' | 'checklist';

/** Linha do livro-caixa (`gamification-events`) — só insere; estorno = linha negativa + original `reversed`. */
export interface GamificationEvent {
  id: string;
  appId: string;
  companyId: string;
  userId: string;
  /** D15 — foto do vínculo no momento do evento. */
  teamId?: string;
  unitId?: string;
  ruleKey: GamificationRuleKey;
  points: number;
  status: GamificationEventStatus;
  sourceType: GamificationSourceType;
  sourceId: string;
  /** `YYYY-MM` | `YYYY-Www` | `YYYY-Qn` conforme `GamificationPeriod`. */
  periodKey: string;
  occurredAt: string;
  confirmedAt?: string;
  reversedAt?: string;
  reason?: string;
}

export interface RankingQuery {
  /** Ausente → o backend usa `config.rankings[0]` (Fix round 1, item 1 — bootstrap sem recorte salvo). */
  scope?: GamificationRankingScope;
  teamId?: string;
  unitId?: string;
  periodKey?: string;
  /**
   * Intervalo personalizado (`YYYY-MM-DD`, dias no fuso da empresa) — os dois
   * juntos, sem `periodKey`. Soma os pontos pela data do evento (`occurredAt`)
   * em vez do ciclo configurado.
   */
  startDate?: string;
  endDate?: string;
}

export interface RankingEntry {
  position: number;
  id: string;
  name: string;
  avatar?: string;
  /** Linha secundária: loja do vendedor (recortes de usuários) — ex.: "Mastercell Shopping" (mockup 09). */
  subtitle?: string;
  points: number;
  leads: number;
  forms: number;
  wins: number;
  /** Vendedores distintos que pontuaram (recortes `teams`/`units`) — "N vendedores" (mockup 09-D). */
  members?: number;
  trend: 'up' | 'down' | 'flat';
}

export interface RankingResponse {
  scope: GamificationRankingScope;
  /** Chave do ciclo mostrado; com intervalo personalizado, `YYYY-MM-DD..YYYY-MM-DD`. */
  periodKey: string;
  /** Presente quando o ranking foi apurado por intervalo personalizado (`RankingQuery.startDate`/`endDate`). */
  range?: { startDate: string; endDate: string };
  /** Período configurado pela empresa — a página de ranking não tem `gamification:read` para ler a config. */
  period: GamificationPeriod;
  /** Recortes ligados na config — monta o seletor do header com 1 request. Vazio = gamificação desligada. */
  rankings: GamificationRankingScope[];
  visibility: GamificationVisibility;
  entries: RankingEntry[];
  me?: RankingEntry & { gapToNext?: number };
  total: number;
}

export interface GamificationMeResponse {
  periodKey: string;
  periodPoints: number;
  /** Pontos do período anterior — delta da variante "Só meus números" (mockup 09-C). */
  previousPeriodPoints?: number;
  /** Melhor período da carreira — "Melhor mês". */
  bestPeriod?: { periodKey: string; points: number };
  position?: number;
  total?: number;
  level: GamificationLevel;
  nextLevel?: GamificationLevel;
  totalPoints: number;
  /** Últimos eventos — SEMPRE os 20 mais recentes (a Parte 5 deriva `pointsToday` daqui; inclui `pending` e linhas negativas). */
  recentEvents: GamificationEvent[];
}

export interface GamificationEventsQuery {
  userId?: string;
  status?: GamificationEventStatus;
  ruleKey?: GamificationRuleKey;
  periodKey?: string;
  /** Busca por nome do vendedor ou do lead (auditoria, mockup 10-B). */
  search?: string;
  page?: number;
  limit?: number;
}

/** Linha da auditoria (`GET /api/gamification/events`) — evento + nomes resolvidos no read (Two-Phase Fetch). */
export interface GamificationEventListItem extends GamificationEvent {
  /** Nome completo do vendedor; `'Usuário removido'` quando o user foi excluído. */
  userName: string;
  userAvatar?: string;
  /** Nome do lead (sourceType 'lead') ou do checklist (sourceType 'checklist'). */
  sourceName?: string;
  /** Complemento da origem: "R$ 4.000" na venda, motivo do estorno na linha negativa. */
  sourceDetail?: string;
  /** Rota interna do app para abrir a origem (`/crm/{funnelId}?leadId=...` ou `/checklists/{id}`). */
  link?: string;
}

/** KPIs da aba Auditoria (`GET /api/gamification/events/summary`). */
export interface GamificationEventsSummary {
  periodKey: string;
  /** Soma líquida dos eventos `confirmed` do período (estornos já descontados). */
  confirmedPoints: number;
  /** Vendedores distintos com evento `confirmed` no período. */
  confirmedUsers: number;
  /** Eventos `pending` no período (aguardando WhatsApp). */
  pendingCount: number;
  /** Eventos marcados `reversed` no período. */
  reversedCount: number;
  /** Pontos devolvidos no período (soma absoluta das linhas negativas). */
  reversedPoints: number;
  /** Capturas confirmadas no período cujo lead ainda não tem `form_completed`. */
  capturesWithoutForm: number;
  /** Primeiro evento confirmado da empresa (ISO) — "Pontuando desde …". */
  firstConfirmedAt?: string;
}
