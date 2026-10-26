import { ObjectId } from 'mongodb';
import type { ActorType } from './common';

import type { DatabaseType } from './databases';
import type { FormField } from './forms';
import { FormFieldType } from './forms';

// ============================================================
// WORKFLOW TYPES
// ============================================================

/**
 * Node Types - All supported node types for workflows.
 *
 * SINGLE SOURCE OF TRUTH: add new node types here only.
 * The WorkflowNodeType union is derived from this array so that
 * runtime validators (Zod enums) can import WORKFLOW_NODE_TYPES
 * directly and stay in sync automatically.
 */
export const WORKFLOW_NODE_TYPES = [
  // Triggers
  'trigger_webhook',
  'trigger_schedule',
  'trigger_event',
  'trigger_manual',
  'trigger_date_field',
  'trigger_inactivity',
  'trigger_instagram_comment',
  'trigger_instagram_mention',
  // Actions
  'action_send_message',
  'action_send_email',
  'action_send_template',
  'action_send_media',
  'action_http_request',
  'action_query_database',
  'action_create_lead',
  'action_update_lead',
  'action_update_contact',
  'action_add_tag',
  'action_remove_tag',
  'action_assign',
  'action_set_variable',
  'action_create_conversation',
  'action_transfer_conversation',
  'action_satisfaction_survey',
  'action_ask_question',
  'action_ask_form',
  'action_next_number',
  'action_save_form_response',
  'action_create_ticket',
  'action_internal_notification',
  'action_find_leads',
  'action_create_database_document',
  'action_mirror_media',
  'action_voice_clone',
  'action_voice_tts',
  'action_voice_clone_delete',
  'action_create_checklist',
  'action_find_unit',
  'action_find_user',
  'action_find_contact',
  'action_url_to_pdf',
  'action_nfe_pdf',
  // Controls
  'control_if',
  'control_switch',
  'control_wait_for',
  'control_loop',
  'control_split',
  'control_retry_scope',
  // AI
  'ai_agent',
  'ai_agent_inline',
  // Skill
  'skill_input',
  'skill_output',
] as const;

/** Derived from WORKFLOW_NODE_TYPES — do not edit manually. */
export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];

/**
 * Nós que têm a aba Filtros em `data.filters` (spec 2026-09-14 §5.3): os que "fazem algo".
 * Gatilhos guardam os seus em `config.filters` (aplicados no DISPARO); Se/Selecionar/leque/
 * Repetir/Tentar de novo e skill_output já são a condição ou o fim, não filtram.
 */
export const WORKFLOW_FILTERABLE_NODE_TYPES: readonly WorkflowNodeType[] = WORKFLOW_NODE_TYPES.filter(
  (t) => t.startsWith('action_') || t === 'ai_agent' || t === 'ai_agent_inline' || t === 'control_wait_for' || t === 'skill_input',
);

export function nodeTypeAcceptsFilters(type: string): boolean {
  return (WORKFLOW_FILTERABLE_NODE_TYPES as readonly string[]).includes(type);
}

/**
 * Saídas "Sucesso" e "Falha" (2026-09-23, nó Transferir conversa): nó de ação
 * que pode NÃO conseguir fazer o que promete ganha duas saídas, e o desenho
 * decide o que acontece em cada caso. Fonte ÚNICA para a tela (alças do nó),
 * o validador e o compilador.
 *
 * O nó devolve `{ success: boolean }`: `true` segue pela saída `success`,
 * `false` pela `failure`. Sem ligação na saída Falha o nó LANÇA quando não
 * consegue — a execução falha com o motivo, em vez de terminar calada.
 */
export const WORKFLOW_SUCCESS_HANDLE = 'success';
export const WORKFLOW_FAILURE_HANDLE = 'failure';

export const WORKFLOW_SUCCESS_FAILURE_NODE_TYPES: readonly WorkflowNodeType[] = [
  'action_transfer_conversation',
  'action_satisfaction_survey',
  'action_save_form_response',
];

export function nodeTypeHasSuccessFailureOutputs(type: string): boolean {
  return (WORKFLOW_SUCCESS_FAILURE_NODE_TYPES as readonly string[]).includes(type);
}

/**
 * Workflow Statuses — runtime constant + derived type.
 */
export const WORKFLOW_STATUSES = ['active', 'inactive', 'draft', 'archived'] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

/**
 * Pausa automática (2026-08-22): um workflow ativo vira `inactive` sozinho
 * quando as últimas N execuções terminadas (sem as de teste) falharam, ou
 * quando um canal que ele usa é excluído. `autoPause` guarda o motivo; é
 * limpo ao reativar.
 */
export const WORKFLOW_AUTO_PAUSE_CONSECUTIVE_FAILURES = 10;

/**
 * Aviso de falha frequente (2026-09-15). A pausa automática ignora falha
 * PARCIAL (galho paralelo quebrado com o irmão entregando) — e foi assim que o
 * workflow "AUTOMAÇÃO PÓS VENDA" falhou 3.790 vezes em 13 dias sem ninguém
 * saber. O aviso tem contagem PRÓPRIA: entre as últimas `WINDOW` execuções
 * finalizadas (fora teste, cancelada e falha por estado do cliente — falha
 * parcial CONTA), `THRESHOLD` ou mais falharam → avisa quem pode editar
 * workflows, no máximo 1 vez a cada `INTERVAL_HOURS` por workflow. Só avisa;
 * pausar pararia também o galho que funciona.
 */
export const WORKFLOW_FREQUENT_FAILURES_WINDOW = 20;
export const WORKFLOW_FREQUENT_FAILURES_THRESHOLD = 5;
export const WORKFLOW_FREQUENT_FAILURES_ALERT_INTERVAL_HOURS = 24;
export const WORKFLOW_AUTO_PAUSE_REASONS = ['consecutive_failures', 'channel_deleted'] as const;
export type WorkflowAutoPauseReason = (typeof WORKFLOW_AUTO_PAUSE_REASONS)[number];

export interface WorkflowAutoPauseDetails {
  /** `consecutive_failures`: quantas falhas seguidas (= a constante no momento). */
  consecutiveFailures?: number;
  /** `consecutive_failures`: `error` da execução que fechou a sequência. */
  lastError?: string;
  /** `channel_deleted`: canal excluído. */
  channelId?: string;
  channelName?: string;
}

export interface WorkflowAutoPauseInfo {
  reason: WorkflowAutoPauseReason;
  at: Date;
  details: WorkflowAutoPauseDetails;
}

/** Forma na API (`at` em ISO). */
export interface WorkflowAutoPauseResponse {
  reason: WorkflowAutoPauseReason;
  at: string;
  details: WorkflowAutoPauseDetails;
}

/**
 * Execution Statuses — runtime constant + derived type.
 */
export const WORKFLOW_EXECUTION_STATUSES = ['pending', 'running', 'completed', 'failed', 'cancelled', 'suspended'] as const;
export type WorkflowExecutionStatus = (typeof WORKFLOW_EXECUTION_STATUSES)[number];

/**
 * Status em que a execução ainda está VIVA e pode mudar. Tudo fora daqui
 * (`completed`, `failed`, `cancelled`) é final e NUNCA é sobrescrito — é o que
 * impede o fim normal de um run (ou uma retomada atrasada) de transformar um
 * "cancelado" em "concluído" (spec 2026-09-14, invariante I2).
 */
export const WORKFLOW_EXECUTION_OPEN_STATUSES = ['pending', 'running', 'suspended'] as const satisfies readonly WorkflowExecutionStatus[];

/**
 * Node Run Entry Status
 */
export type NodeRunEntryStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'suspended';

// ============================================================
// NODE CONFIGURATION INTERFACES
// ============================================================

/**
 * Catálogo canônico de operadores de condição/filtro do motor de workflows.
 * FONTE ÚNICA — o ConditionEvaluator do backend, o buildMongoFilterConditions
 * (dispatchers + preview) e o FILTER_OPERATORS da UI derivam deste catálogo.
 *
 * 'greater_or_equal' e 'less_or_equal' são ALIASES aceitos em runtime
 * (normalizados para 'greater_than_or_equal'/'less_than_or_equal') porque
 * configs históricos criados pela UI usam essa grafia.
 */
export const WORKFLOW_CONDITION_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal',
  'greater_or_equal',   // alias legado (UI) de greater_than_or_equal
  'less_or_equal',      // alias legado (UI) de less_than_or_equal
  'is_empty',
  'is_not_empty',
  'is_null',
  'is_not_null',
  'in',
  'not_in',
  'matches_regex',
] as const;

export type WorkflowConditionOperator = typeof WORKFLOW_CONDITION_OPERATORS[number];

/**
 * Filter Condition - Standard format for workflow filters
 * Used by triggers and conditions to filter entities
 */
export interface FilterCondition {
  /** Field path to evaluate (e.g., "status", "lead.stepId", "{{contact.tags}}") */
  field: string;
  /** Comparison operator (catálogo canônico WORKFLOW_CONDITION_OPERATORS) */
  operator: WorkflowConditionOperator;
  /** Value to compare against */
  value: string | number | boolean | null | string[] | number[];
}

/**
 * Bloco `system` do contexto de execução — injetado pelo `WorkflowRunner` em
 * TODA execução, independente do gatilho, e RECALCULADO quando o fluxo acorda
 * de uma espera (senão um workflow suspenso por 12h decidiria com a hora
 * antiga).
 *
 * Serve para condições de tempo sem node dedicado: o `control_if` já resolve
 * qualquer caminho do contexto, então "fora do horário comercial" é
 * `{{system.isBusinessHours}}` igual a `false`.
 *
 * A janela vem de `company.businessCalendar` — o MESMO calendário do motor de
 * SLA, com feriados nacionais/próprios e os intervalos do dia (o padrão
 * semeado é 08:00–12:00 e 13:00–18:00, então o almoço conta como FORA).
 * Empresa sem calendário configurado, ou com ele desligado, responde
 * `isBusinessHours: true` — fail-open, para não mudar o comportamento de quem
 * nunca configurou nada.
 */
export interface WorkflowSystemContext {
  /** Estamos dentro de um intervalo de atendimento agora? */
  isBusinessHours: boolean;
  /** Hoje é feriado no calendário da empresa? */
  isHoliday: boolean;
  /** Nome do feriado, quando `isHoliday`. */
  holidayName?: string;
  /** Dia da semana no fuso da empresa (0=Domingo … 6=Sábado). */
  weekday: number;
  /** Hora local no fuso da empresa, 'HH:mm'. */
  time: string;
  /** Data local no fuso da empresa, 'YYYY-MM-DD'. */
  date: string;
  /** Fuso usado no cálculo (IANA). */
  timezone: string;
}

/**
 * Webhook Trigger Configuration
 */
export interface WebhookTriggerConfig {
  webhookId?: string;
  secret?: string;
  /**
   * "Executar uma única vez por identifier" (2026-09-15, desligado por padrão).
   * Ligado: o corpo do POST precisa trazer `identifier` (texto/número, até
   * `WORKFLOW_EXECUTION_IDENTIFIER_MAX_LENGTH`) e, se já existe execução deste
   * workflow com o mesmo identifier, a plataforma devolve a execução anterior
   * (`duplicate: true`) em vez de rodar de novo. Nasceu do incidente de leads
   * triplicados (reenvio de venda pelo coletor de ERP).
   */
  singleExecutionPerIdentifier?: boolean;
}

/** Tamanho máximo do `identifier` aceito pelo gatilho de webhook. */
export const WORKFLOW_EXECUTION_IDENTIFIER_MAX_LENGTH = 200;

/**
 * Schedule Trigger Configuration (Cron)
 */
export interface ScheduleTriggerConfig {
  cronExpression: string;
  timezone?: string;
}

/**
 * Event Trigger Configuration
 */
export interface EventTriggerConfig {
  eventType: WorkflowEventType;
  /**
   * Para eventos *.updated: dispara apenas se algum destes campos estiver
   * na lista de campos alterados publicada pelo evento (`changes`).
   * Vazio/ausente = dispara em qualquer alteração.
   */
  watchFields?: string[];
  filters?: FilterCondition[];
}

/**
 * Date Field Entity Types - All supported entity types for date field triggers
 */
export type DateFieldEntityType = 'contact' | 'lead' | 'ticket' | 'conversation' | 'event';

/**
 * Date Fields Map - Maps each entity type to its valid date fields
 * This ensures type-safety when configuring date field triggers
 *
 * IMPORTANT: When adding new date fields to entities, update this map!
 */
export interface DateFieldsMap {
  contact: 'createdAt' | 'updatedAt' | 'lastInteractionAt' | 'birthDate' | 'lastContactedAt';
  lead: 'createdAt' | 'updatedAt' | 'assignedAt' | 'wonDate' | 'lostDate' | 'lastInteractionAt' | 'lastFollowUpAt' | 'lastStepAt' | 'expectedCloseDate' | 'lastActivityAt';
  ticket: 'createdAt' | 'updatedAt' | 'assignedAt' | 'dueDate' | 'firstResponseAt' | 'lastResponseAt' | 'resolvedAt' | 'closedAt' | 'slaBreachTime';
  conversation: 'createdAt' | 'updatedAt' | 'startedAt' | 'closedAt' | 'lastMessageAt' | 'lastMessageFromCustomer' | 'assignedAt' | 'slaBreachTime';
  event: 'startTime' | 'endTime' | 'createdAt' | 'updatedAt';
}

/**
 * Helper type to extract valid date fields for a specific entity type
 */
export type ValidDateFieldsFor<T extends DateFieldEntityType> = DateFieldsMap[T];

/**
 * Date Field Trigger Configuration (Type-Safe with Generics)
 *
 * Uses generics to ensure type-safety between entityType and dateField.
 * TypeScript will enforce that dateField is a valid date field for the specified entity.
 *
 * @example
 * // Type-safe configuration:
 * const config: DateFieldTriggerConfig<'event'> = {
 *   entityType: 'event',
 *   dateField: 'startTime', // ✅ Valid - only 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' allowed
 *   offsetValue: 1,
 *   offsetUnit: 'hours',
 *   offsetDirection: 'before'
 * };
 *
 * // This would cause a TypeScript error:
 * const badConfig: DateFieldTriggerConfig<'event'> = {
 *   entityType: 'event',
 *   dateField: 'startDate', // ❌ Error: 'startDate' is not assignable to 'startTime' | 'endTime' | ...
 *   ...
 * };
 */
