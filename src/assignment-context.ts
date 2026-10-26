import type { DistributionStrategy } from './distribution';

/**
 * AssignmentContext — Contexto canônico de qualquer atribuição/transferência
 * de lead, conversation ou ticket.
 *
 * Atravessa os 5 caminhos de origem possíveis:
 * 1. Manual via endpoint POST /:id/transfer
 * 2. Distribuição automática via DistributionService (autoAssignFrom*)
 * 3. Routing rules (leads-routing-rules)
 * 4. AI tool (Mastra transfer_to_human / transfer_to_team)
 * 5. Workflow (AssignStepFactory)
 *
 * Persistido em:
 * - `Activity.metadata` (Lead, via módulo activities polimórfico)
 * - `SystemContent.details` em ConversationMessage (Conversation, com action='assignment_changed')
 * - Campo `metadata` da entry em ticket-activities (Ticket)
 *
 * O texto humano em pt-BR é montado no read pelo backend (mapToResponse) a
 * partir deste contexto + nomes resolvidos via Two-Phase Fetch.
 */

/** Origem temporal/categoria da atribuição. */
export type AssignmentSource =
  | 'manual'   // Usuário acionou o /transfer ou assign na UI
  | 'auto'     // Sistema atribuiu automaticamente (depois da criação)
  | 'creation'; // Atribuição automática no momento da criação da entidade

/**
 * Estratégia/lógica que decidiu o destinatário.
 *
 * Os valores `sequential` … `last_interaction` são exatamente os
 * `DistributionStrategy` aplicados quando `source === 'auto'` ou `'creation'`.
 *
 * Os valores `manual`, `routing_rule`, `ai_tool` e `workflow` representam
 * caminhos que não passam pelo DistributionService diretamente (ou que
 * passam mas trazem contexto adicional, como uma regra ou um agente IA).
 */
export type AssignmentStrategy =
  | 'manual'
  | 'sequential'
  | 'fixed_operator'
  | 'fixed_team'
  | 'shift'
  | 'availability'
  | 'last_interaction'
  | 'routing_rule'
  | 'ai_tool'
  | 'workflow'
  /** Usuário puxou o atendimento para si (startAttendance). */
  | 'self_assigned'
  /** Regra Lead → Conversa (syncConversationAssigneeIfEligible). */
  | 'lead_sync'
  /** Lead criado pela página pública do QR Code, já atribuído ao vendedor que gerou o QR (spec §4.1). */
  | 'qr_capture'
  /** Transferência automática porque o responsável não respondeu ao cliente a tempo (spec 2026-09-29). */
  | 'inactivity_transfer'
  /** Conversa nova entregue ao responsável pelo lead aberto do contato, antes da distribuição do canal (2026-10-01). */
  | 'lead_owner';

/** Por que o responsável pelo lead NÃO recebeu a conversa (2026-10-01). */
export type LeadOwnerSkipReason =
  /** Não está vinculado ao canal da conversa. */
  | 'not_in_channel'
  /** Usuário desativado ou excluído. */
  | 'inactive'
  /** A transferência era para uma equipe da qual ele não faz parte. */
  | 'not_in_team';

/**
 * Contexto canônico passado pros services de domínio (`LeadsService`,
 * `ConversationsService`, `TicketsService`) ao executar uma atribuição.
 *
 * É também a forma persistida em metadata — todos os campos de ID ficam
 * normalizados (string), os nomes correspondentes são resolvidos via
 * Two-Phase Fetch no read.
 */
export interface AssignmentContext {
  source: AssignmentSource;
  strategy: AssignmentStrategy;

  /** User que disparou (quando humano). null/undefined em automações puras. */
  actorId?: string;

  /** Justificativa textual livre informada pelo operador (se houver). */
  reason?: string;

  /** Estado anterior. */
  fromUserId?: string | null;
  fromTeamId?: string | null;

  /** Estado novo. `null` significa unassign explícito. */
  toUserId?: string | null;
  toTeamId?: string | null;

  // ── Campos específicos por origem ─────────────────────────────────────

  /** Quando `strategy === 'routing_rule'`. */
  routingRuleId?: string;

  /** Quando `strategy === 'ai_tool'`. */
  aiAgentId?: string;
  aiToolName?: string;

  /** Quando `strategy === 'workflow'`. */
  workflowId?: string;

  /** Quando `strategy === 'last_interaction'` — pra texto "anterior: Pedro". */
  previousUserId?: string;

  // ── Metadata da resolução interna do DistributionService ──────────────
  // Preenchidos quando a estratégia principal (ai_tool/manual/workflow)
  // delegou a ESCOLHA do usuário ao motor de distribuição, ou quando a
  // própria distribuição automática rodou. Permitem que o texto diga
  // "por rodízio da equipe Vendas" sem inferência.

  /** Estratégia que o motor efetivamente usou (result.strategyUsed). */
  distributionStrategy?: DistributionStrategy;
  /** Equipe resolvida pelo motor (fixed_team / transferência para equipe). */
  distributionTeamId?: string;
  /** Tamanho da pool elegível no momento da escolha. */
  distributionPoolSize?: number;

  // ── Transferência por inatividade (strategy === 'inactivity_transfer') ──

  /** Prazo configurado no canal, em minutos, que o responsável anterior deixou passar. */
  inactivityMinutes?: number;
  /** Número desta transferência dentro da mesma espera do cliente (1, 2, 3…). */
  inactivityAttempt?: number;
  /** Se o prazo contou só o horário comercial — o texto diz "de expediente". */
  businessHoursOnly?: boolean;

  // --- Transferência da IA para o dono do lead (spec 2026-09-30-ia-transfere-para-dono-do-lead) ---
  /** Id do lead cujo dono decidiu o destino (transferência da IA ou conversa nova) — o texto diz "responsável pelo lead". */
  leadOwnerLeadId?: string;

  // --- Responsável pelo lead que NÃO pôde receber (2026-10-01) ---
  /** Quem é o responsável pelo lead que ficou de fora — o texto registra o nome e o motivo abaixo. */
  skippedLeadOwnerId?: string;
  /** Por que ele ficou de fora. Só faz sentido junto de `skippedLeadOwnerId`. */
  skippedLeadOwnerReason?: LeadOwnerSkipReason;
}
