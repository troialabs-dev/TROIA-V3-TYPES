import { ObjectId } from 'mongodb';
import { ActiveStatus, PaginationQuery } from './common';
import { ToolFilterCondition } from './custom-actions';
import type { McpGrantableModule, McpModuleGrant } from './mcp';

/**
 * Categoria funcional do agente — descreve O QUE ele FAZ.
 *
 * Usada pela tab "Treinar Agente" (Sprint UI-2) para filtrar cenários
 * de teste relevantes: um agente SDR é testado com cenários de
 * qualificação/agendamento, um agente SUPORTE com abertura de tickets, etc.
 *
 * Combina com `AgentSegment` (indústria) pra matriz de especialização.
 */
export enum AgentCategory {
  SDR = 'sdr',
  ATTENDANT = 'attendant',
  SUPPORT = 'support',
  FINANCIAL = 'financial',
  SALES = 'sales',
  SCHEDULING = 'scheduling',
  OTHER = 'other',
}

/**
 * Segmento de mercado do agente — descreve PRA QUAL indústria ele atende.
 *
 * Combina com `AgentCategory` (função) pra matriz de testes: um agente
 * "SDR de imobiliária" recebe cenários diferentes de um "SDR de SaaS".
 */
export enum AgentSegment {
  EDUCATIONAL = 'educational',
  REAL_ESTATE = 'real_estate',
  HEALTHCARE = 'healthcare',
  ECOMMERCE = 'ecommerce',
  SERVICES = 'services',
  SAAS = 'saas',
  ACCOUNTING = 'accounting',
  LAW = 'law',
  FOOD = 'food',
  AUTOMOTIVE = 'automotive',
  SOLAR_ENERGY = 'solar_energy',
  APPAREL = 'apparel',
  GENERIC = 'generic',
}

/**
 * Metadata de configuração pra tabela "amigável" de categorias/segmentos
 * exibida no form do agente. Mantida aqui pra ser single source of truth.
 */
export const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  [AgentCategory.SDR]: 'SDR (Prospecção)',
  [AgentCategory.ATTENDANT]: 'Atendente',
  [AgentCategory.SUPPORT]: 'Suporte Técnico',
  [AgentCategory.FINANCIAL]: 'Financeiro',
  [AgentCategory.SALES]: 'Vendas',
  [AgentCategory.SCHEDULING]: 'Agendamento',
  [AgentCategory.OTHER]: 'Outro',
};

export const AGENT_SEGMENT_LABELS: Record<AgentSegment, string> = {
  [AgentSegment.EDUCATIONAL]: 'Educacional',
  [AgentSegment.REAL_ESTATE]: 'Imobiliária',
  [AgentSegment.HEALTHCARE]: 'Saúde',
  [AgentSegment.ECOMMERCE]: 'E-commerce',
  [AgentSegment.SERVICES]: 'Serviços',
  [AgentSegment.SAAS]: 'SaaS / Software',
  [AgentSegment.ACCOUNTING]: 'Contabilidade',
  [AgentSegment.LAW]: 'Advocacia',
  [AgentSegment.FOOD]: 'Alimentação',
  [AgentSegment.AUTOMOTIVE]: 'Automotivo',
  [AgentSegment.SOLAR_ENERGY]: 'Energia Solar',
  [AgentSegment.APPAREL]: 'Confecção',
  [AgentSegment.GENERIC]: 'Genérico',
};

/**
 * Tipo do agente — diz COM QUEM ele conversa (agentes internos, 24/11/2026).
 *
 * - `customer_service`: atende clientes pelos canais (gatilhos, canais,
 *   transferência). Todos os agentes criados antes de 24/11/2026 são deste tipo.
 * - `internal`: conversa com a equipe da empresa na tela de agentes internos.
 *   Nunca é disparado por mensagem de cliente, gatilho de lead nem nó de workflow.
 *
 * Fixo na criação. Ausente = `customer_service` (use `getAgentKind`).
 * Não confundir com `category` (O QUE o agente faz).
 */