export interface DateFieldTriggerConfig<T extends DateFieldEntityType> {
  entityType: T;
  dateField: ValidDateFieldsFor<T>;
  /** Numeric value for the offset (0 or greater) */
  offsetValue: number;
  /** Unit for the offset */
  offsetUnit: 'minutes' | 'hours' | 'days';
  /** 'exact' = disparar exatamente na data (offset é ignorado/zerado pelo motor) */
  offsetDirection: 'before' | 'after' | 'exact';
  filters?: FilterCondition[];
}

/**
 * Union type of all valid date field trigger configs
 * Use this when you need to accept any valid configuration without specifying entity type
 */
export type AnyDateFieldTriggerConfig =
  | DateFieldTriggerConfig<'contact'>
  | DateFieldTriggerConfig<'lead'>
  | DateFieldTriggerConfig<'ticket'>
  | DateFieldTriggerConfig<'conversation'>
  | DateFieldTriggerConfig<'event'>;

/**
 * Inactivity Trigger Configuration
 */
export interface InactivityTriggerConfig {
  entityType: 'conversation' | 'contact' | 'lead' | 'ticket';
  inactivityPeriod: number; // The numeric value (interpreted based on periodUnit)
  periodUnit?: 'seconds' | 'minutes' | 'hours' | 'days'; // default: 'hours' (unificado com o dispatcher em 2026-07-06 — o antigo comentário 'seconds' nunca refletiu o runtime)
  inactivityField?: string; // default por entidade: conversation→lastMessageAt, contact→lastInteractionAt, lead→lastActivityAt, ticket→lastResponseAt (InactivityTriggerDispatcher)
  filters?: FilterCondition[];
  maxTriggersPerEntity?: number; // default: 1
  resetOnActivity?: boolean; // default: true
}

/**
 * Instagram Comment Trigger Configuration
 *
 * - keyword: case-insensitive "contains" match against the comment text.
 *   Empty/absent = any comment triggers.
 * - postId: Instagram media ID (Graph API media id, e.g. "17887498072083520").
 *   Equality match. Empty/absent = all posts/reels of the connected account.
 */
export interface InstagramCommentTriggerConfig {
  keyword?: string;
  postId?: string;
}

/**
 * Instagram Mention Trigger Configuration
 *
 * Fires when the connected professional account is @-mentioned on Instagram —
 * either in a media caption (Meta webhook field 'mentions' with `value.media_id`)
 * or in a comment (`value.comment_id` + `value.media_id`).
 *
 * - keyword: case-insensitive "contains" match against the mention text (the
 *   caption/comment where the account was tagged). Empty/absent = any mention
 *   triggers. When the text cannot be resolved from the webhook (minimal
 *   payload without Advanced Access), an empty keyword still fires; a non-empty
 *   keyword will not match an unresolved (empty) text.
 */
export interface InstagramMentionTriggerConfig {
  keyword?: string;
}

/**
 * Business hours gate para nodes de SAÍDA de workflows (2026-08).
 *
 * Quando `enabled: true` e o run atinge o node FORA da janela, o run SUSPENDE
 * (snapshot + BullMQ delayed job) e retoma no próximo instante válido — só
 * então o envio acontece. Payload de suspensão: `{ reason: 'business_hours',
 * resumeAt }` (ver BusinessHoursSuspendPayload no backend).
 *
 * Shape deliberadamente compatível com a futura entidade `business-calendars`
 * (DOCS/superpowers/specs/2026-07-27-sla-helpdesk-pesquisa.md §6.2): weekday
 * domingo-zero como ShiftSchedule.weekdays, janela única por dia — o calendário
 * futuro generaliza para múltiplos slots/dia. SEM feriados no MVP.
 */
export interface WorkflowBusinessHoursConfig {
  /** Ativo somente quando `=== true`. `false` preserva a janela configurada sem aplicá-la. */
  enabled: boolean;
  /** Dias ativos, 0=Dom..6=Sáb. Vazio é inválido (rejeitado no save). */
  weekdays: number[];
  /** "HH:mm" — início da janela (inclusive). */
  startTime: string;
  /** "HH:mm" — fim da janela (exclusive). Deve ser > startTime (sem janela overnight no MVP). */
  endTime: string;
  /** IANA tz. Ausente = timezone da company (fallback America/Sao_Paulo). */
  timezone?: string;
}

/**
 * Node types de saída que suportam `businessHours` (UI + validação backend).
 * `action_send_media` e `action_internal_notification` não têm interface de
 * config canônica neste pacote (fallback `Record<string, unknown>`) mas também
 * aceitam o campo — as interfaces locais vivem nos respectivos step factories.
 */
export const BUSINESS_HOURS_NODE_TYPES = [
  'action_send_message',
  'action_send_template',
  'action_send_media',
  'action_send_email',
  'action_internal_notification',
  'ai_agent',
  'ai_agent_inline',
] as const;

export type BusinessHoursNodeType = (typeof BUSINESS_HOURS_NODE_TYPES)[number];

/**
 * Send Message Action Configuration
 */
export interface SendMessageActionConfig {
  // Destino
  targetType?: 'current' | 'new_conversation';
  channelId?: string;
  /**
   * Origem do destinatário quando `targetType='new_conversation'`:
   *  - `context`: usa o contato do contexto do workflow (`inputData.contact.id`)
   *  - `specific`: usa `contactId` fixo configurado
   *  - `trigger_author`: responde o autor do evento (comentário/menção no
   *    Instagram) resolvendo o IGSID de `triggerData.from.id`. O contato é
   *    criado sob demanda quando o comentarista/mentionador ainda não existe
   *    na base. Nesse modo, o canal cai para `triggerData.channelId` quando
   *    `channelId` não é configurado.
   *  - `variable`: contactId vem de `{{variável}}` do fluxo (ex.: saída de um node de busca)
   */
  contactSource?: 'context' | 'specific' | 'trigger_author' | 'variable';
  contactId?: string;

  // Conteúdo
  messageType?: 'text' | 'image' | 'audio' | 'video' | 'document';
  message?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;

  // Legacy (compat)
  conversationId?: string;

  /** Janela de horário comercial — fora dela o run suspende até o próximo horário válido. */
  businessHours?: WorkflowBusinessHoursConfig;
}

/**
 * Send Email Action Configuration
 *
 * Note: `templateId`/`templateVariables` were removed (2026-07-06) — they were
 * never reachable from the UI and `SendEmailStepFactory` ignored `templateId`.
 * Emails are sent as free-form body via SystemEmailService.
 */
export interface SendEmailActionConfig {
  to: string;
  subject: string;
  body: string;
  /** Janela de horário comercial — fora dela o run suspende até o próximo horário válido. */
  businessHours?: WorkflowBusinessHoursConfig;
}

/**
 * HTTP Request Action Configuration
 */
export interface HttpRequestActionConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  timeout?: number;
  retryAttempts?: number;
  /**
   * Aguardar callback externo (2026-07): após disparar a requisição, o run
   * SUSPENDE e só retoma quando o provedor externo fizer POST no endpoint
   * público `/api/workflows/callbacks/:correlationId` (URL-capacidade — o
   * template `{{$.__callback.url}}` fica disponível para o body/headers) ou
   * quando `callbackTimeoutMs` expirar. Output do node vira
   * `{ outcome: 'success'|'error'|'timeout', body: <corpo do callback> }`.
   */
  awaitCallback?: boolean;
  /** Timeout da espera do callback em ms (default 20min). */
  callbackTimeoutMs?: number;
  /**
   * Predicado que precisa casar no corpo do callback para RETOMAR com sucesso
   * (ex.: Suno music `{path:'data.callbackType', equals:'complete'}`).
   * Ausente = qualquer callback retoma. Callbacks que não casam nem com
   * resumeWhen nem com failWhen são ignorados com 200 (estágios intermediários).
   */
  resumeWhen?: WorkflowCallbackPredicate;
  /**
   * Predicado de FALHA no corpo do callback (a Suno sinaliza erro no corpo,
   * não no HTTP — ex.: `{path:'data.status', equals:'fail'}`). Casou → retoma
   * pela saída de erro (`outcome:'error'`).
   */
  failWhen?: WorkflowCallbackPredicate;
}

/** Predicado simples caminho==valor avaliado no corpo de um callback externo. */
export interface WorkflowCallbackPredicate {
  /** Caminho dot-notation no corpo do callback (ex.: 'data.callbackType'). */
  path: string;
  /** Valor exato (comparação por String(valor) === equals). */
  equals: string;
}

/**
 * Retry Scope Control Configuration (2026-07)
 *
 * Subgrafo retentável: os nós FILHOS (React Flow `parentId`) formam um
 * sub-workflow que é reexecutado (Mastra `.dountil`) até a iteração terminar
 * sem falha ou `maxAttempts` esgotar. Falha de iteração = node interno lançou
 * erro OU awaitCallback saiu com `outcome` 'error'/'timeout'.
 */
export interface RetryScopeControlConfig {
  /** Máximo de tentativas do subgrafo (default 3, cap 5). */
  maxAttempts?: number;
  /** Delay entre tentativas em ms (default 5000, cap 60000 — inline sleep). */
  retryDelayMs?: number;
}

/**
 * Mirror Media Action Configuration (2026-07)
 *
 * Baixa uma URL externa (SSRF-guard aplicado) e re-hospeda no S3 do sistema —
 * necessário para mídias de APIs externas com URL expirável (ex.: Suno).
 * `trimSeconds` corta os primeiros N segundos de um MP3 (frame-walking JS,
 * sem re-encode) — usado para gerar prévias configuráveis.
 */
export interface MirrorMediaActionConfig {
  /** URL externa do arquivo (aceita templates). */
  url: string;
  /** Prefixo do nome do arquivo no S3 (default 'workflow-media'). */
  filenamePrefix?: string;
  /** Se definido, corta os primeiros N segundos do MP3 (prévia). */
  trimSeconds?: number;
}

/**
 * Voice Clone Action Configuration (2026-07)
 *
 * Clona a voz de uma URL de áudio no provider de TTS (ElevenLabs via
 * app-integrations) e gera uma amostra falada expressiva hospedada no S3.
 * O clone é EFÊMERO (registro + janitor no módulo voices) — deletar via
 * action_voice_clone_delete ao final do fluxo.
 */
export interface VoiceCloneActionConfig {
  /** URL pública do áudio com a voz a clonar (aceita templates). */
  voiceUrl: string;
  /** Texto da amostra gerada (default: texto expressivo pt-BR do sistema). */
  sampleText?: string;
  /** voice_settings do provider (fidelidade). */
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    speakerBoost?: boolean;
  };
}

/** TTS com um clone efêmero existente → mp3 no S3. */
export interface VoiceTtsActionConfig {
  /** cloneId retornado pelo action_voice_clone (aceita templates). */
  cloneId: string;
  /** Texto a sintetizar (aceita templates — ex.: frase de verificação). */
  text: string;
}

/** Deleta um clone efêmero (libera slot no provider). */
export interface VoiceCloneDeleteActionConfig {
  /** cloneId a deletar (aceita templates). */
  cloneId: string;
}

/**
 * Query Database Action Configuration
 *
 * Queries the RAG databases (databases-documents) — same contract used by the
 * AI agents' search tools. Rewritten 2026-07-06: the old shape
 * `{ collection, operation, query, outputVariable }` targeted a dead Mongo API.
 */
export interface QueryDatabaseActionConfig {
  /** Type of database to search (properties, vehicles, products, services, documents) */
  databaseType: DatabaseType;
  /** Names of the databases to search within (empty = validation error at design time) */
  databaseNames: string[];
  /** Free-text semantic search — supports {{variable}} templates */
  searchText?: string;
  /** Structured filters applied post-vector (aligned with Database{Type}Data schema) */
  structuredFilters?: Record<string, unknown>;
  /** Max results (default defined by the step factory) */
  limit?: number;
}

/**
 * Create Lead Action Configuration
 */
export interface CreateLeadActionConfig {
  /**
   * Source type for the contact ID.
   * - 'context': extract from workflow context (contact, conversation, event)
   * - 'specific': use the `contactId` configured in the node
   * - `variable`: o `contactId` vem de uma `{{variável}}` do fluxo — ex.: a
   *   saída de um node de busca de contato (`{{variables.clienteContato.contact.id}}`).
   *   Mesmo padrão do `SendMessageActionConfig.contactSource`.
   * @default 'context'
   */
  contactSource?: 'context' | 'specific' | 'variable';
  contactId?: string;
  funnelId?: string;
  step?: string;
  description?: string;
  value?: number;
  /**
   * Assignment mode — 'auto' uses the funnel's distribution, 'user'/'team' are direct.
   *
   * - `variable`: o responsável vem de uma `{{variável}}` do fluxo, gravada no
   *   MESMO campo `userId` — ex.: `{{event.userId}}` para atribuir ao criador do
   *   evento de agenda que disparou o workflow. Mesmo padrão do `contactSource`
   *   acima. O motor trata igual a `'user'`: a única diferença é qual controle
   *   a UI mostra (dropdown de usuários vs. campo de variável).
   */
  assignTo?: 'auto' | 'user' | 'team' | 'variable';
  /** Target user when assignTo === 'user' | 'variable' (aceita {{variável}}) */
  userId?: string;
  /** Target team when assignTo === 'team' */
  teamId?: string;
  /** Reaproveita lead aberto (não won/lost) do contato no funil em vez de criar. */
  reuseOpenLead?: boolean;
  /** Onde procurar lead aberto ao reaproveitar: só no funil do node (default) ou em qualquer funil. */
  reuseScope?: 'funnel' | 'all';
  /** Unidade onde a venda/captura aconteceu — gravada em lead.capture.unitId (aceita {{variável}}). */
  unitId?: string;
  /** Origem do lead (ex.: 'erp'). Aceita {{variável}}. */
  origin?: string;
  /** Nome em variables onde a saída { lead, reused } é gravada. */
  saveAs?: string;
}

/**
 * Update Lead Action Configuration
 */
export interface UpdateLeadActionConfig {
  /**
   * Source type for the lead ID.
   * - 'context': extract from workflow context (lead)
   * - 'specific': use the `leadId` configured in the node
   * @default 'context'
   */
  leadSource?: 'context' | 'specific';
  /** Target lead when leadSource === 'specific' */
  leadId?: string;
  /** Whitelisted lead fields to update — values support {{variable}} templates */
  fields: Record<string, unknown>;
}

