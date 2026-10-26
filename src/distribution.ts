/**
 * Distribution — Shared Types
 *
 * Tipos da nova engine de distribuição automática que substitui o módulo
 * legado `assignments`. É consumida pelos services de domínio
 * (`conversationsService`, `leadsService`, `ticketsService`) e pelo
 * frontend (componente `DistributionConfigSection`).
 *
 * Este arquivo expõe tipos e um leitor de config (`isLeadOwnerPreferred`) —
 * a implementação do motor vive em `TROIA-V3-BACKEND/src/modules/distribution/`.
 *
 * Durante a migração (Fase 0 → Fase 10), este arquivo coexiste com o
 * legado `assignment.ts`. O legado será removido na Fase 10.
 *
 * Ver plano completo: DOCS/architecture/ASSIGNMENTS_REMOVAL.md
 */

// ============================================================================
// STRATEGY
// ============================================================================

/**
 * Estratégias suportadas pelo `DistributionService`.
 *
 * Regra de pool quando o **contexto tem users cadastrados**:
 *
 * | Estratégia         | Pool                                                    |
 * |--------------------|---------------------------------------------------------|
 * | `sequential`       | context-users attendants                                |
 * | `fixed_operator`   | `fixedOperatorConfig.userId` (validado ∈ context-users) |
 * | `fixed_team`       | team-users attendants ∩ context-users attendants        |
 * | `shift`            | context-users attendants ∩ membros do turno ativo       |
 * | `availability`     | context-users attendants ∩ usuários online agora        |
 * | `last_interaction` | último atendente do contato, se ∈ context-users         |
 *
 * Regra de pool quando o **contexto está público** (sem context-users):
 *
 * | Estratégia         | Pool                                    |
 * |--------------------|-----------------------------------------|
 * | `sequential`       | **vazio** — não distribui               |
 * | `fixed_operator`   | `fixedOperatorConfig.userId` (qualquer) |
 * | `fixed_team`       | team-users attendants (sem interseção)  |
 * | `shift`            | **vazio** — não distribui               |
 * | `availability`     | **vazio** — não distribui               |
 * | `last_interaction` | último atendente do contato (qualquer)  |
 *
 * Pool vazia → item fica sem `assigneeId`. Não há `fallbackUserId`.
 */
export type DistributionStrategy =
  | 'sequential'
  | 'fixed_operator'
  | 'fixed_team'
  | 'shift'
  | 'availability'
  | 'last_interaction';

// ============================================================================
// CONFIG
// ============================================================================

/**
 * Configuração de distribuição armazenada em canais, funis e pipelines de
 * ticket.
 *
 * Unifica o antigo par `assignmentConfig { enabled, strategy, lotteryConfig }`
 * em uma única estrutura plana — sem `eligibleUsers`, `eligibleTeams`,
 * `fallbackUserId`.
 */
export interface DistributionConfig {
  /**
   * Se `false`, a distribuição automática está desligada para este contexto.
   * Criação de lead/conversa/ticket fica sem `assigneeId` até alguém
   * atribuir manualmente.
   */
  enabled: boolean;

  /** Estratégia ativa. Ver tabela em {@link DistributionStrategy}. */
  type: DistributionStrategy;

  /** Usado apenas quando `type === 'fixed_operator'`. */
  fixedOperatorConfig?: DistributionFixedOperatorConfig;

  /** Usado apenas quando `type === 'fixed_team'`. */
  fixedTeamConfig?: DistributionFixedTeamConfig;

  // NOTA: `shift` usa turno ativo automaticamente (sem config adicional).
  // `availability` considera somente status online via Redis presence.
  // `last_interaction` busca último atendente do contato (sem config adicional).
  // Para filtrar por horário de trabalho, use `shift`. Ver decisão D27 no plano.

  /**
   * Só em CANAIS (2026-10-01): antes da estratégia acima, a conversa vai para
   * o responsável pelo lead aberto do contato, quando ele pode receber (usuário
   * ativo e vinculado ao canal). Vale na chegada de uma conversa nova e nas
   * transferências do agente de IA. Quando ele não pode receber, segue a
   * distribuição normal e o motivo fica no registro de atribuição do chat.
   *
   * **Ausente = ligada** (decisão do dono: nasce ligada em todos os canais).
   * Leia sempre por {@link isLeadOwnerPreferred}, nunca o campo cru.
   */
  preferLeadOwner?: boolean;
}

/**
 * A regra "priorizar o responsável pelo lead" vale neste canal? Faz parte da
 * distribuição automática: com ela desligada no canal, a regra não age.
 */