export const AI_AGENT_KINDS = ['customer_service', 'internal'] as const;
export type AIAgentKind = (typeof AI_AGENT_KINDS)[number];
export const DEFAULT_AI_AGENT_KIND: AIAgentKind = 'customer_service';

export const AI_AGENT_KIND_LABELS: Record<AIAgentKind, string> = {
  customer_service: 'Agente de atendimento',
  internal: 'Agente interno',
};

/** Tipo efetivo do agente: campo ausente (agente antigo) = atendimento. */
export function getAgentKind(agent: { kind?: AIAgentKind | null | undefined }): AIAgentKind {
  return agent.kind === 'internal' ? 'internal' : DEFAULT_AI_AGENT_KIND;
}

/** Atalho: o agente conversa com a equipe (não atende clientes pelos canais). */
export function isInternalAgent(agent: { kind?: AIAgentKind | null | undefined }): boolean {
  return getAgentKind(agent) === 'internal';
}

/**
 * Keyword matching modes for message_received trigger
 */
export type KeywordMatchMode =
  | 'any_message'        // Trigger on any message (no keyword filtering)
  | 'contains'           // Message contains any of the keywords
  | 'starts_with'        // Message starts with any of the keywords
  | 'ends_with'          // Message ends with any of the keywords
  | 'exact_match';       // Message exactly matches any of the keywords

/**
 * Keyword matching logic (when multiple keywords are provided)
 */
export type KeywordMatchLogic =
  | 'OR'   // Match if ANY keyword matches (default)
  | 'AND'; // Match if ALL keywords match

/**
 * Configuração de escalação/transferência do agente (ponto 6 do blueprint
 * de qualidade, 2026-07-15). O LLM decide QUANDO escalar; esta config
 * decide PARA ONDE (padrão Intercom Fin).
 */
export interface AIAgentEscalationConfig {
  /** 'team'/'user' = destino resolvido pela config; 'model_choice' = legado (modelo escolhe) */
  defaultTarget: 'team' | 'user' | 'model_choice';
  /** Obrigatório quando defaultTarget = 'team' */
  teamId?: string;
  /** Obrigatório quando defaultTarget = 'user' */
  userId?: string;
  // "Priorizar o responsável pelo lead" saiu daqui em 2026-10-01: virou opção
  // da distribuição do CANAL (`DistributionConfig.preferLeadOwner`).
}

/**
 * Ajuste POR AGENTE do cadastro oficial do negócio (Fase 3 do verificador de
 * fonte, 2026-08-25). O padrão vem da EMPRESA (`companies`: address, phone,
 * email, website); um agente que atende outra unidade sobrescreve CAMPO A
 * CAMPO — campo ausente herda o valor da empresa.
 *
 * O bloco resolvido é injetado no system prompt composto
 * (`<official_business_info>`) e entra como fonte fixa na evidência do
 * verificador de fonte e na trava determinística — o agente responde
 * endereço/telefone com o dado REAL em vez de inventar.
 */
export interface AIAgentOfficialInfoOverride {
  /** Endereço em linha ("Rua X, 123, Centro, Cidade - UF, CEP") */
  addressLine?: string;
  phone?: string;
  email?: string;
  website?: string;
  /** Horário de atendimento em texto livre ("Seg-Sex 9h-18h") */
  businessHoursText?: string;
  /** Outros dados oficiais (chave Pix, CNPJ da unidade, etc.) */
  notes?: string;
}

/**
 * Regra binária da rubrica do MessageGuard (Onda 1 do blueprint, 2026-07-15).
 * Extraída automaticamente do systemPrompt no save (método candidate-based,
 * RLCF): cada regra é atômica e verificável por um judge pequeno.
 */