/**
 * Send Template Action Configuration
 */
export interface SendTemplateActionConfig {
  /** Channel used to send the template (defines provider + template source) */
  channelId: string;
  /** ID of the approved template to send */
  templateId: string;
  /** Template variables — values support {{variable}} templates */
  templateVariables?: Record<string, string>;
  /** Optional explicit contact — defaults to the contact from workflow context */
  contactId?: string;
  /** Janela de horário comercial — fora dela o run suspende até o próximo horário válido. */
  businessHours?: WorkflowBusinessHoursConfig;
  /**
   * URL do arquivo do cabeçalho, no ENVIO. Aceita interpolação do fluxo
   * (ex.: `{{variables.notaPdf.url}}`), porque no caso de uso o PDF é gerado
   * em tempo de execução pelo node de nota fiscal.
   */
  headerMediaUrl?: string;
  /** Nome do arquivo mostrado ao cliente. Também aceita interpolação. */
  headerMediaFilename?: string;
}

/**
 * Create Ticket Action Configuration
 */
export interface CreateTicketActionConfig {
  title: string;
  description?: string;
  /** Target pipeline — when omitted, the service resolves the default pipeline */
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Update Contact Action Configuration
 */
export interface UpdateContactActionConfig {
  /**
   * Source type for the contact to update.
   * - 'context' (default): use the contact from workflow context (contact / trigger author)
   * - 'specific': use the `contactId` configured in the node (required in this mode)
   * @default 'context'
   */
  contactSource?: 'context' | 'specific';
  contactId?: string;
  addTags?: string[];
  removeTags?: string[];
  customFields?: Record<string, unknown>;
}

/**
 * Create Checklist Action Configuration (modulo Checklists+Units)
 *
 * Dispara a criacao de um ou mais Checklists a partir de um Form template do
 * tipo 'checklist' (templateId), definindo o(s) destino(s) (units) e quem
 * fica responsavel (assignee) por cada instancia criada.
 */
/**
 * Alvo do node: SEMPRE unidades (sorteadas ou fixas).
 *
 * O modo `context_entity` (criar 1 checklist ligado ao lead/ticket do contexto)
 * foi REMOVIDO em 14/08/2026 por decisão do dono: nunca foi solicitado e só
 * fazia sentido em automação disparada por uma entidade. No gatilho agendado —
 * que é o caso de uso real, o sorteio diário — não existe entidade no contexto,
 * então a configuração salvava, ativava e não criava nada, em silêncio.
 */
export type CreateChecklistTarget =
  | { mode: 'draw_units'; count: number }
  | { mode: 'fixed_units'; unitIds: string[] };

export type CreateChecklistAssignee =
  | { mode: 'unit_manager' }
  | { mode: 'fixed_user'; userId: string };

export interface CreateChecklistActionConfig {
  templateId: string;
  target: CreateChecklistTarget;
  assignee: CreateChecklistAssignee;
  /** Prazo do checklist criado, em MINUTOS. Ausente = usa o padrão do modelo. */
  dueMinutes?: number;
  addCreatorAsFollower?: boolean;
}

/** Node de busca: unidade por CNPJ/CPF. Saída { found, unit } gravada em variables[saveAs]. */
export interface FindUnitActionConfig {
  document: string;
  saveAs: string;
}

/** Node de busca: usuário por documento → código → email (cascata). Saída { found, user, matchedBy }. */
export interface FindUserActionConfig {
  document?: string;
  code?: string;
  email?: string;
  saveAs: string;
}

/** Node de busca/criação: contato por telefone → email. Saída { found, contact, created }. */
export interface FindContactActionConfig {
  phone?: string;
  email?: string;
  name?: string;
  createIfMissing?: boolean;
  saveAs: string;
}

/**
 * Url To Pdf Action Configuration (Task D2, 2026-08-26)
 *
 * Converte uma PÁGINA WEB em PDF (Gotenberg/Chromium) e hospeda o arquivo no
 * S3, devolvendo a URL pública — é o que anexa a NOTA FISCAL na mensagem de
 * pós-venda (a Linx devolve só o XML; o PDF sai da página pública da SEFAZ).
 * O node é genérico de propósito: serve contrato, proposta, catálogo, recibo.
 *
 * Saída gravada em `variables[saveAs]` (CLAUDE.md NUNCA #91):
 * `{ ok, url, filename, erro }` — `url`/`filename` vazios quando `ok: false`.
 * O node é FAIL-SOFT: nenhuma falha sobe como erro de execução.
 */
export interface UrlToPdfActionConfig {
  /** Página a converter. Aceita template: '{{triggerData.body.documentoFiscal.url}}'. */
  url: string;
  /** Nome do arquivo entregue no WhatsApp. Template. Default 'documento.pdf'. Extensão .pdf é garantida. */
  filename?: string;
  /** Espreme todo o conteúdo numa página só (bom para cupom/nota). Default false. */
  singlePage?: boolean;
  /** Nome da variável do fluxo onde o resultado é guardado (NUNCA #91). Obrigatório. */
  saveAs: string;
}

/**
 * Nfe Pdf Action Configuration (Task D8, 2026-08-26)
 *
 * Gera o PDF da NOTA FISCAL (DANFE NFC-e, modelo 65) a partir do XML
 * autorizado que o coletor do ERP entrega no webhook, hospeda no S3 e devolve
 * a URL pública — é o anexo que o cliente recebe no WhatsApp depois da compra.
 *
 * Diferente do `action_url_to_pdf`, que fotografa uma página de terceiro, aqui
 * o documento é montado por nós a partir do XML: a URL de consulta da SEFAZ
 * sai do próprio arquivo (`infNFeSupl/urlChave`), então uma nota do Rio Grande
 * do Sul nunca imprime o endereço de outro estado.
 *
 * Saída gravada em `variables[saveAs]` (CLAUDE.md NUNCA #91):
 * `{ ok, url, filename, numero, chave, erro }` — campos vazios quando
 * `ok: false`. O node é FAIL-SOFT: nenhuma falha sobe como erro de execução,
 * porque quando ele roda as mensagens de texto já foram entregues ao cliente.
 *
 * Modelo 55 (NF-e) é recusado com `ok: false` e motivo explícito: o DANFE dele
 * tem leiaute próprio (A4, quadros, código de barras) e fica para depois.
 */
export interface NfePdfActionConfig {
  /** XML completo da nota (`nfeProc`). Template: '{{triggerData.body.documentoFiscal.xml}}'. */
  xml: string;
  /** Nome do arquivo entregue no WhatsApp. Template. Default 'Nota fiscal {nNF}.pdf'. */
  filename?: string;
  /** Nome da variável do fluxo onde o resultado é guardado (NUNCA #91). Obrigatório. */
  saveAs: string;
}

/**
 * Assign Action Configuration
 */
export interface AssignActionConfig {
  resourceType: 'ticket' | 'conversation' | 'lead';
  resourceId?: string;
  /**
   * Assignment mode written by the UI (AssignConfig.tsx).
   * - 'auto': automatic distribution (context strategy)
   * - 'user': direct assignment to `userId`
   * - 'team': rotation within `teamId`
   */
  assigneeType?: 'auto' | 'user' | 'team';
  userId?: string;
  teamId?: string;
  /** Legacy strategy vocabulary — still accepted via API/AI-modifier */
  strategy?: 'round_robin' | 'least_busy' | 'random' | 'specific_user';
}

/**
 * Set Variable Action Configuration
 */
export interface SetVariableActionConfig {
  /** Nome canônico gravado pela UI (SetVariableConfig.tsx) e pelo AI-modifier. */
  variableName?: string;
  /** Nome legado — aceito pelo step factory como fallback. */
  variable?: string;
  value: string | number | boolean | null;
  expression?: string;
}

/**
 * Create Conversation Action Configuration
 *
 * Creates a new conversation or returns an existing active/waiting conversation
 * for the specified contact. This action is essential for workflows that start
 * from non-conversation triggers (e.g., date field triggers on calendar events)
 * and need to establish a conversation context for AI Agents or messaging actions.
 *
 * The conversation is automatically added to the workflow context after creation,
 * making it available for subsequent nodes that require a conversation.
 */
export interface CreateConversationActionConfig {
  /**
   * Source type for the contact ID.
   * - 'context': Extract from workflow context (contact, event, lead)
   * - 'specific': Use a specific contact ID configured in the node
   * @default 'context'
   */
  contactSourceType?: 'context' | 'specific';

  /**
   * Contact ID to create conversation for.
   * Required when contactSourceType is 'specific'.
   */
  contactId?: string;

  /**
   * Optional channel ID to use for the conversation.
   * If not provided, the system will use the default channel for the contact.
   * Can be a context reference like {{event.channelId}}.
   */
  channelId?: string;