export function isLeadOwnerPreferred(
  config: Pick<DistributionConfig, 'enabled' | 'preferLeadOwner'> | null | undefined,
): boolean {
  return config?.enabled === true && config.preferLeadOwner !== false;
}

export interface DistributionFixedOperatorConfig {
  /** ID do usuário fixo. Quando contexto não é público, precisa estar em
   *  context-users com role attendant. */
  userId: string;
}

export interface DistributionFixedTeamConfig {
  /** ID da equipe que serve como fonte de pool. */
  teamId: string;
}


// ============================================================================
// RUNTIME INPUT / OUTPUT
// ============================================================================

/**
 * Referência ao contexto onde a distribuição acontece. Determina qual
 * collection serve de pool default e onde vive o `rotationCounter`.
 */
export type DistributionContextRef =
  | { kind: 'channel'; channelId: string }
  | { kind: 'funnel'; funnelId: string }
  | { kind: 'pipeline'; pipelineId: string }
  | { kind: 'routing-rule'; ruleId: string };

/**
 * Entradas de runtime para `DistributionService.selectUser`.
 */
export interface DistributionContext {
  appId: string;
  companyId: string;
  /** Identifica o contexto (canal/funil/pipeline/regra). */
  context: DistributionContextRef;
  /**
   * ID do contato associado ao item sendo distribuído. Obrigatório quando
   * `type === 'last_interaction'`; opcional nas demais estratégias.
   */
  contactId?: string;
}

/**
 * Resultado de uma chamada a `DistributionService.selectUser`.
 */
export interface DistributionResult {
  /** Usuário selecionado ou `null` se nenhum match possível. */
  userId: string | null;
  /** Estratégia usada. */
  strategyUsed: DistributionStrategy;
  /** Tamanho da pool após aplicação dos filtros. */
  poolSize: number;
  /** Motivo do resultado (para logging e troubleshooting). */
  reason: DistributionResultReason;
  /**
   * Equipe que originou a pool, quando a estratégia é `fixed_team` (config
   * ou adhoc de transferência para equipe). Permite auditoria citar a equipe.
   */
  teamId?: string;
}

export type DistributionResultReason =
  /** Usuário selecionado com sucesso. */
  | 'assigned'
  /** Contexto (canal/funil/pipeline) está inativo — sem context-users cadastrados. */
  | 'context_inactive'
  /** `config.enabled === false`. */
  | 'disabled'
  /** Pool vazia (nenhum attendant elegível). */
  | 'empty_pool'
  /** `fixed_operator` apontou para user fora do context-users. */
  | 'operator_not_eligible'
  /** `fixed_team` resultou em interseção vazia. */
  | 'team_intersection_empty'
  /** `last_interaction` não achou histórico ou o user saiu da pool. */
  | 'no_previous_interaction'
  /** Estratégia ainda não implementada (availability/last_interaction Phase 5). */
  | 'not_implemented'
  /** Havia candidatos, mas todos estavam na lista de excluídos (transferência por inatividade). */
  | 'pool_empty_after_exclusion';

/**
 * Opções de `DistributionService.pickReassignmentCandidate` — a escolha de
 * quem recebe uma conversa na transferência por inatividade (spec
 * 2026-09-29). Nunca gira o contador de rodízio do contexto (I1): a
 * distribuição normal continua exatamente igual.
 */
export interface ReassignmentCandidateOptions {
  /** Quem NÃO pode receber: o responsável atual + quem já deixou esta espera sem resposta (D6). */
  excludeUserIds: readonly string[];
  /** Responsável atual — o escolhido é o próximo depois dele, em ordem fixa de id. */
  currentUserId: string;
  /** Com equipe: candidatos = membros da equipe ∩ atendentes do contexto (D13). */
  teamId?: string;
  /** Prefere quem está online; se ninguém estiver, usa todos (D17). */
  preferOnline: boolean;
}

/**
 * Resultado de `DistributionService.pickReassignmentCandidate`.
 */
export interface ReassignmentCandidateResult {
  /** Usuário escolhido ou `null` quando não sobrou ninguém. */
  userId: string | null;
  /** Estratégia efetiva (`fixed_team` com equipe; `sequential` na queda do `last_interaction`). */
  strategyUsed: DistributionStrategy;
  /** Tamanho da pool depois da exclusão e dos filtros. */
  poolSize: number;
  reason: DistributionResultReason;
  /** Equipe que originou a pool, quando houver. */
  teamId?: string;
}