export interface AIAgentGuardRubricRule {
  /** R1..R15 */
  id: string;
  /** Enunciado binário verificável (pt-BR) */
  rule: string;
  /** hard = verificável objetivamente; principle = julgável por LLM */
  type: 'hard' | 'principle';
  /** high = política (bloqueia no enforcement); low = estilo (fail-open) */
  severity: 'low' | 'high';
}

/**
 * Rubrica compilada do agente — 1 artefato, 3 usos: MessageGuard (runtime),
 * reforço no prompt e evaluator per-tenant. Gerada de forma assíncrona no
 * save do agente; `promptHash` detecta staleness vs o systemPrompt atual.
 */
export interface AIAgentGuardRubric {
  rules: AIAgentGuardRubricRule[];
  /** sha256 do systemPrompt que originou a rubrica */
  promptHash: string;
  generatedAt: string;
  /** Modelo que gerou (debug/auditoria) */
  model?: string;
}

export interface AIAgent {
  _id?: ObjectId;
  id?: string;
  name: string;
  description?: string;
  systemPrompt: string;
  instructions?: string;                    // Custom instructions for agent behavior
  model: string;
  temperature: number;
  maxTokens: number;
  delay: number;                            // Debounce delay in seconds (10-120) before agent responds
  version?: string;                         // Semver version (e.g., "1.0.0")
  /**
   * Com quem o agente conversa: clientes pelos canais ou a equipe na tela de
   * agentes internos. Fixo na criação. Ausente = `customer_service`
   * (`getAgentKind`).
   */
  kind?: AIAgentKind;
  /** Sugestões de início na tela de agentes internos. Só usado por agente interno; máx 6 × 120. */
  conversationStarters?: string[];
  /** Funções da plataforma (E2, 24/11/2026). Ausente = desligado. */
  platformFunctions?: AIAgentPlatformFunctionsConfig;
  /** D9. Só atendimento; no interno é ignorado (sempre "só usuários"). Ausente = false. */
  onlyCompanyUsers?: boolean;
  /** D12. Pedir confirmação antes de alterar dados. Ausente = false. */
  requireConfirmation?: boolean;
  /**
   * Categoria funcional do agente — usada pra filtrar cenários de teste
   * relevantes no fluxo de treinamento. Opcional por retrocompatibilidade:
   * agentes sem categoria caem em `AgentCategory.OTHER` no runtime.
   */
  category?: AgentCategory;
  /**
   * Segmento de mercado do agente — combinado com `category` pra
   * selecionar cenários de teste mais específicos. Opcional por
   * retrocompatibilidade: agentes sem segmento caem em `AgentSegment.GENERIC`.
   */
  segment?: AgentSegment;
  triggers: AIAgentTriggers;
  customActionIds: string[];
  /** IDs dos workflows (usageType='skill') que este agente pode invocar */
  skillWorkflowIds?: string[];
  databases?: string[];                     // Database IDs that the agent can access
  voiceEnabled: boolean;
  voiceConfig?: AIAgentVoiceConfig;
  enabledCapabilities: AIAgentCapabilityConfig[];  // ✅ UNIFIED: Capabilities + Configurations
  webhooks?: AIAgentWebhook[];                     // Webhook configurations for external data injection
  /**
   * Configuração de escalação/transferência (2026-07-15, ponto 6 do blueprint
   * de qualidade). Padrão Intercom Fin: o LLM decide QUANDO escalar; a
   * configuração do dono decide PARA ONDE.
   *
   * - `defaultTarget: 'team'` + `teamId`: toda transferência vai para a
   *   equipe configurada — o runtime expõe apenas `transfer_to_team` com o
   *   destino travado (o modelo não escolhe email/equipe).
   * - `defaultTarget: 'user'` + `userId`: idem para um atendente específico.
   * - `defaultTarget: 'model_choice'` (ou config ausente): comportamento
   *   legado — o modelo escolhe entre as tools/destinos disponíveis.
   */
  escalationConfig?: AIAgentEscalationConfig;
  /** Ajuste por agente do cadastro oficial do negócio (herda da empresa campo a campo) */
  officialInfoOverride?: AIAgentOfficialInfoOverride;
  /** Rubrica do MessageGuard — gerada pelo sistema no save (não settável via API) */
  guardRubric?: AIAgentGuardRubric;
  responseStyle?: string;                   // Agent response style (professional, casual, etc.)
  tone?: string;                            // Agent tone (helpful, formal, friendly, etc.)
  language?: string;                        // Preferred language for responses
  fallbackResponse?: string;                // Default response when confidence is low
  appId: ObjectId | string;
  companyId: ObjectId | string;
  status: ActiveStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string;
  /** Flag set by migration 2026-05-11-002 when systemPrompt is not in 5-section canonical format. UI can use this to suggest restructure. */
  requiresSectionRestructure?: boolean;
}