  /**
   * De onde vem o canal (2026-09-30):
   * - 'fixed' (padrão): o `channelId` configurado no nó;
   * - 'lead_origin': o canal de origem do lead do fluxo (`lead.channelId`) —
   *   no lead capturado por QR, o canal de confirmação do funil. Lead sem
   *   canal faz o nó falhar com o motivo.
   */
  channelSource?: 'fixed' | 'lead_origin';
}

/**
 * Transfer Conversation Action Configuration (2026-09-23)
 *
 * Transfere a conversa para um usuário ou uma equipe pelo MESMO motor do botão
 * "Transferir" do chat (`ConversationsService.transferConversation`): o usuário
 * precisa atender o canal da conversa; a equipe roda o rodízio entre os membros
 * que atendem o canal. Deu certo → pausa o agente de IA da conversa (se ativo)
 * e segue pela saída Sucesso; não deu → saída Falha (ver
 * `WORKFLOW_SUCCESS_FAILURE_NODE_TYPES`).
 *
 * Todo id aceita `{{variável}}` do fluxo.
 */
export interface TransferConversationActionConfig {
  /**
   * De onde vem a conversa.
   * - 'context': a conversa do gatilho — ou, sem ela, a criada pelo nó logo antes
   * - 'variable': `conversationId` traz um id ou uma `{{variável}}`
   * @default 'context'
   */
  conversationSource?: 'context' | 'variable';
  /** Conversa quando `conversationSource === 'variable'` (aceita {{variável}}). */
  conversationId?: string;
  /** Destino da transferência. */
  transferTo: 'user' | 'team';
  /**
   * Como o destino foi escolhido na tela: da lista ('specific') ou por uma
   * `{{variável}}` ('variable'). O motor trata os dois igual — muda só o
   * controle que a tela mostra (mesmo padrão do `assignTo` do Criar lead).
   * @default 'specific'
   */
  targetSource?: 'specific' | 'variable';
  /** Usuário de destino quando `transferTo === 'user'` (aceita {{variável}}). */
  userId?: string;
  /** Equipe de destino quando `transferTo === 'team'` (aceita {{variável}}). */
  teamId?: string;
  /** Motivo gravado no histórico da conversa (aceita {{variável}}). */
  reason?: string;
}

/**
 * Motivos de encerramento que o nó CSAT oferece: só os que NÃO bloqueiam a
 * pesquisa (spam, duplicada, expirada e sem resposta nunca recebem CSAT —
 * `SATISFACTION_SKIP_CLOSE_REASONS` no backend).
 */
export const SATISFACTION_SURVEY_CLOSE_REASONS = ['resolved', 'transferred', 'other'] as const;
export type SatisfactionSurveyCloseReason = (typeof SATISFACTION_SURVEY_CLOSE_REASONS)[number];

/**
 * "CSAT — Satisfação do Cliente" (2026-09-23)
 *
 * Encerramento ESTIMULADO com pesquisa ESTIMULADA: o nó encerra a conversa pelo
 * mesmo funil do chat e envia a pesquisa de satisfação do canal mesmo com ela
 * desligada lá (e mesmo com agente de IA atendendo). Texto, opções e prazo de
 * resposta são os do canal — sem configuração no canal, os de
 * `DEFAULT_CHANNEL_SATISFACTION_CONFIG`. A captura da nota é a mesma do
 * encerramento pelo canal (`satisfaction`/`satisfactionPending` na conversa).
 *
 * Conversa que já estava encerrada: o nó não envia (saída Falha).
 */
export interface SatisfactionSurveyActionConfig {
  /**
   * De onde vem a conversa — mesmo contrato do Transferir conversa.
   * - 'context': a conversa do gatilho — ou, sem ela, a criada pelo nó logo antes
   * - 'variable': `conversationId` traz um id ou uma `{{variável}}`
   * @default 'context'
   */
  conversationSource?: 'context' | 'variable';
  /** Conversa quando `conversationSource === 'variable'` (aceita {{variável}}). */
  conversationId?: string;
  /** Motivo do encerramento. @default 'resolved' */
  closeReason?: SatisfactionSurveyCloseReason;
}

/**
 * "Pergunta" (2026-09-28)
 *
 * Um nó só pergunta, espera a resposta e confere se ela serve. O laço de
 * tentativas vive DENTRO do nó, porque o desenho não aceita ciclo (`CICLO`):
 * resposta que não serve recebe a mensagem de "não entendi" e a pergunta
 * continua valendo, até acabarem as tentativas. É o molde dos motores de chat
 * de mercado (Twilio "Send & Wait For Reply", ManyChat "Data Collection",
 * Botpress "Capture Information", Typebot, Blip).
 *
 * Saídas — fonte ÚNICA em `askQuestionOutputHandles`:
 * - tipo `options`: uma por opção (`option-<id>`); `number` e `text`: `answered`;
 * - `invalid`: as tentativas acabaram sem resposta que sirva (não existe no tipo `text`,
 *   que aceita qualquer resposta);
 * - `no_reply`: o prazo venceu sem resposta que sirva.
 * Saída sem ligação encerra o caminho ali, sem erro.
 */
export const ASK_QUESTION_ANSWER_TYPES = ['options', 'number', 'text'] as const;
export type AskQuestionAnswerType = (typeof ASK_QUESTION_ANSWER_TYPES)[number];

export interface AskQuestionOption {
  /**
   * Id ESTÁVEL da opção. A marca da saída é `option-<id>`, nunca o índice:
   * apagar a opção do meio não pode mandar as ligações das outras para o
   * caminho errado (é o que acontece no Selecionar, que marca por `case-N`).
   */
  id: string;
  /** Rótulo da saída — também vale como resposta. */
  label: string;
  /** Outras respostas aceitas para esta opção (ex.: "sim", "s", "👍"). */
  keywords?: string[];
}

export interface AskQuestionActionConfig {
  /**
   * De onde vem a conversa — mesmo contrato do Transferir conversa.
   * - 'context': a conversa do gatilho — ou, sem ela, a criada pelo nó logo antes
   * - 'variable': `conversationId` traz um id ou uma `{{variável}}`
   * @default 'context'
   */
  conversationSource?: 'context' | 'variable';
  /** Conversa quando `conversationSource === 'variable'` (aceita {{variável}}). */
  conversationId?: string;
  /** Texto da pergunta (aceita {{variável}}). */
  message: string;
  answerType: AskQuestionAnswerType;
  /** Opções do tipo `options` (2 a `ASK_QUESTION_MAX_OPTIONS`). */
  options?: AskQuestionOption[];
  /** Menor número aceito no tipo `number` (inteiro). */
  numberMin?: number;
  /** Maior número aceito no tipo `number` (inteiro). */
  numberMax?: number;
  /**
   * Mensagem de "não entendi" (aceita {{variável}}). Vazia = texto padrão
   * que lista as respostas aceitas (`defaultAskQuestionRetryMessage`).
   */
  retryMessage?: string;
  /**
   * Quantas vezes a mensagem de "não entendi" pode sair antes da saída
   * `invalid`. 0 a `ASK_QUESTION_MAX_RETRIES_CAP`.
   * @default ASK_QUESTION_DEFAULT_MAX_RETRIES
   */
  maxRetries?: number;
  /**
   * Prazo para responder, contado do envio da pergunta. Teto de 72 h
   * (`WAIT_UNTIL_MAX_DURATION_MS`), o mesmo do Aguardar.
   * @default ASK_QUESTION_DEFAULT_TIMEOUT
   */
  timeout?: { duration: number; unit: AskQuestionTimeoutUnit };
  /** Variável que guarda o resultado — `{{variables.<saveAs>.answer}}`. */
  saveAs?: string;
}

export type AskQuestionTimeoutUnit = Exclude<WaitDurationUnit, 'seconds'>;

export const ASK_QUESTION_ANSWERED_HANDLE = 'answered';
export const ASK_QUESTION_INVALID_HANDLE = 'invalid';
export const ASK_QUESTION_NO_REPLY_HANDLE = 'no_reply';
export const ASK_QUESTION_OPTION_HANDLE_PREFIX = 'option-';

export const ASK_QUESTION_MAX_OPTIONS = 10;
export const ASK_QUESTION_MAX_RETRIES_CAP = 5;
export const ASK_QUESTION_DEFAULT_MAX_RETRIES = 2;
export const ASK_QUESTION_DEFAULT_TIMEOUT: Readonly<{ duration: number; unit: AskQuestionTimeoutUnit }> = {
  duration: 24,
  unit: 'hours',
};

export function askQuestionOptionHandle(optionId: string): string {
  return `${ASK_QUESTION_OPTION_HANDLE_PREFIX}${optionId}`;
}

/**
 * Saídas do nó "Pergunta", na ordem da tela. Fonte ÚNICA para tela (alças),
 * validador (ligação em saída que não existe) e compilador (um ramo por saída).
 */
export function askQuestionOutputHandles(config: Partial<AskQuestionActionConfig> | undefined): string[] {
  const answerType = config?.answerType ?? 'options';
  const handles: string[] = [];
  if (answerType === 'options') {
    for (const option of config?.options ?? []) {
      if (typeof option?.id === 'string' && option.id.trim() !== '') {
        handles.push(askQuestionOptionHandle(option.id));
      }
    }
  } else {
    handles.push(ASK_QUESTION_ANSWERED_HANDLE);
  }
  if (answerType !== 'text') handles.push(ASK_QUESTION_INVALID_HANDLE);
  handles.push(ASK_QUESTION_NO_REPLY_HANDLE);
  return handles;
}

/**
 * Texto padrão da mensagem de "não entendi" quando o nó não traz um: diz ao
 * cliente o que serve como resposta, que é o que tira alguém do laço.
 */
export function defaultAskQuestionRetryMessage(config: Partial<AskQuestionActionConfig> | undefined): string {
  if (config?.answerType === 'number') {
    const min = config.numberMin ?? 1;
    const max = config.numberMax ?? 5;
    return `Não entendi sua resposta. Responda só com um número de ${min} a ${max}, por favor.`;
  }
  const labels = (config?.options ?? [])
    .map((option) => option.label.trim())
    .filter((label) => label !== '');
  const ultima = labels[labels.length - 1];
  if (ultima === undefined) return 'Não entendi sua resposta. Pode responder de novo, por favor?';
  const lista = labels.length === 1 ? ultima : `${labels.slice(0, -1).join(', ')} ou ${ultima}`;
  return `Não entendi sua resposta. Responda com: ${lista}.`;
}

/**
 * "Número sequencial" (2026-09-28)
 *
 * Entrega o próximo número de uma sequência com nome (ex.: o número da sorte de
 * um sorteio): 0001, 0002… sem repetir, mesmo com vários clientes ao mesmo
 * tempo. Quem recebeu cada número fica registrado — é a lista que o sorteio
 * confere. A mesma execução pedindo de novo no mesmo nó recebe o MESMO número.
 * A sequência é da empresa: dois fluxos com o mesmo nome dividem a numeração.
 */
export interface NextNumberActionConfig {
  /**
   * O que o nó numera (2026-09-29):
   * - 'sequence': sequência com nome, só do fluxo (como sempre foi);
   * - 'lead_coupon': cupom de sorteio do LEAD — o contador da empresa, o mesmo
   *   da página de captura; o número vai para os cupons do lead.
   * @default 'sequence'
   */
  target?: 'sequence' | 'lead_coupon';
  /** De onde vem o lead no modo 'lead_coupon'. @default 'context' */
  leadSource?: 'context' | 'variable';
  /** Lead quando `leadSource === 'variable'` (id ou {{variável}}). */
  leadId?: string;
  /** Nome da sequência (modo 'sequence'). A chave ignora acento, maiúscula e espaço repetido. */
  sequenceName: string;
  /** Texto antes do número (ex.: "SORTE-"). */
  prefix?: string;
  /**
   * Dígitos com zero à esquerda (0 = sem preencher).
   * @default NEXT_NUMBER_DEFAULT_PAD_LENGTH
   */
  padLength?: number;
  /** Primeiro número, quando a sequência ainda não existe. @default 1 */
  startAt?: number;
  /** Variável que guarda o resultado — `{{variables.<saveAs>.formatted}}`. */
  saveAs?: string;
}

export const NEXT_NUMBER_DEFAULT_PAD_LENGTH = 4;
export const NEXT_NUMBER_MAX_PAD_LENGTH = 12;

/** Saída do nó "Número sequencial" — também vai para `variables[saveAs]`. */
export interface NextNumberResult {
  /** Nome da sequência, como no nó ("Cupons do lead" no modo 'lead_coupon'). */
  sequence: string;
  number: number;
  /** Prefixo + número com zeros à esquerda (ex.: "0042"). */
  formatted: string;
  /** Lead que recebeu o cupom (modo 'lead_coupon'). */
  leadId?: string;
}

/** Nome da "sequência" no modo 'lead_coupon' — é o que aparece em `sequence`. */
export const NEXT_NUMBER_LEAD_COUPON_SEQUENCE = 'Cupons do lead';

export function formatSequenceNumber(
  number: number,
  padLength: number = NEXT_NUMBER_DEFAULT_PAD_LENGTH,
  prefix = '',
): string {
  return `${prefix}${String(number).padStart(Math.max(0, padLength), '0')}`;
}

/**
 * "Salvar formulário" (2026-09-28)
 *
 * Junta valores do fluxo — em geral as respostas dos nós "Pergunta" — e grava
 * como UMA resposta de formulário ligada ao lead: o mesmo lugar do formulário
 * de captura (coleção `checklists`, `linkedEntity: lead`), que aparece na aba
 * Formulários do lead. Nunca copia respostas para o documento do lead
 * (NUNCA #80). Opção escrita pelo cliente vira a OPÇÃO do formulário (pelo
 * rótulo ou pelo valor) e nota vira número.
 *
 * Saídas Sucesso/Falha (`WORKFLOW_SUCCESS_FAILURE_NODE_TYPES`). Falha =
 * formulário apagado/desativado, lead não encontrado, campo obrigatório sem
 * valor ou valor fora das opções — conferido ANTES de gravar, então a falha
 * não deixa resposta pela metade no lead.
 */
export interface SaveFormResponseActionConfig {
  /** Formulário (tipo `form`). */
  formId: string;
  /**
   * Ligar a resposta a um lead (aparece na aba Formulários dele). Desligado, a
   * resposta fica só no formulário. @default true
   */
  linkToLead?: boolean;
  /**
   * De onde vem o lead (quando `linkToLead`).
   * - 'context': o lead do gatilho (ou o do contato do fluxo)
   * - 'variable': `leadId` traz uma `{{variável}}` (ou um id)
   * - 'specific': `leadId` é o lead escolhido na lista
   * @default 'context'
   */
  leadSource?: 'context' | 'variable' | 'specific';
  /** Lead quando `leadSource` é 'variable' ({{variável}}) ou 'specific' (id). */
  leadId?: string;
  /** Pergunta do formulário (id do campo) → valor: `{{variável}}` ou texto fixo. */
  answers?: Record<string, string>;
  /** Variável que guarda o resultado — `{{variables.<saveAs>.responseId}}`. */
  saveAs?: string;
}

/** Saída do nó "Salvar formulário" — também vai para `variables[saveAs]`. */
export interface SaveFormResponseResult {
  success: boolean;
  formId: string;
  responseId?: string;
  leadId?: string;
  /** Quantas perguntas do formulário receberam valor. */
  answered: number;
  error?: string;
}

/**
 * "Perguntar formulário" (2026-09-28)
 *
 * Faz TODAS as perguntas de um formulário pelo WhatsApp, uma por uma, com a
 * mesma espera e conferência do nó "Pergunta" (prazo e "não entendi" por
 * pergunta). O formulário é a fonte das perguntas: mudar o formulário muda a
 * conversa, sem mexer no fluxo.
 *
 * Saídas: `answered` ("Respondeu" — todas as obrigatórias responderam) e
 * `no_reply` ("Não respondeu" — o prazo de alguma pergunta venceu, ou uma
 * obrigatória esgotou as tentativas). Pergunta OPCIONAL que esgota as
 * tentativas é pulada.
 *
 * Para gravar as respostas no lead, ligue um "Salvar formulário" depois — os
 * dois se completam (`{{variables.<saveAs>.answers.<id do campo>}}`).
 */
export interface AskFormActionConfig {
  /** De onde vem a conversa — mesmo contrato do nó "Pergunta". @default 'context' */
  conversationSource?: 'context' | 'variable';
  conversationId?: string;
  /** Formulário (tipo `form`) cujas perguntas serão feitas. */
  formId: string;
  /**
   * Texto de cada pergunta no WhatsApp: id do campo → texto (aceita
   * {{variável}}). Sem texto, vale `defaultAskFormQuestionText` (nome da
   * pergunta, descrição e as opções numeradas).
   */
  messages?: Record<string, string>;
  /**
   * Perguntas do formulário que o nó NÃO faz (ids dos campos) — as que outro
   * nó preenche, como o número da sorte do "Número sequencial".
   */
  skipFieldIds?: string[];
  /** "Não entendi" por pergunta, 0 a `ASK_QUESTION_MAX_RETRIES_CAP`. @default ASK_QUESTION_DEFAULT_MAX_RETRIES */
  maxRetries?: number;
  /** Prazo de CADA pergunta. @default ASK_QUESTION_DEFAULT_TIMEOUT */
  timeout?: { duration: number; unit: AskQuestionTimeoutUnit };
  /** Variável com o resultado — `{{variables.<saveAs>.answers.<id do campo>.answer}}`. */
  saveAs?: string;
}

/** Tipos de campo que o WhatsApp consegue perguntar e conferir. */
export const ASK_FORM_ASKABLE_FIELD_TYPES: readonly FormFieldType[] = [
  FormFieldType.SHORT_TEXT,
  FormFieldType.LONG_TEXT,
  FormFieldType.EMAIL,
  FormFieldType.PHONE,
  FormFieldType.URL,
  FormFieldType.CPF,
  FormFieldType.CNPJ,
  FormFieldType.DATE,
  FormFieldType.TIME,
  FormFieldType.NUMBER,
  FormFieldType.RATING,
  FormFieldType.LINEAR_SCALE,
  FormFieldType.SELECT,
  FormFieldType.RADIO,
  FormFieldType.CHECKBOX,
  FormFieldType.MULTI_SELECT,
];

/** O campo é perguntado pelo nó? (título, parágrafo, foto e arquivo não são.) */
export function isAskFormFieldAskable(field: Pick<FormField, 'type'>): boolean {
  return (ASK_FORM_ASKABLE_FIELD_TYPES as readonly string[]).includes(field.type);
}

/** Faixa numérica que o campo aceita (nota: 1 a 5; escala: 0 a 10; número: livre). */
export function askFormNumberRange(field: Pick<FormField, 'type' | 'validation'>): { min: number; max: number } {
  const min = field.validation?.min;
  const max = field.validation?.max;
  if (field.type === FormFieldType.RATING) return { min: min ?? 1, max: max ?? 5 };
  if (field.type === FormFieldType.LINEAR_SCALE) return { min: min ?? 0, max: max ?? 10 };
  return { min: min ?? 0, max: max ?? Number.MAX_SAFE_INTEGER };
}

/**
 * Texto padrão da pergunta no WhatsApp: nome em negrito, descrição, e — em
 * campo de escolha — as opções numeradas (o número também vale como
 * resposta). Fonte ÚNICA para a tela (prévia) e o motor.
 */
/**
 * As opções do campo valem pelo NÚMERO da posição na lista? Não quando alguma
 * opção já É um número ("1", "2", "3") — aí "2" seria ambíguo, e a lista sai
 * com marcadores em vez de números.
 */
export function askFormOptionsByPosition(field: Pick<FormField, 'options'>): boolean {
  const numero = /^\s*\d+\s*$/;
  return !(field.options ?? []).some((o) => numero.test(o.label) || numero.test(o.value));
}

export function defaultAskFormQuestionText(
  field: Pick<FormField, 'type' | 'label' | 'description' | 'options' | 'validation'>,
): string {
  const partes = [`*${field.label.trim()}*`];
  const descricao = field.description?.trim();
  if (descricao) partes.push(descricao);

  const multipla = field.type === FormFieldType.CHECKBOX || field.type === FormFieldType.MULTI_SELECT;
  if (field.type === FormFieldType.SELECT || field.type === FormFieldType.RADIO || multipla) {
    const numerar = askFormOptionsByPosition(field);
    const opcoes = (field.options ?? []).map((o, i) => (numerar ? `${i + 1}. ${o.label}` : `• ${o.label}`));
    if (opcoes.length > 0) partes.push(opcoes.join('\n'));
    if (multipla) partes.push('(pode escolher mais de uma, separadas por vírgula)');
  } else if (!descricao && (field.type === FormFieldType.NUMBER || field.type === FormFieldType.RATING || field.type === FormFieldType.LINEAR_SCALE)) {
    const { min, max } = askFormNumberRange(field);
    if (max < Number.MAX_SAFE_INTEGER) partes.push(`(responda com um número de ${min} a ${max})`);
  }
  return partes.join('\n\n');
}

/**
 * Perguntas que um "Salvar formulário" DEPOIS do "Perguntar formulário"
 * preenche com OUTRO valor (número sequencial, texto fixo, outra Pergunta) —
 * o nó não as faz: a resposta do cliente seria jogada fora (2026-09-28,
 * número da sorte perguntado ao cliente no teste). Fonte ÚNICA para o motor e
 * a tela. Devolve id do campo → nome do "Salvar formulário" que o preenche.
 *
 * Vale só com `saveAs`: sem ele o "Salvar formulário" nem tem como usar as
 * respostas do questionário, e tudo pareceria "preenchido por outro valor".
 * `saves` = os "Salvar formulário" que vêm DEPOIS deste nó no desenho.
 */
export function askFormFieldsFilledElsewhere(
  ask: { formId?: string; saveAs?: string },
  saves: Array<{ label: string; config: { formId?: string; answers?: Record<string, string> } }>,
): Record<string, string> {
  const saveAs = ask.saveAs?.trim();
  if (!saveAs || !ask.formId) return {};
  const proprio = `variables.${saveAs}.`;
  const preenchidas: Record<string, string> = {};
  for (const save of saves) {
    if (save.config.formId !== ask.formId) continue;
    for (const [fieldId, valor] of Object.entries(save.config.answers ?? {})) {
      if (typeof valor !== 'string' || valor.trim() === '' || valor.includes(proprio)) continue;
      if (!(fieldId in preenchidas)) preenchidas[fieldId] = save.label;
    }
  }
  return preenchidas;
}

/** Saídas do nó "Perguntar formulário" — "Respondeu" e "Não respondeu". */
export function askFormOutputHandles(): string[] {
  return [ASK_QUESTION_ANSWERED_HANDLE, ASK_QUESTION_NO_REPLY_HANDLE];
}

/**
 * Nós que perguntam ao cliente e DORMEM esperando a resposta ("Pergunta" e
 * "Perguntar formulário"). Valem para os dois as mesmas regras de desenho:
 * ramificam por saída, não entram em caminhos paralelos nem em repetição, e
 * não convivem com a regra de cancelamento "Mensagem recebida".
 */
export const WORKFLOW_QUESTION_NODE_TYPES: readonly WorkflowNodeType[] = ['action_ask_question', 'action_ask_form'];

export function isWorkflowQuestionNodeType(type: string): boolean {
  return (WORKFLOW_QUESTION_NODE_TYPES as readonly string[]).includes(type);
}

/**
 * Saídas de um nó de pergunta — fonte ÚNICA para tela, validador e
 * compilador. `null` quando o tipo não é de pergunta.
 */
export function questionNodeOutputHandles(type: string, config: unknown): string[] | null {
  if (type === 'action_ask_question') return askQuestionOutputHandles(config as Partial<AskQuestionActionConfig> | undefined);
  if (type === 'action_ask_form') return askFormOutputHandles();
  return null;
}

/** Uma pergunta do formulário depois do nó. */
export interface AskFormAnswer {
  /** Nome da pergunta no formulário. */
  label: string;
  /** Rótulo da opção (lista em múltipla escolha), número ou texto. `null` sem resposta. */
  answer: string | number | string[] | null;
  /** O que o cliente mandou, na ordem. */
  text: string;
  /** `skipped` = opcional que esgotou as tentativas. */
  status: AskQuestionStatus | 'skipped';
}

/** Saída do nó "Perguntar formulário" — também vai para `variables[saveAs]`. */
export interface AskFormResult {
  path: string;
  status: 'answered' | 'no_reply';
  formId: string;
  /** id do campo → resposta. Só as perguntas feitas. */
  answers: Record<string, AskFormAnswer>;
  /** Perguntas respondidas. */
  answered: number;
  /** Onde parou, quando `no_reply`. */
  stoppedAt?: { fieldId: string; label: string; reason: 'invalid' | 'no_reply' };
  conversationId?: string;
}

/** Como a pergunta terminou. */
export type AskQuestionStatus = 'answered' | 'invalid' | 'no_reply';

/**
 * Saída do nó "Pergunta" — é também o que vai para `variables[saveAs]`.
 */
export interface AskQuestionResult {
  /** Marca da saída seguida (`option-<id>`, `answered`, `invalid` ou `no_reply`). */
  path: string;
  status: AskQuestionStatus;
  /** Rótulo da opção, número ou texto aceito. `null` sem resposta que sirva. */
  answer: string | number | null;
  /** Id da opção escolhida (tipo `options`). */
  optionId?: string;
  /** O que o cliente mandou, na ordem (mensagens juntas por quebra de linha). */
  text: string;
  /** Respostas que não serviram. */
  attempts: number;
  /** ISO 8601 — quando a resposta que serviu chegou. */
  answeredAt?: string;
  conversationId?: string;
}

/**
 * IF Control Configuration
 */
export interface IfControlConfig {
  condition: string;
  operator?: WorkflowConditionOperator;
  value?: string | number | boolean | null;
}

/**
 * Switch Control Configuration
 */
export interface SwitchControlConfig {
  field: string;
  cases: Array<{
    value: string | number | boolean | null;
    label?: string;
  }>;
  /** default: true — a UI e o motor tratam undefined como habilitado (defaultCase !== false) */
  defaultCase?: boolean;
}

/**
 * Loop Control Configuration
 */
export interface LoopControlConfig {
  items?: string; // Variable name containing array
  maxIterations?: number;
  condition?: string;
}

/**
 * Unidade de tempo das esperas por duração.
 *
 * `seconds` existe por causa do disparo em lote: o coletor do ERP entrega N vendas
 * a cada 5 minutos e todos os workflows executam juntos. Espalhar em passos de 1
 * minuto ainda agrupa — a menor unidade útil é o segundo.
 */
export type WaitDurationUnit = 'seconds' | 'minutes' | 'hours' | 'days';

/**
 * Até quando o node "Aguardar" espera. União discriminada por `mode` —
 * exatamente um dos quatro formatos.
 *
 * - `duration`: espera um tempo corrido. Teto de 72h (rejeitado no save,
 *   saturado em runtime).
 * - `random_duration`: espera um tempo sorteado entre `min` e `max`. Mesmo teto de 72h,
 *   aplicado ao `max`. Sorteia uma vez, na primeira execução.
 * - `time`: espera até o próximo HH:mm, no fuso resolvido. `weekdays` (0=Dom..6=Sáb)
 *   restringe os dias aceitos; ausente = qualquer dia.
 * - `business_hours`: espera até a próxima abertura da janela. Se já estiver
 *   DENTRO da janela, o node não suspende — segue na hora.
 */
export type WaitUntilConfig =
  | { mode: 'duration'; duration: number; unit: WaitDurationUnit }
  | {
      /**
       * Espera um tempo SORTEADO entre `min` e `max`, inclusive.
       *
       * Existe para quebrar rajada: workflows disparados no mesmo instante saem
       * espalhados no tempo, em vez de baterem juntos no provedor (o que já causou
       * bloqueio de canal de WhatsApp em 30/08/2026).
       *
       * O sorteio acontece UMA vez, na primeira execução do nó, e o horário de volta
       * é gravado no snapshot. A retomada obedece ao gravado — se sorteasse de novo,
       * a espera poderia nunca terminar.
       */
      mode: 'random_duration';
      min: number;
      max: number;
      unit: WaitDurationUnit;
    }
  | { mode: 'time'; time: string; weekdays?: number[]; timezone?: string }
  | { mode: 'business_hours'; businessHours: WorkflowBusinessHoursConfig };

/**
 * Quem originou um evento observado pelo node "Aguardar".
 *
 * - `user`       — atendente humano
 * - `ai`         — agente de IA
 * - `automation` — workflow / automação do sistema
 * - `api`        — integração externa via API pública
 *
 * `api` já existe no vocabulário porque o catálogo foi desenhado para crescer
 * (ex.: "Lead criado → por API"), mas HOJE nenhum evento do
 * `WAIT_CANCEL_EVENT_ACTORS` o oferece: mensagem é o único evento com a origem
 * gravada no dado (`ConversationMessage.senderType`), e lá não existe API.
 * Ligar um evento novo exige antes gravar o autor na entidade — lead e contato
 * não guardam quem os criou.
 */
export const WORKFLOW_EVENT_ACTORS = ['user', 'ai', 'automation', 'api'] as const;

export type WorkflowEventActor = typeof WORKFLOW_EVENT_ACTORS[number];

/**
 * Um evento que cancela a espera do node "Aguardar" (formato LEGADO de
 * `config.cancelEvent`, aposentado pela aba Cancelamento em 2026-09-14 — D2).
 * Mantido enquanto a migração `2026-09-14-001` não rodou em todos os ambientes
 * e para a leitura do payload de execuções paradas no deploy.
 * @deprecated use `WorkflowCancellationRule`.
 */
export interface WaitCancelEvent {
  type: string;
  actors?: WorkflowEventActor[];
}

/** Entidade a que um evento de cancelamento aponta. */
export type WorkflowCancellationEntityKind = 'conversation' | 'contact' | 'lead' | 'ticket' | 'event';

export interface WorkflowCancellationEventSpec {
  entity: WorkflowCancellationEntityKind;
  /** Campo do payload do evento que carrega o id da entidade. */
  idField: string;
  /** Origens que o evento distingue. Vazio = não distingue (a UI não mostra o sub-select e o motor ignora `actors`). */
  actors: readonly WorkflowEventActor[];
}

/**
 * FONTE ÚNICA dos eventos da aba Cancelamento (spec 2026-09-14 §1.2): UI,
 * validação e motor leem daqui. Só entram eventos que apontam para alguém.
 * `calendar_event.cancelled` entra porque o publisher carrega `eventId` e
 * `contactId` antes de apagar (o vigia casa pelo id, não precisa da entidade).
 */
export const WORKFLOW_CANCELLATION_EVENTS = {
  'message.received':        { entity: 'conversation', idField: 'conversationId', actors: [] },
  'message.sent':            { entity: 'conversation', idField: 'conversationId', actors: ['user', 'ai', 'automation'] },
  'conversation.created':    { entity: 'conversation', idField: 'conversationId', actors: [] },
  'conversation.updated':    { entity: 'conversation', idField: 'conversationId', actors: [] },
  'conversation.closed':     { entity: 'conversation', idField: 'conversationId', actors: [] },
  'conversation.assigned':   { entity: 'conversation', idField: 'conversationId', actors: [] },
  'contact.created':         { entity: 'contact', idField: 'contactId', actors: [] },
  'contact.updated':         { entity: 'contact', idField: 'contactId', actors: [] },
  'lead.created':            { entity: 'lead', idField: 'leadId', actors: [] },
  'lead.updated':            { entity: 'lead', idField: 'leadId', actors: [] },
  'lead.stage_changed':      { entity: 'lead', idField: 'leadId', actors: [] },
  'lead.won':                { entity: 'lead', idField: 'leadId', actors: [] },
  'lead.lost':               { entity: 'lead', idField: 'leadId', actors: [] },
  'ticket.created':          { entity: 'ticket', idField: 'ticketId', actors: [] },
  'ticket.updated':          { entity: 'ticket', idField: 'ticketId', actors: [] },
  'ticket.status_changed':   { entity: 'ticket', idField: 'ticketId', actors: [] },
  'ticket.assigned':         { entity: 'ticket', idField: 'ticketId', actors: [] },
  'ticket.resolved':         { entity: 'ticket', idField: 'ticketId', actors: [] },
  'ticket.closed':           { entity: 'ticket', idField: 'ticketId', actors: [] },
  'calendar_event.created':  { entity: 'event', idField: 'eventId', actors: [] },
  'calendar_event.updated':  { entity: 'event', idField: 'eventId', actors: [] },
  'calendar_event.cancelled': { entity: 'event', idField: 'eventId', actors: [] },
} as const satisfies Record<string, WorkflowCancellationEventSpec>;

export type WorkflowCancellationEventType = keyof typeof WORKFLOW_CANCELLATION_EVENTS;

export const WORKFLOW_CANCELLATION_EVENT_TYPES = Object.keys(WORKFLOW_CANCELLATION_EVENTS) as readonly WorkflowCancellationEventType[];

/** Uma regra da aba Cancelamento (spec §1.1). */
export interface WorkflowCancellationRule {
  eventType: WorkflowCancellationEventType;
  /** "Quem fez". Só tem efeito nos eventos que o catálogo declara com origens. Vazio/ausente = qualquer origem. */
  actors?: WorkflowEventActor[];
  /** "A quem se refere": template resolvido no contexto do nó (ex.: '{{contact.id}}'). Ausente = entidade padrão do evento. */
  refersTo?: string;
}

export interface WorkflowNodeCancellation {
  rules: WorkflowCancellationRule[];
}

/**
 * Marca (`sourceHandle`) da saída vermelha "Cancelado" do nó Aguardar
 * (spec 2026-09-20 §7.1, Fase 4b).
 *
 * NÃO pode ser `'event'`: essa era a marca da saída "Cancelado" ANTIGA, e a
 * migração `2026-09-14-001` apaga toda ligação que sai dela — junto com a
 * árvore de nós atrás dela. Também não pode ser `'timeout'`, que é a saída
 * que segue depois da espera.
 */
export const WORKFLOW_WAIT_CANCELLED_HANDLE = 'cancelled';

/**
 * O Aguardar tem a saída "Cancelado"? Fonte ÚNICA para tela, validação e
 * compilador (spec 2026-09-20 §7.1): a saída existe quando o nó tem regra
 * PRÓPRIA na aba Cancelamento — regra de outro nó (ou do gatilho) não desenha
 * saída aqui, mesmo que também desvie a execução por esta (D13).
 */
export function waitHasCancelledOutput(node: Pick<WorkflowNode, 'type' | 'data'>): boolean {
  if (node.type !== 'control_wait_for') return false;
  return (node.data.cancellation?.rules ?? []).length > 0;
}

/**
 * @deprecated recorte do catálogo novo com os 4 eventos que o Aguardar antigo
 * aceitava. Some junto com `WaitCancelEvent`.
 */
export const WAIT_CANCEL_EVENT_ACTORS: Readonly<Record<string, readonly WorkflowEventActor[]>> = {
  'message.received': WORKFLOW_CANCELLATION_EVENTS['message.received'].actors,
  'message.sent': WORKFLOW_CANCELLATION_EVENTS['message.sent'].actors,
  'lead.updated': WORKFLOW_CANCELLATION_EVENTS['lead.updated'].actors,
  'contact.updated': WORKFLOW_CANCELLATION_EVENTS['contact.updated'].actors,
};

/**
 * Wait For Control Configuration (control_wait_for)
 * Espera até `until` OU até o evento de cancelamento — duas saídas: 'timeout' | 'event'.
 */
export interface WaitForControlConfig {
  /**
   * Até quando esperar. Ausente = fallback `{ mode: 'duration', duration: 24, unit: 'hours' }`.
   */
  until?: WaitUntilConfig;
  /** Cancelamento opcional — vale para os TRÊS modos de `until`. */
  /** @deprecated D2 — migrado para `data.cancellation` pela migração 2026-09-14-001. */
  cancelEvent?: {
    /**
     * Lista canônica de eventos que cancelam (é um OU: basta um acontecer).
     * Ausente/vazia sem `eventType` legado = sem cancelamento.
     */
    events?: WaitCancelEvent[];
    /**
     * @deprecated Formato antigo (um evento só), gravado pela UI até 2026-08-30.
     * Continua sendo LIDO como `[{ type: eventType }]` — workflow já salvo não
     * muda de comportamento. A UI nova grava `events`.
     */
    eventType?: string;
    entityType?: string;    // informativo — o significado do matchValue é fixo por eventType
    matchField?: string;    // informativo (não usado pelo motor)
    matchValue?: string;    // template, ex: '{{conversation.id}}'
  };
}

/**
 * Lê a lista de eventos de cancelamento de um `cancelEvent`, aceitando o
 * formato novo (`events`) e o legado (`eventType`). Ponto ÚNICO da compat —
 * motor, validação e UI passam por aqui em vez de cada um reimplementar o
 * fallback e divergir.
 */
export function readWaitCancelEvents(
  cancelEvent: WaitForControlConfig['cancelEvent'],
): WaitCancelEvent[] {
  if (!cancelEvent) return [];

  if (Array.isArray(cancelEvent.events)) {
    return cancelEvent.events.filter(
      (event): event is WaitCancelEvent =>
        typeof event?.type === 'string' && event.type.trim().length > 0,
    );
  }

  const legado = cancelEvent.eventType;
  return typeof legado === 'string' && legado.trim().length > 0 ? [{ type: legado }] : [];
}

/** Teto de espera do modo `duration` (72h). Aplicado no save e em runtime. */
export const WAIT_UNTIL_MAX_DURATION_MS = 72 * 60 * 60 * 1000;

/**
 * Split Control Configuration (control_split — teste A/B)
 * sourceHandle das edges: 'path-0'..'path-N' (índice do path).
 */
export interface SplitControlConfig {
  paths: Array<{ label: string; weight: number }>;
}

/**
 * AI Agent Node Configuration
 *
 * Executes an existing AI Agent with its own configured tools.
 * The agent uses its own capabilities, customActionIds, and databases.
 */
export interface AIAgentNodeConfig {
  /** ID of the AI Agent to execute */
  agentId: string;
  /** Context type - defaults to 'conversation' for workflow usage */
  contextType?: 'conversation' | 'contact' | 'lead';
  /** Optional context entity ID (usually derived from workflow context) */
  contextId?: string;
  /** Optional custom prompt to override agent's default */
  customPrompt?: string;
  /** Whether to wait for agent response before continuing workflow */
  waitForResponse?: boolean;
  /** When true, if the conversation has no messages, fetches history from the last conversation of the same contact+channel */
  includeHistory?: boolean;
  /** Janela de horário comercial — fora dela o run suspende até o próximo horário válido (o agente roda no horário, não de madrugada). */
  businessHours?: WorkflowBusinessHoursConfig;
}

/**
 * AI Agent Inline Node Configuration
 *
 * A standalone Mastra Agent built inline inside the workflow. Unlike AIAgentNodeConfig
 * (which references an existing AIAgent entity), this node defines its own system
 * prompt, model, memory and receives tools dynamically from connected action nodes
 * via the 'tools' targetHandle.
 *
 * Use this when you want a custom AI agent tailored to this workflow, without
 * creating a full AI Agent entity in the database.
 */
export interface AIAgentInlineConfig {
  /** Display name of the agent (used in logs and traces) */
  nodeName?: string;
  /** System prompt that defines the agent behavior */
  systemPrompt: string;
  /** LLM model id (e.g. 'gpt-4o-mini', 'claude-haiku-4-5') — provider resolved automatically */
  model: string;
  /** Sampling temperature (0-2, default: 0.7) */
  temperature?: number;
  /** Maximum tokens for the response */
  maxTokens?: number;
  /** Maximum iterations of the tool-calling loop (default: 5) */
  maxIterations?: number;
  /**
   * Memory mode: 'thread' persists history per conversation, 'ephemeral' is stateless.
   * @default 'ephemeral'
   */
  memoryMode?: 'thread' | 'ephemeral';
  /** Input template (supports {{variable}} substitution from workflow context) */
  input: string;
  /**
   * IDs of workflow nodes connected as tools (via 'tools' targetHandle).
   * Auto-populated by the WorkflowExecutor when processing edges with targetHandle='tools'.
   */
  toolNodeIds?: string[];
  /** Preferred context type (defaults to 'conversation') */
  contextType?: 'conversation' | 'contact' | 'lead';
  /**
   * Janela de horário comercial — fora dela o run suspende até o próximo horário
   * válido. Aplica-se ao node inteiro; nodes de ação conectados como TOOLS
   * ignoram o próprio businessHours (suspend indisponível no loop de tool-calling).
   */
  businessHours?: WorkflowBusinessHoursConfig;
}

/**
 * Create Database Document Action Configuration
 * Creates a new document in the databases-documents collection.
 * Used for blog article generation, knowledge base entries, etc.
 */
export interface CreateDatabaseDocumentActionConfig {
  /** ID do banco de dados onde salvar o documento */
  databaseId: string;
  /** Tipo do documento (default: 'documents') */
  documentType?: string;
  /** Título — suporta {{variável}} */
  title: string;
  /** Conteúdo — suporta {{variável}} */
  content: string;
  /** Resumo — suporta {{variável}} */
  summary?: string;
  /** Categoria do documento (default: 'article') */
  category?: string;
  /** Autor — suporta {{variável}} */
  author?: string;
  /** Keywords — separadas por vírgula ou {{variável}} */
  keywords?: string;
  /** Status inicial (default: 'draft') */
  itemStatus?: 'published' | 'draft';
}

/**
 * Skill Input Node Configuration
 *
 * Entry point of a workflow being used as a skill.
 * Replaces the trigger for skill-type workflows and carries the skill metadata.
 */
export interface SkillInputConfig {
  /** Descrição que o LLM lê pra decidir quando chamar */
  description: string;
  /** Modo de execução do skill */
  executionMode: 'sync' | 'async';
  /** JSON Schema dos parâmetros de entrada */
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array';
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  /** JSON Schema do retorno (opcional) */
  outputSchema?: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      description?: string;
    }>;
  };
}

