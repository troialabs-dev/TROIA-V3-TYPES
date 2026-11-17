import { ObjectId } from 'mongodb';
import { ActiveStatus, PaginationQuery } from './common';
import { ToolFilterCondition } from './custom-actions';

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
  voiceConfig?: {
    aiProviderId: string;
    voiceId?: string;  // ✅ ID da voz específica (ex: 'alloy', 'nova', 'shimmer' para OpenAI, ou voice ID do ElevenLabs)
  };
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
  voiceConfig?: {
    aiProviderId: string;
    voiceId?: string;
  };
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
  category?: AgentCategory;
  segment?: AgentSegment;
  triggers?: AIAgentTriggers;
  customActionIds?: string[];
  /** IDs dos workflows (usageType='skill') que este agente pode invocar */
  skillWorkflowIds?: string[];
  databases?: string[];                     // Database IDs that the agent can access
  voiceEnabled?: boolean;
  voiceConfig?: {
    aiProviderId: string;
    voiceId?: string;
  };
  enabledCapabilities?: AIAgentCapabilityConfig[];  // ✅ UNIFIED: Capabilities + Configurations
  escalationConfig?: AIAgentEscalationConfig;
  /** Ajuste por agente do cadastro oficial do negócio (herda da empresa campo a campo) */
  officialInfoOverride?: AIAgentOfficialInfoOverride;
  webhooks?: Omit<AIAgentWebhook, 'createdAt' | 'updatedAt'>[];
}

export interface AIAgentQuery extends PaginationQuery {
  status?: ActiveStatus | undefined;
  voiceEnabled?: boolean | undefined;
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