export interface AIAgentTriggers {
  message_received?: {
    enabled: boolean;
    conditions?: {
      matchMode?: KeywordMatchMode;          // How to match keywords (default: 'any_message')
      keywords?: string[];                   // Keywords to match
      keywordLogic?: KeywordMatchLogic;      // AND/OR logic for multiple keywords (default: 'OR')
      channelIds?: string[];                 // Filter by specific channel IDs - trigger only fires if message channel is in this list
      customerSegments?: string[];           // Filter by customer segments
      timeWindow?: {
        start: string;
        end: string;
      };
    };
  };
  message_sent?: {
    enabled: boolean;
    conditions?: {
      matchMode?: KeywordMatchMode;          // How to match keywords (default: 'any_message')
      keywords?: string[];                   // Keywords to match
      keywordLogic?: KeywordMatchLogic;      // AND/OR logic for multiple keywords (default: 'OR')
      channelIds?: string[];                 // Filter by specific channel IDs
    };
  };
  lead_stage_change?: {
    enabled: boolean;
    stages?: string[];
  };
  lead_created?: {
    enabled: boolean;
    sources?: string[];
    funnelIds?: string[];        // Filtrar por funis específicos (vazio = todos)
    phoneChannelId?: string;     // Canal para leads COM telefone
    emailChannelId?: string;     // Canal para leads COM email (sem telefone)
  };
  webhook_event?: {
    enabled: boolean;
    eventTypes?: string[];
  };
}

export type AIAgentCapability =
  | 'text_generation'
  | 'sentiment_analysis'
  | 'intent_recognition'
  | 'entity_extraction'
  | 'language_translation'
  | 'conversation_summarization'
  | 'voice_interaction'
  // Tool-based capabilities
  | 'calendar_management'
  | 'lead_management'
  | 'conversation_transfer'   // Transfer conversation to user or team
  | 'media_messaging'
  | 'contact_tag_management'; // Add/remove tags from contacts

/**
 * Agent Capability Configuration
 * Configurações específicas para cada capability habilitada
 */
export interface AIAgentCapabilityConfig {
  capability: AIAgentCapability;
  enabled: boolean;
  config?: {
    // Calendar Management
    allowedUserIds?: string[];           // IDs de usuários permitidos para agendamento

    // Lead Management
    funnelId?: string;                   // Funil selecionado para criar leads

    // Conversation Transfer (for user and team transfers)
    allowedTransferUserIds?: string[];   // Usuários para os quais pode transferir
    allowedTeamIds?: string[];           // Equipes para as quais pode transferir
    transferMessage?: string;            // Mensagem padrão ao transferir

    // Media Messaging
    /**
     * Prefixos de URL permitidos para send_media_message além do allowlist
     * de contexto. Match por startsWith. Formato validado no backend:
     * http(s):// + host + barra após o host (ex: "https://cdn.exemplo.com/r/").
     * A barra após o host é obrigatória — sem ela, "https://cdn.x.com"
     * casaria com "https://cdn.x.com.evil.net/..." (bypass de sufixo).
     */
    allowedMediaUrlPrefixes?: string[];

    // Generic config for future capabilities
    [key: string]: unknown;
  };
}