/**
 * Skill Output Node Configuration
 *
 * Marks the exit point of a workflow being used as a skill.
 * Maps workflow variables to the skill's output payload.
 */
export interface SkillOutputConfig {
  /** Mapeamento de variáveis do contexto para o output do skill.
   *  Ex: { "precoTotal": "{{variables.total}}" } */
  outputMapping: Record<string, string>;
}

/**
 * Node Configuration - Union of all config types
 */
export type NodeConfig =
  | WebhookTriggerConfig
  | ScheduleTriggerConfig
  | EventTriggerConfig
  | AnyDateFieldTriggerConfig
  | InactivityTriggerConfig
  | InstagramCommentTriggerConfig
  | InstagramMentionTriggerConfig
  | SendMessageActionConfig
  | SendEmailActionConfig
  | HttpRequestActionConfig
  | QueryDatabaseActionConfig
  | CreateLeadActionConfig
  | UpdateLeadActionConfig
  | FindUnitActionConfig
  | FindUserActionConfig
  | FindContactActionConfig
  | UrlToPdfActionConfig
  | NfePdfActionConfig
  | SendTemplateActionConfig
  | CreateTicketActionConfig
  | UpdateContactActionConfig
  | AssignActionConfig
  | TransferConversationActionConfig
  | SatisfactionSurveyActionConfig
  | AskQuestionActionConfig
  | AskFormActionConfig
  | NextNumberActionConfig
  | SaveFormResponseActionConfig
  | SetVariableActionConfig
  | IfControlConfig
  | SwitchControlConfig
  | LoopControlConfig
  | WaitForControlConfig
  | SplitControlConfig
  | AIAgentNodeConfig
  | AIAgentInlineConfig
  | CreateDatabaseDocumentActionConfig
  | RetryScopeControlConfig
  | MirrorMediaActionConfig
  | VoiceCloneActionConfig
  | VoiceTtsActionConfig
  | VoiceCloneDeleteActionConfig
  | SkillInputConfig
  | SkillOutputConfig
  // LegacyNodeConfig fallback — nós sem interface canônica ainda dependem disto
  // (action_send_media, action_add_tag, action_remove_tag, action_internal_notification,
  // action_find_leads, trigger_instagram_comment, trigger_instagram_mention e
  // configs legadas gravadas no DB). Nota: action_send_media e
  // action_internal_notification também aceitam `businessHours?:
  // WorkflowBusinessHoursConfig` (interfaces locais nos step factories do backend).
  | Record<string, unknown>;

// ============================================================
// WORKFLOW VARIABLE TYPES
// ============================================================

/**
 * Workflow Variable Value - Type-safe recursive value type for workflow variables
 */
export type WorkflowVariableValue =
  | string
  | number
  | boolean
  | null
  | WorkflowVariableValue[]
  | { [key: string]: WorkflowVariableValue };

/**
 * Workflow Variables Record
 */
export type WorkflowVariables = Record<string, WorkflowVariableValue>;

// ============================================================
// WORKFLOW DEFINITION
// ============================================================

/**
 * Workflow Node Position
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Workflow Node Data
 */
export interface WorkflowNodeData {
  label: string;
  description?: string;
  config: NodeConfig;
  /**
   * Aba Filtros dos nós NÃO-gatilho (Fase 3 liga o motor; a Fase 2 só garante que o
   * campo sobrevive ao salvar). Gatilhos continuam gravando os seus em `config.filters`.
   */
  filters?: FilterCondition[];
  /** Aba Cancelamento (todo nó, gatilho incluído). Vale do nó em diante (spec 2026-09-14, D1). */
  cancellation?: WorkflowNodeCancellation;
}

/**
 * Workflow Node
 */
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: NodePosition;
  data: WorkflowNodeData;
}

/**
 * Workflow Edge
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | undefined;
  targetHandle?: string | undefined;
  label?: string | undefined;
  condition?: string | undefined;
}

/**
 * Workflow Definition
 */
/**
 * Viewport configuration for React Flow
 */
export interface WorkflowViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: WorkflowVariables | undefined;
  version?: number | undefined;
  viewport?: WorkflowViewport | undefined;
}

// ============================================================
// WORKFLOW FOLDER
// ============================================================

/**
 * Workflow Folder Entity (Database Document)
 */
/**
 * Classificação de uso de um workflow/pasta — 'automation' (default) ou
 * 'skill' (invocável por agentes IA). Workflows e pastas de cada tipo vivem
 * em árvores separadas nas telas de Workflows e de Skills.
 */
export type WorkflowUsageType = 'automation' | 'skill';

export interface WorkflowFolder {
  _id?: ObjectId;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: ObjectId;
  /**
   * Classificação de uso da pasta — separa a árvore de pastas de Workflows
   * (automation) da de Skills. Ausente em docs legados = 'automation'.
   */
  usageType?: WorkflowUsageType;
  order?: number;
  appId: ObjectId;
  companyId: ObjectId;
  createdBy?: string;
  /**
   * De que coleção é o id em `createdBy`. Ver `CreatorStamp` em `common.ts`.
   * Ausente = registro anterior a 2026-08-30 (a informação não existia).
   */
  createdByType?: ActorType;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Workflow Folder Response (API Response)
 */
export interface WorkflowFolderResponse extends Omit<WorkflowFolder, '_id' | 'parentId' | 'appId' | 'companyId' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  id: string;
  parentId?: string;
  appId: string;
  companyId: string;
  workflowCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * Create Workflow Folder Request
 */
export interface CreateWorkflowFolderRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  /** Árvore a que a pasta pertence (Workflows × Skills). Default: 'automation' */
  usageType?: WorkflowUsageType;
  order?: number;
}

/**
 * Update Workflow Folder Request
 */
export interface UpdateWorkflowFolderRequest {
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
  order?: number;
}

/**
 * Workflow Folder Query Parameters
 */