/**
 * AI Agent Webhook Configuration
 * Allows external systems to send data that will be processed by AI and injected into conversations
 */
export interface AIAgentWebhookAIProcessing {
  enabled: boolean;
  /** Instruções para a IA transformar o JSON recebido em texto (min 10 chars quando enabled) */
  prompt: string;
}

export interface AIAgentWebhook {
  id: string;                                  // UUID v4 generated by backend
  name: string;                                // Descriptive name (e.g., "Notificação CRM")
  description?: string;                        // Optional description
  method: 'POST' | 'PUT' | 'PATCH';           // Accepted HTTP method
  /**
   * @deprecated Legado (webhooks criados antes de 2026-07-02, IA sempre ativa).
   * Leitura deve fazer fallback: prompt preenchido => aiProcessing { enabled: true, prompt }.
   * Escritas novas usam `aiProcessing`.
   */
  prompt?: string;
  /** Processamento com IA do JSON recebido. Desativado => JSON cru injetado na conversa. */
  aiProcessing?: AIAgentWebhookAIProcessing;
  /**
   * Filtros (lógica E) avaliados na recepção. `field` aceita caminhos de entidade
   * (contact.*, conversation.*) ou caminho no JSON recebido ($.a.b). Reprovou =>
   * 200 + log filtered, sem injeção/execução.
   */
  filters?: ToolFilterCondition[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAIAgentWebhookRequest {
  name: string;
  description?: string;
  method: 'POST' | 'PUT' | 'PATCH';
  aiProcessing?: AIAgentWebhookAIProcessing;
  filters?: ToolFilterCondition[];
}

export interface UpdateAIAgentWebhookRequest {
  name?: string;
  description?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  aiProcessing?: AIAgentWebhookAIProcessing;
  filters?: ToolFilterCondition[];
}

export interface UpdateAIAgentWebhookStatusRequest {
  status: 'active' | 'inactive';
}

export interface AIAgentResponse extends Omit<AIAgent, '_id'> {
  id: string;
  totalInteractions?: number;
}

export interface CreateAIAgentRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  delay?: number;
  /** Com quem o agente conversa. Fixo depois de criado. Default `customer_service`. */
  kind?: AIAgentKind;
  /** Sugestões de início na tela de agentes internos. Só usado por agente interno; máx 6 × 120. */
  conversationStarters?: string[];
  /** Funções da plataforma (E2). Ausente = desligado. */
  platformFunctions?: AIAgentPlatformFunctionsConfig;
  /** D9. Só atendimento. Ausente = false. */
  onlyCompanyUsers?: boolean;
  /** D12. Ausente = false. */
  requireConfirmation?: boolean;
  /** Categoria funcional (SDR, ATENDENTE, etc). Default 'outro' se omitido. */
  category?: AgentCategory;
  /** Segmento de mercado (EDUCACIONAL, IMOBILIARIA, etc). Default 'generico' se omitido. */
  segment?: AgentSegment;
  triggers: AIAgentTriggers;
  customActionIds?: string[];
  /** IDs dos workflows (usageType='skill') que este agente pode invocar */
  skillWorkflowIds?: string[];
  databases?: string[];                     // Database IDs that the agent can access
  voiceEnabled?: boolean;
  voiceConfig?: AIAgentVoiceConfig;
  enabledCapabilities?: AIAgentCapabilityConfig[];  // ✅ UNIFIED: Capabilities + Configurations
  escalationConfig?: AIAgentEscalationConfig;
  /** Ajuste por agente do cadastro oficial do negócio (herda da empresa campo a campo) */
  officialInfoOverride?: AIAgentOfficialInfoOverride;
  webhooks?: Omit<AIAgentWebhook, 'createdAt' | 'updatedAt'>[];
}

export interface UpdateAIAgentRequest {
  name?: string;
  description?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  delay?: number;
  /**
   * O tipo é fixo na criação: só é aceito igual ao atual (formulário que
   * reenvia o agente inteiro). Valor diferente é recusado com 422.
   */
  kind?: AIAgentKind;
  /** Sugestões de início na tela de agentes internos. Só usado por agente interno; máx 6 × 120. */
  conversationStarters?: string[];
  /** Funções da plataforma (E2). */
  platformFunctions?: AIAgentPlatformFunctionsConfig;
  /** D9. Só atendimento. */
  onlyCompanyUsers?: boolean;
  /** D12. */
  requireConfirmation?: boolean;
  category?: AgentCategory;
  segment?: AgentSegment;
  triggers?: AIAgentTriggers;
  customActionIds?: string[];
  /** IDs dos workflows (usageType='skill') que este agente pode invocar */
  skillWorkflowIds?: string[];
  databases?: string[];                     // Database IDs that the agent can access
  voiceEnabled?: boolean;
  voiceConfig?: AIAgentVoiceConfig;
  enabledCapabilities?: AIAgentCapabilityConfig[];  // ✅ UNIFIED: Capabilities + Configurations
  escalationConfig?: AIAgentEscalationConfig;
  /** Ajuste por agente do cadastro oficial do negócio (herda da empresa campo a campo) */
  officialInfoOverride?: AIAgentOfficialInfoOverride;
  webhooks?: Omit<AIAgentWebhook, 'createdAt' | 'updatedAt'>[];
}

/**
 * Voz do agente.
 *
 * - Atendimento: `voiceEnabled` deixa o agente mandar áudio (`send_audio_message`).
 * - Interno (E4, 25/11/2026): `voiceEnabled` liga o microfone e a leitura em voz no chat. Ausente = desligado.
 *
 * Qual integração fala é escolhido pela HABILIDADE marcada no app, como a transcrição: voz comum usa a
 * integração com `text_to_speech` marcada (padrão: Vercel AI Gateway); voz clonada (`voiceId`) usa a
 * integração com `voice_cloning` marcada, porque a voz só existe na conta que a clonou.
 */
export interface AIAgentVoiceConfig {
  /** Legado: o provedor que o editor antigo gravava. A escolha real é pela habilidade marcada. */
  aiProviderId?: string;
  /** Voz CLONADA: id do documento em `voices`. Tem prioridade sobre `speechVoice`. */
  voiceId?: string;
  /** Voz pronta do modelo de voz marcado no app (ex.: 'Laomedeia' do Gemini). Ausente = padrão da integração. */
  speechVoice?: string;
  /** Velocidade de 0.75 a 1.5. Ausente = 1. Modelos que não aceitam ignoram. */
  speed?: number;
}

export interface AIAgentQuery extends PaginationQuery {
  status?: ActiveStatus | undefined;
  voiceEnabled?: boolean | undefined;
  /** Filtra pelo tipo. `customer_service` também traz os agentes sem o campo. */
  kind?: AIAgentKind | undefined;
}

/**
 * Agent version change type
 */
export type AgentVersionChangeType = 'major' | 'minor' | 'patch' | 'initial';

/**
 * Agent Version - Snapshot of agent systemPrompt at a specific version
 */
export interface AgentVersion {
  _id?: ObjectId;
  agentId: ObjectId | string;
  version: string;                    // Semver "1.0.0"
  systemPrompt: string;
  changePercentage: number;           // 0-100
  changeType: AgentVersionChangeType;
  appId: ObjectId | string;
  companyId: ObjectId | string;
  createdAt: Date | string;
}

/**
 * Agent Version API Response
 */
export interface AgentVersionResponse extends Omit<AgentVersion, '_id'> {
  id: string;
}

/**
 * Query parameters for agent versions
 */
export interface AgentVersionQuery extends PaginationQuery {}

// ============================================================================
// FUNÇÕES DA PLATAFORMA (E2, 24/11/2026)
// Contrato: DOCS/superpowers/plans/2026-11-24-agentes-internos-e2.md §3–§5.
// Respostas do dono: Q5 (apagar liberado pelo nível), Q6 (nível próprio = tudo o
// que o nível permite, sem lista conferida), Q8 (teto por módulo já na E2).
// ============================================================================

/** Com o nível de quem o agente age: quem está pedindo, ou o nível próprio do agente (D7). */
export type AgentActAs = 'requester' | 'agent';

export interface AIAgentPlatformFunctionsConfig {
  enabled: boolean;
  /** Ausente = 'requester'. */
  actAs?: AgentActAs;
  /** Obrigatório quando enabled && actAs === 'agent'. Nível cadastrado (D8). */
  levelId?: string;
  /**
   * Só atendimento, só actAs 'agent', só para contato que NÃO é usuário da empresa (E2-7).
   * Nomes de função do catálogo. Ausente/vazio = nenhuma.
   */
  customerAllowedFunctions?: string[];
  /**
   * (Q8) Teto por módulo — mesmo formato das conexões OAuth do MCP: módulo → 'read' | 'write'.
   * Módulo ausente = sem acesso. Vale para os dois principais e é sempre limitado pelo nível
   * (o teto só tira, nunca dá). Obrigatório com ao menos um módulo quando `enabled: true`.
   */
  modules?: McpModuleGrant;
}

export const PLATFORM_FUNCTION_LIMITS = {
  findMaxResults: 8,
  resultMaxChars: 12_000,
  customerAllowedMax: 30,
  confirmationTtlMinutes: 15,
} as const;

/**
 * Por que uma função não está disponível ao agente.
 * - `never_for_agents`: lista fixa "nunca pelo agente" (configuração, segurança, envio em massa).
 * - `no_permission_write`: função sem permissão de módulo bloqueada pela regra P3.
 * - `outside_agent_modules`: fora do teto de módulos do agente (Q8). Só em negações do portão e em R2.
 */
export type PlatformFunctionBlockReason =
  | 'never_for_agents'
  | 'no_permission_write'
  | 'outside_agent_modules';

export interface PlatformFunctionCatalogItem {
  /** Nome da função no catálogo do MCP ('create_ticket'). */
  name: string;
  /** Rótulo em pt-BR para passos e cartões ('Criar ticket'). */
  label: string;
  description: string;
  /** Módulo usado no teto (grantModule do MCP). */
  module: string;
  access: 'read' | 'write';
  requiresPermission: boolean;
  /**
   * Com nível próprio do agente, esta função pode entrar?
   * (Q6) = fora de NEVER_FOR_AGENTS e exige permissão de módulo (P3 bloqueia as sem permissão).
   */
  agentPrincipalAllowed: boolean;
  /** Pode ser liberada para clientes (tem vínculo contactId/conversationId)? */
  customerBindable: boolean;
  blockedReason?: PlatformFunctionBlockReason;
}

export interface PlatformFunctionCatalogResponse {
  items: PlatformFunctionCatalogItem[];
  modules: Array<{ module: string; label: string }>;
}

export interface AgentEffectiveFunctionsResponse {
  /** null quando actAs = 'requester' (depende de quem pede). */
  levelName: string | null;
  /** Já com o teto de módulos salvo do agente aplicado (Q8). */
  functions: Array<Pick<PlatformFunctionCatalogItem, 'name' | 'label' | 'module' | 'access'>>;
}

/**
 * (Q8) Módulos que o editor oferece no teto — reusa `McpGrantableModule` da tela de autorização do MCP.
 * `canWrite` = existe ao menos uma função de alteração do módulo alcançável (NEVER_FOR_AGENTS + P3,
 * mais o nível quando `levelId` foi informado).
 */
export interface PlatformFunctionGrantableModulesResponse {
  modules: McpGrantableModule[];
}