export interface WorkflowFolderQuery {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  /** Filtra pela árvore (Workflows × Skills). Ausente = todas. */
  usageType?: WorkflowUsageType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Workflow Folder List Response (Paginated)
 */
export interface WorkflowFolderListResponse {
  items: WorkflowFolderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// WORKFLOW ENTITY
// ============================================================

/**
 * Workflow Entity (Database Document)
 */
export interface Workflow {
  _id?: ObjectId;
  name: string;
  description?: string;
  status: WorkflowStatus;
  /** Presente só quando a última pausa foi automática. Limpo ao reativar. */
  autoPause?: WorkflowAutoPauseInfo;
  /** Último aviso de falha frequente (2026-09-15) — trava de 1 aviso por
   * `WORKFLOW_FREQUENT_FAILURES_ALERT_INTERVAL_HOURS`. Interno: não vai na API. */
  frequentFailuresAlertedAt?: Date;
  /**
   * Resumo de execuções (2026-09-21), preenchido a partir do histórico e mantido
   * incrementalmente a cada execução final. Alimenta as réguas de pausa automática
   * e de aviso de falha frequente quando o histórico expira por validade.
   * Interno: não vai na API, não é aceito de cliente.
   */
  executionSummary?: WorkflowExecutionSummary;
  definition: WorkflowDefinition;
  folderId?: ObjectId;
  /** Classificação de uso. Default: 'automation' */
  usageType?: 'automation' | 'skill';
  /** Environment where this workflow was created (development, production, etc.) */
  environment?: string;
  appId: ObjectId;
  companyId: ObjectId;
  createdBy?: string;
  /**
   * De que coleção é o id em `createdBy`. Ver `CreatorStamp` em `common.ts`.
   * Ausente = registro anterior a 2026-08-30 (a informação não existia).
   */
  createdByType?: ActorType;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Janela, em dias, dos contadores de execução da listagem de workflows. */
export const WORKFLOW_EXECUTION_STATS_WINDOW_DAYS = 30;

/** Baldes em que a listagem classifica uma execução (a régua da pausa automática). */
export const WORKFLOW_EXECUTION_STATS_BUCKETS = ['completed', 'failed', 'customerFailed', 'cancelled', 'running', 'interrupted'] as const;
export type WorkflowExecutionStatsBucket = (typeof WORKFLOW_EXECUTION_STATS_BUCKETS)[number];

/**
 * Contadores de execução de UM workflow na listagem (`GET /workflows?withStats=true`).
 * Campo CALCULADO: existe só em `WorkflowResponse`, nunca no documento.
 * `total` fecha com a soma: completed + failed + customerFailed + cancelled + running + interrupted.
 */
export interface WorkflowExecutionStats {
  windowDays: number;
  total: number;
  completed: number;
  failed: number;
  customerFailed: number;
  cancelled: number;
  running: number;
  interrupted: number;
  lastExecutionAt?: string;
  lastExecutionStatus?: WorkflowExecutionStatus;
  /**
   * Balde da ÚLTIMA execução, pela mesma régua que alimenta os contadores.
   * É por ele que a tela rotula a última execução: sem isso o card diria
   * "Falhou" ao lado de "0 falhas" (uma falha do cliente conta em
   * `customerFailed`, não em `failed`).
   * Ausente = backend anterior a esta versão; a tela cai no `lastExecutionStatus`.
   */
  lastExecutionBucket?: WorkflowExecutionStatsBucket;
}

/**
 * Workflow Response (API Response)
 */
export interface WorkflowResponse extends Omit<Workflow, '_id' | 'folderId' | 'appId' | 'companyId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'autoPause' | 'executionSummary'> {
  id: string;
  folderId?: string;
  appId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  autoPause?: WorkflowAutoPauseResponse;
  /**
   * Contadores da janela. Só chega em `GET /workflows?withStats=true`;
   * ausente = a listagem não pediu (e a tela não desenha nada novo).
   */
  executionStats?: WorkflowExecutionStats;
}

// ============================================================
// WORKFLOW EXECUTION
// ============================================================

/**
 * Single run entry for a node (supports multiple iterations/retries).
 * Inspired by n8n runData format: one entry per execution attempt.
 */
export interface NodeRunEntry {
  runIndex: number;                    // 0, 1, 2... (iterações/retries)
  status: NodeRunEntryStatus;
  startedAt: string;                   // ISO string (NÃO Date)
  completedAt?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
  suspendedPayload?: unknown;          // payload retornado pelo suspend() do Mastra
}

/**
 * Snapshot metadata for suspended/resumed executions (Mastra suspend/resume).
 */
export interface WorkflowSnapshotMeta {
  runId: string;
  workflowId: string;
  status: 'running' | 'suspended' | 'completed' | 'failed' | 'cancelled';
  suspendedAt?: string;
  resumeAt?: string;
}

/**
 * Por que uma execução foi cancelada (spec 2026-09-14 §4.2).
 * `kind: 'user'` = botão manual; `kind: 'event'` = regra da aba Cancelamento (Fase 2).
 */
export interface WorkflowCancelReason {
  kind: 'user' | 'event';
  /** Instante do cancelamento, ISO 8601. */
  at: string;
  /** Quem clicou (kind 'user'). */
  userId?: string;
  /** Evento que casou (kind 'event'), ex.: 'message.received'. */
  eventType?: string;
  /** Entidade do evento: 'conversation' | 'lead' | 'contact' | 'ticket' | 'event'. */
  entityKind?: string;
  entityId?: string;
  /** Nó cuja regra casou, e seu rótulo na hora do cancelamento. */
  nodeId?: string;
  nodeLabel?: string;
  ruleIndex?: number;
}

/**
 * Uma vez em que a execução, em vez de ser cancelada, seguiu pela saída
 * "Cancelado" de um Aguardar (spec 2026-09-20 §7.1, Fase 4b).
 *
 * É LISTA em `WorkflowExecution.cancelDiversions`: o caminho vermelho pode
 * conter outro Aguardar com saída vermelha, e o segundo desvio não apaga o
 * primeiro.
 *
 * `at` é texto ISO 8601, como `WorkflowCancelReason.at` — o campo é lido pela
 * tela e conferido por igualdade (o `$push` não duplica entrada com o mesmo
 * `at`); nada aqui é comparado por faixa de data no Mongo.
 */
export interface WorkflowCancelDiversion {
  /** Instante do desvio, ISO 8601. */
  at: string;
  /** Aguardar que desviou, e seu rótulo na hora do desvio. */
  waitNodeId: string;
  waitNodeLabel: string;
  /** Evento que teria cancelado a execução, ex.: 'message.received'. */
  eventType: string;
  /** Entidade do evento: 'conversation' | 'lead' | 'contact' | 'ticket' | 'event'. */
  entityKind: string;
  entityId: string;
  /** Nó cuja regra casou (pode ser o gatilho), e seu rótulo na hora do desvio. */
  ruleNodeId: string;
  ruleNodeLabel: string;
  /** Texto em português que a tela mostra, montado na hora do desvio. */
  description: string;
}

/**
 * Workflow Execution Entity (Database Document)
 */
export interface WorkflowExecution {
  _id?: ObjectId;
  workflowId: ObjectId;
  workflowName?: string;
  status: WorkflowExecutionStatus;
  triggerType: WorkflowNodeType;
  triggerData?: Record<string, unknown>;
  context: Record<string, unknown>;
  variables: WorkflowVariables;
  /** Map<nodeId, run entries[]> — formato runData estilo n8n */
  runData: Record<string, NodeRunEntry[]>;
  /** Ordem de primeira execução dos nós, para rendering da UI timeline */
  nodeOrder: string[];
  currentNodeId?: string;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  /** Nó em que a execução falhou, quando identificável. */
  failedNodeId?: string;
  /** Rótulo do nó em que a execução falhou, no momento da falha. */
  failedNodeLabel?: string;
  duration?: number;
  /** Indicates if this execution was triggered via test mode (for tracking/audit purposes only) */
  isTest?: boolean;
  /**
   * Falha parcial (2026-08-27): pelo menos um galho de um leque paralelo
   * falhou E pelo menos um galho irmão entregou. O `status` continua
   * `'failed'` — o histórico não mente —, mas execuções assim ficam FORA do
   * contador de pausa automática (`getLastNExecutionStatuses`): telefone
   * errado de um contato não pode desligar o fluxo de vendas.
   */
  partialFailure?: boolean;
  /**
   * Falha causada pelo ESTADO DO CLIENTE, não por defeito nosso (2026-09-01):
   * janela de 24h fechada, número sem WhatsApp, contato em experimento da Meta,
   * limite de marketing por usuário. O `status` continua `'failed'` — o
   * histórico não mente —, mas execuções assim ficam FORA do contador de pausa
   * automática (`getLastNExecutionStatuses`): cliente que não respondeu não
   * pode desligar o fluxo. Mesmo molde de `partialFailure`.
   */
  customerStateFailure?: boolean;
  /**
   * Execução que ninguém terminou (2026-09-18): o processo do servidor parou no
   * meio — deploy, queda, OOM — e o run morreu junto, deixando o histórico em
   * `running` para sempre. Quem fecha é o varredor de zumbis
   * (`ScheduledResumeWorker.sweepZombieExecutions`), que grava `status:
   * 'failed'` — o histórico não mente — com esta flag.
   *
   * A flag existe porque não foi o workflow que falhou: fica FORA dos DOIS
   * contadores (`getLastNExecutionStatuses`, da pausa automática, e
   * `getRecentExecutionOutcomes`, do aviso de falha frequente). Sem ela, um
   * deploy que pegue execuções no meio inventa falha — o aviso dispara com 5
   * nas últimas 20, e um workflow de baixa frequência acumularia zumbis de
   * vários deploys dentro da própria janela. Mesmo molde de
   * `customerStateFailure`.
   */
  interrupted?: boolean;
  /** Motivo do cancelamento. Só existe quando `status === 'cancelled'` (spec 2026-09-14). */
  cancelledBy?: WorkflowCancelReason;
  /**
   * Os desvios pela saída "Cancelado" de um Aguardar (spec 2026-09-20 §7.1).
   * Execução desviada NÃO é cancelada: ela segue pelo caminho vermelho e
   * termina `completed`/`failed` conforme o que roda ali.
   */
  cancelDiversions?: WorkflowCancelDiversion[];
  /** Chave única vinda do gatilho de webhook com "uma execução por identifier"
   * ligado (2026-09-15). Índice único por workflow. */
  identifier?: string;
  /**
   * Nó-gatilho que disparou a execução (23/09/2026 — o workflow pode ter
   * vários gatilhos, e cada um roda o fluxo a partir dele). A retomada de um
   * fluxo que dormiu recompila a partir do MESMO gatilho. Ausente em execução
   * anterior a essa data: vale o primeiro gatilho do desenho.
   */
  triggerNodeId?: string;
  appId: ObjectId;
  companyId: ObjectId;
  /**
   * UUID do run Mastra associado a esta execução.
   * Persiste o vínculo mastraRunId → executionId mesmo após restart do processo
   * (o Map em memória do ExecutionRecorder é transitório).
   * Usado por findExecutionIdByRunId para resume de runs suspensos.
   */
  mastraRunId?: string;
  /**
   * Instante em que a execução chegou a um status FINAL; o prazo de validade
   * conta daqui. Ausente = nunca expira.
   */
  retentionStartsAt?: Date;
}

/** Por quantos dias uma execução em status FINAL fica guardada antes de expirar. */
export const WORKFLOW_EXECUTION_RETENTION_DAYS = 30;

/** Quantas execuções elegíveis o resumo do workflow guarda no anel (`executionSummary.recentOutcomes`). */
export const WORKFLOW_EXECUTION_SUMMARY_RING_SIZE = 20;

/**
 * Uma execução elegível para as réguas de pausa automática / aviso de falha
 * frequente, como registrada no anel de `executionSummary.recentOutcomes`.
 */
export interface WorkflowExecutionOutcome {
  executionId: string;
  startedAt: Date;
  status: 'completed' | 'failed';
  partialFailure?: boolean;
  error?: string;
}

/**
 * Resumo de execuções de UM workflow (2026-09-21), mantido no próprio
 * documento do workflow para que as réguas de pausa automática e de aviso de
 * falha frequente continuem funcionando depois que o histórico de execuções
 * expira por validade. Ver `Workflow.executionSummary`.
 */
export interface WorkflowExecutionSummary {
  lastExecution?: {
    executionId: string;
    startedAt: Date;
    status: WorkflowExecutionStatus;
  };
  recentOutcomes?: WorkflowExecutionOutcome[];
  /** Instante em que o resumo foi preenchido a partir do histórico completo. */
  backfilledAt?: Date;
}

/**
 * Workflow Execution Response (API Response)
 */
export interface WorkflowExecutionResponse extends Omit<WorkflowExecution, '_id' | 'workflowId' | 'appId' | 'companyId' | 'startedAt' | 'completedAt'> {
  id: string;
  workflowId: string;
  appId: string;
  companyId: string;
  startedAt: string;
  completedAt?: string;
}

// ============================================================
// WORKFLOW NODE RUN INPUTS — o "Visualizar contexto" do nó (F2)
// ============================================================

/** Teto, em bytes, do que se guarda de entrada de UM nó numa execução. */
export const WORKFLOW_NODE_INPUT_MAX_BYTES = 32_768;

/** Por quantos dias a entrada de um nó fica guardada. */
export const WORKFLOW_NODE_INPUT_RETENTION_DAYS = 30;

/** Uma execução em que o nó rodou e teve a entrada guardada. */
export interface NodeRunListItem {
  executionId: string;
  /** Status da EXECUÇÃO (não do nó) — `WorkflowExecutionStatus`, nunca `NodeRunEntryStatus`. */
  status: WorkflowExecutionStatus;
  startedAt: string;
  durationMs?: number;
  /** Quantas vezes o nó recebeu entrada nesta execução (Repetição > 1). */
  passes: number;
  isTest: boolean;
}

export interface NodeRunListResponse {
  items: NodeRunListItem[];
  /** O workflow tem alguma execução (com ou sem contexto guardado)? Decide o texto do estado vazio. */
  workflowHasExecutions: boolean;
}

/** O que chegou ao nó numa passagem. */
export interface NodeRunInput {
  createdAt: string;
  /**
   * A foto do que chegou. `unknown` de propósito: quando o que chegou não vira
   * JSON, o valor guardado é um TEXTO de marcação, não um objeto.
   */
  input: unknown;
  truncated: boolean;
  originalBytes: number;
}

export interface NodeRunInputsResponse {
  items: NodeRunInput[];
}

// ============================================================
// WORKFLOW TRIGGER COUNTS
// ============================================================

/**
 * Workflow Trigger Count (for inactivity triggers)
 */
export interface WorkflowTriggerCount {
  _id?: ObjectId;
  workflowId: ObjectId;
  entityType: 'conversation' | 'contact' | 'lead' | 'ticket';
  entityId: string;
  triggerCount: number;
  lastTriggeredAt: Date;
  resetAt?: Date;
  appId: ObjectId;
  companyId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow Trigger Count Response
 */
export interface WorkflowTriggerCountResponse extends Omit<WorkflowTriggerCount, '_id' | 'workflowId' | 'appId' | 'companyId' | 'lastTriggeredAt' | 'resetAt' | 'createdAt' | 'updatedAt'> {
  id: string;
  workflowId: string;
  appId: string;
  companyId: string;
  lastTriggeredAt: string;
  resetAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// WORKFLOW EVENTS
// ============================================================

/**
 * Workflow Event Types
 *
 * Members under "Planned / no publisher yet" are offered by the trigger UI but
 * have no publish call site in the backend today — workflows subscribed to them
 * never fire. Kept in the union to avoid breaking existing consumers/configs;
 * adding a publisher promotes the member to its category group above.
 */
export type WorkflowEventType =
  // Messages
  | 'message.received'
  | 'message.sent'
  // Conversations
  | 'conversation.created'
  | 'conversation.updated'
  | 'conversation.closed'
  | 'conversation.assigned'
  // Contacts
  | 'contact.created'
  | 'contact.updated'
  | 'contact.tag_added'
  | 'contact.tag_removed'
  // Leads
  | 'lead.created'
  | 'lead.updated'
  | 'lead.stage_changed'
  | 'lead.won'
  | 'lead.lost'
  /**
   * Captura por QR confirmada (2026-10-01): a pessoa preencheu a página de
   * captura e mandou a mensagem de confirmação no WhatsApp. Publicado uma vez,
   * na primeira confirmação do lead que a captura criou; o payload leva a
   * conversa da confirmação (`conversationId`). Funil sem confirmação no
   * WhatsApp não publica.
   */
  | 'lead.confirmed'
  // Tickets
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.status_changed'
  | 'ticket.assigned'
  | 'ticket.resolved'
  | 'ticket.closed'
  // Calendar Events
  | 'calendar_event.created'
  | 'calendar_event.updated'
  | 'calendar_event.cancelled'
  // Databases
  | 'database.document.created'
  | 'database.document.updated'
  // Forms
  | 'form.submitted'
  // Custom
  | 'custom.event'
  // --- Planned / no publisher yet ---
  | 'message.delivered'
  | 'message.read'
  | 'conversation.reopened'
  | 'conversation.inactive'
  | 'contact.deleted'
  | 'contact.birthday'
  | 'contact.inactive'
  | 'lead.inactive'
  | 'webhook.received'
  | 'instagram.comment.received'
  | 'instagram.mention.received'
  | 'facebook.comment.received';

/**
 * Workflow Event
 */
export interface WorkflowEvent {
  type: WorkflowEventType;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  appId: string;
  companyId: string;
  workflowId?: string;
  executionId?: string;
  timestamp: Date;
}

// ============================================================
// API REQUESTS
// ============================================================

/**
 * Create Workflow Request
 */
export interface CreateWorkflowRequest {
  name: string;
  description?: string | undefined;
  status?: WorkflowStatus | undefined;
  definition: WorkflowDefinition;
  folderId?: string | undefined;
  /** Classificação de uso. Default: 'automation' */
  usageType?: WorkflowUsageType | undefined;
  /** Environment where this workflow is being created (auto-set by backend if not provided) */
  environment?: string | undefined;
}

/**
 * Update Workflow Request
 */
export interface UpdateWorkflowRequest {
  name?: string | undefined;
  description?: string | undefined;
  status?: WorkflowStatus | undefined;
  definition?: WorkflowDefinition | undefined;
  folderId?: string | null | undefined;
  /** Classificação de uso (Workflows × Skills) — o backend já aceita no PATCH. */
  usageType?: WorkflowUsageType | undefined;
}

/**
 * Workflow Query Parameters
 */
export interface WorkflowQuery {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: WorkflowStatus | undefined;
  folderId?: string | null | undefined;
  /** Filtra pela classificação de uso (tela de Workflows × tela de Skills). Ausente = todos. */
  usageType?: WorkflowUsageType | undefined;
  /** Filter workflows by environment */
  environment?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  /** `?withStats=true` liga os contadores de execução de cada item da listagem. */
  withStats?: boolean | undefined;
}

/**
 * Workflow Execution Query Parameters
 */
export interface WorkflowExecutionQuery {
  page?: number | undefined;
  limit?: number | undefined;
  workflowId?: string | undefined;
  status?: WorkflowExecutionStatus | undefined;
  triggerType?: WorkflowNodeType | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

/**
 * Trigger Workflow Request
 */
export interface TriggerWorkflowRequest {
  workflowId: string;
  triggerData?: Record<string, unknown>;
  variables?: Record<string, unknown>;
}

// ============================================================
// WORKFLOW EXECUTION CONTEXT
// ============================================================

/**
 * Execution Context - Available to all nodes during execution
 */
export interface WorkflowExecutionContext {
  workflowId: string;
  executionId: string;
  appId: string;
  companyId: string;
  triggerType: WorkflowNodeType;
  triggerData: Record<string, unknown>;
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
  // Entity references
  conversation?: {
    id: string;
    contactId?: string;
    channelId?: string;
    agentId?: string;
    status?: string;
  };
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    tags?: string[];
  };
  lead?: {
    id: string;
    contactId?: string;
    funnelId?: string;
    step?: string;
    value?: number;
  };
  ticket?: {
    id: string;
    subject?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
  };
  event?: {
    id: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    contactId?: string;
    channelId?: string;
    attendees?: Array<{ contactId?: string; email?: string; name?: string }>;
  };
}

// ============================================================
// NODE HANDLER INTERFACES
// ============================================================

/**
 * Node Handler Result
 */
export interface NodeHandlerResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  nextNodes?: string[];
  skipRemaining?: boolean;
}

/**
 * Node Handler Interface
 *
 * The optional third `workflow` parameter allows handlers that need access to
 * the full workflow definition (e.g. AIAgentInlineHandler builds tools from
 * connected action nodes). Most handlers ignore it.
 */
export interface INodeHandler {
  nodeType: WorkflowNodeType;
  execute(
    node: WorkflowNode,
    context: WorkflowExecutionContext,
    workflow?: WorkflowResponse
  ): Promise<NodeHandlerResult>;
  validate?(node: WorkflowNode): boolean | string;
}

// ============================================================
// WORKFLOW BUILDER TYPES (Frontend)
// ============================================================

/**
 * Node Category
 */
export type NodeCategory = 'triggers' | 'actions' | 'controls' | 'ai';

/**
 * Node Palette Item
 */
export interface NodePaletteItem {
  type: WorkflowNodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: Partial<NodeConfig>;
}

/**
 * Workflow Builder State
 */
export interface WorkflowBuilderState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDirty: boolean;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Workflow Validation Result
 */
export interface WorkflowValidationResult {
  isValid: boolean;
  errors: Array<{
    nodeId?: string;
    edgeId?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

/**
 * Validação estrutural de workflow (2026-08-27).
 *
 * O backend é a única fonte de verdade das regras estruturais; o editor as
 * consome por `POST /api/workflows/validate`. `nodeIds` é o que permite ao
 * editor pintar de vermelho os nós culpados — o 422 do PATCH não carrega
 * essa informação (o errorHandler só serializa `fieldErrors`).
 */
export const WORKFLOW_VALIDATION_CODES = [
  'NODE_TYPE_DESCONHECIDO',
  'ARESTA_ORFA',
  'SEM_ENTRADA',
  'MULTIPLAS_ENTRADAS',
  'CICLO',
  'IF_SEM_CAMINHO',
  'IF_HANDLE_INVALIDO',
  'SWITCH_SEM_HANDLE',
  'SPLIT_HANDLE_INVALIDO',
  'LOOP_SAIDAS',
  'WAIT_FOR_SAIDAS',
  'FANOUT_JUNCAO',
  'FANOUT_ESPERA',
  'FANOUT_HORARIO',
  'SWITCH_HANDLE_NAO_COMPILAVEL',
  'CONTROL_FLOW_EM_LOOP',
  // 2026-08-27 (conserto final)
  /** "Tentar novamente" com nenhum/vários trechos a repetir, ou vários "Depois". */
  'RETRY_SAIDAS',
  /** Nó de controle dentro do trecho repetido por "Tentar novamente". */
  'CONTROL_FLOW_EM_RETRY',
  /** Requisição HTTP com "aguardar retorno" dentro de um leque (dorme igual à espera). */
  'FANOUT_HTTP_AGUARDA',
  /** Desenho sem nenhum gatilho (nem `skill_input`). */
  'SEM_GATILHO',
  /**
   * Gatilho que o motor não suporta repetido no mesmo workflow (23/09/2026):
   * dois Agendamentos, ou duas Inatividades da mesma entidade — o relógio é um
   * só por workflow e o segundo nunca dispararia.
   */
  'GATILHO_REPETIDO',
  /** Nó sem nenhuma ligação — nem entrando, nem saindo. */
  'NO_SOLTO',
  /** Campo obrigatório faltando ou fora do formato na configuração de um nó. */
  'CONFIG_INVALIDA',
  'LEGADO',
  /**
   * Regra da aba Cancelamento inválida (spec 2026-09-14, Fase 2): evento fora
   * do catálogo, origem que o evento não distingue/não oferece, "A quem se
   * refere" que não é template nem id, ou regra repetida para o mesmo alvo.
   */
  'CANCELAMENTO_INVALIDO',
  /**
   * Aresta que ainda sai pela saída "Cancelado" (aposentada) do node Aguardar
   * (D2, spec 2026-09-14) — o desenho precisa ser refeito sem essa saída.
   */
  'WAIT_FOR_SAIDA_ANTIGA',
  /**
   * Filtro inválido na aba Filtros de um nó (spec 2026-09-16, Fase 3): condição
   * mal formada, campo/operador incompatível, ou nó que não aceita filtros mas
   * tem `data.filters` preenchido.
   */
  'FILTRO_INVALIDO',
  /**
   * Ligação na saída "Cancelado" de um Aguardar que não tem regra própria na
   * aba Cancelamento (spec 2026-09-20 §7.1, D12) — a saída só existe com regra.
   */
  'WAIT_FOR_CANCELADO_SEM_REGRA',
  /**
   * Ligação presa num ponto de saída que não é "Sucesso" nem "Falha", num nó
   * que tem essas duas saídas (`nodeTypeHasSuccessFailureOutputs`, 2026-09-23).
   */
  'SUCESSO_FALHA_HANDLE_INVALIDO',
  /**
   * Ligação presa numa saída que o nó "Pergunta" não tem (2026-09-28) — em
   * geral a opção foi apagada ou o tipo de resposta mudou
   * (`askQuestionOutputHandles`).
   */
  'PERGUNTA_SAIDA_INVALIDA',
  /**
   * Regra "Mensagem recebida" da aba Cancelamento que continua valendo
   * enquanto um nó "Pergunta" espera a resposta (2026-09-28): a própria
   * resposta do cliente cancelaria o fluxo.
   */
  'PERGUNTA_CANCELADA_PELA_RESPOSTA',
] as const;

export type WorkflowValidationCode = (typeof WORKFLOW_VALIDATION_CODES)[number];

export interface ValidationIssue {
  code: WorkflowValidationCode;
  /** Texto pronto para a tela, em português. */
  message: string;
  /** Nós que o editor deve destacar. Vazio quando o problema não é de um nó. */
  nodeIds: string[];
}

export interface WorkflowValidationResponse {
  isValid: boolean;
  issues: ValidationIssue[];
}

// ============================================================================
// EXPORT / IMPORT (portabilidade)
// ============================================================================

/**
 * `template` = template de MENSAGEM. `checklistTemplate` = modelo de checklist
 * (`Form` com `type: 'checklist'`) — são coleções diferentes, e tratar os dois
 * como `template` fazia o wizard de import oferecer templates de mensagem para
 * remapear o modelo do node "Criar Checklist". `form` = formulário
 * (`Form` com `type: 'form'`) dos nós "Perguntar formulário" e "Salvar
 * formulário" (2026-09-28).
 */
export type WorkflowRefType =
  | 'channel' | 'funnel' | 'funnelStep' | 'pipeline' | 'pipelineStage'
  | 'agent' | 'template' | 'user' | 'team' | 'contact' | 'database'
  | 'checklistTemplate' | 'unit' | 'form';

export interface WorkflowExportRef {
  token: string;              // "$ref:1" — único no arquivo
  type: WorkflowRefType;
  name: string | null;        // nome do recurso no export (pista pro wizard)
  sourceId: string;           // ObjectId original — usado pra auto-resolver (backup)
  required: boolean;
  dependsOn?: string;         // token do pai (funnelStep→funnel, pipelineStage→pipeline)
}

export interface WorkflowExportFolder {
  tempId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  /** Árvore da pasta na origem (Workflows × Skills). Ausente em arquivos antigos = 'automation'. */
  usageType?: WorkflowUsageType;
  parentTempId?: string;
}

export interface WorkflowExportEntry {
  name: string;
  description?: string;
  usageType?: 'automation' | 'skill';
  folderTempId?: string;      // só no bundle
  definition: WorkflowDefinition;
}

export interface WorkflowExportFile {
  formatVersion: 1;
  kind: 'workflow' | 'bundle';
  exportedAt: string;
  folders?: WorkflowExportFolder[];
  workflows: WorkflowExportEntry[];
  references: WorkflowExportRef[];
}

export interface WorkflowImportPreviewRef extends WorkflowExportRef {
  resolved: boolean;          // sourceId existe na company/tipo atual
}

export interface WorkflowImportPreview {
  kind: 'workflow' | 'bundle';
  folderCount: number;
  workflowCount: number;
  references: WorkflowImportPreviewRef[];
  warnings: string[];
}

export interface WorkflowImportRequest {
  file: WorkflowExportFile;
  mappings: Record<string, string>;   // token → novo ObjectId (inclui auto-resolvidos)
  targetFolderId?: string | null;      // onde colocar (kind:'workflow')
}

export interface WorkflowImportResult {
  createdWorkflowIds: string[];
  createdFolderIds: string[];
  warnings: string[];
}
