// ============================================================================
// AI PROVIDER CONFIGURATIONS
// ============================================================================

/**
 * Supported AI providers for agent execution
 * These are the providers that support AI_TEXT_GENERATION and AI_CHAT_COMPLETION capabilities
 */
export type AIProviderType =
  | 'openai'
  | 'anthropic'
  | 'xai'
  | 'google'
  | 'mistral'
  | 'deepseek'
  | 'zai'
  // Fabricantes servidos SÓ pelo Vercel AI Gateway — mesmo desenho do `zai`:
  // existe o tipo (e um ProviderId correspondente, para os mapas do
  // ModelResolverService), mas não há provider direto no ProviderRegistry,
  // então não dá para cadastrar integração própria no admin. Os modelos
  // deles chegam pelo gateway ou não chegam.
  | 'moonshotai'
  | 'alibaba'
  | 'minimax'
  | 'meta'
  // Microsoft entra (14/10/2026) só pela transcrição: o MAI-Transcribe 2.
  | 'microsoft';

/**
 * OpenAI Provider Config - APENAS API Key necessário
 * Modelo e dimensions são fixados dentro do OpenAIProvider
 */
export interface OpenAIConfig {
  apiKey: string;
}

/**
 * Cohere Provider Config
 * Future AI provider for embeddings
 */
export interface CohereConfig {
  apiKey: string;
  model?: string;
}

/**
 * Anthropic Provider Config
 * For Claude models (Claude 3, Claude 3.5, etc.)
 */
export interface AnthropicConfig {
  apiKey: string;
}

/**
 * HuggingFace Provider Config
 * Future AI provider for embeddings
 */
export interface HuggingFaceConfig {
  apiKey: string;
  model: string;
}

/**
 * Union type for all AI Provider Configs
 */
export type AIProviderConfig =
  | OpenAIConfig
  | AnthropicConfig
  | CohereConfig
  | HuggingFaceConfig;

// ============================================================================
// AI MODEL CATALOG
// ============================================================================

/**
 * Features suportadas por um modelo de IA
 * Diferente de AIAgentCapability (que são features do agente, não do modelo)
 *
 * `'reasoning'` = o modelo PENSA POR PADRÃO, e o pensamento sai do mesmo
 * limite de saída da resposta. O backend dá a ele folga de saída (piso de
 * 8.192) e não manda temperature/seed. Sem a marca, um limite baixo (300)
 * some inteiro no pensamento e o agente fica MUDO — foi o GLM 5.3 em prod e
 * o gpt-5/gpt-5-mini na bateria de 24/09/2026.
 *
 * Confira pela bateria (`scripts/bateria-agente-duas-instancias.ts
 * --modelos gateway` no backend), NÃO pela etiqueta "reasoning" do gateway:
 * ela marca quem CONSEGUE pensar, não quem pensa sempre — na bateria de
 * 24/09 (61 modelos, limite de 300), só gpt-5, gpt-5-mini, gemini-3-flash,
 * glm-5.3-flashx e minimax-m3 ficaram mudos; os GPT-5.4 em diante, os Claude
 * e os Gemini 2.5 responderam normalmente.
 */
export type AIModelFeature = 'pdf' | 'image' | 'tools' | 'reasoning';

/**
 * Definição completa de um modelo de IA
 * Single source of truth para metadados de todos os modelos suportados
 */
export interface AIModelDefinition {
  /** ID enviado à API do provider (ex: 'gpt-4.1-mini') */
  id: string;
  /** Nome exibido no frontend (ex: 'GPT-4.1 Mini') */
  name: string;
  /** Provider que serve este modelo */
  provider: AIProviderType;
  /** Features que o modelo suporta nativamente */
  features: AIModelFeature[];
  /** Frase curta de destaque para exibir no select */
  highlight: string;
  /** Preços em USD por 1M tokens */
  pricing: {
    input: number;
    output: number;
  };
  /** Máx tokens de contexto (input) — valor real da API */
  contextWindow: number;
  /** Máx tokens de saída — valor real da API */
  maxOutputTokens: number;
  /**
   * Preço do provedor para modelos de ÁUDIO, na unidade em que ele cobra.
   *
   * `pricing` (por 1M de tokens) não serve aqui: transcrição é cobrada por
   * duração e voz por caractere. Antes de 20/09/2026 esses números viviam em
   * COMENTÁRIO ao lado do modelo, o que significa que a tabela de custos era
   * calculada à mão a partir de um texto — e comentário desatualiza sem
   * ninguém perceber (CLAUDE.md NUNCA #52). Agora é dado.
   */
  audioPricing?: {
    /** US$ por minuto de áudio transcrito. */
    perMinute?: number;
    /** US$ por 1.000 caracteres sintetizados. */
    per1kChars?: number;
  };
  /** Modelo legado mantido para retrocompatibilidade */
  deprecated?: boolean;
  /**
   * Para que serve o modelo.
   *
   * `'agent'` (padrão) = conversa com o cliente. `'judge'` = só verificação
   * interna (conformidade, avaliação) — não aparece no seletor "Modelo de IA"
   * do agente, porque não é modelo de conversa. `'stt'`/`'tts'` = áudio
   * (transcrição e voz): entram no catálogo para terem preço por modelo na
   * tela de custos, e pelo mesmo motivo ficam fora do seletor do agente.
   *
   * Nasceu com o `gpt-oss-safeguard-20b`, que é treinado para ler uma política
   * e dar veredito, não para atender ninguém.
   */
  purpose?: 'agent' | 'judge' | 'stt' | 'tts';
  /**
   * Esforço de raciocínio FIXO que o agente manda ao provedor (hoje só OpenAI).
   *
   * Existe porque modelo com raciocínio desligável "pensa" por padrão quando
   * ninguém diz nada. Medido em 14/10/2026 com o `gpt-6-luna` em turnos reais:
   * no padrão do fabricante, 2 de 11 respostas gastaram TODO o limite de saída
   * pensando e o agente ficou mudo — a mesma falha do GLM 5.3 em 24/09/2026.
   * Com `'none'` ele não pensa, responde em ~4 s e foi o que venceu a sonda.
   *
   * Ausente = o runtime não manda nada (comportamento de antes).
   */
  reasoningEffort?: 'none' | 'minimal' | 'low' | 'medium' | 'high';
  /**
   * Slug deste MESMO modelo no Vercel AI Gateway (ex: `openai/gpt-4.1-mini`).
   *
   * **Ausente = não roteia pelo gateway.** O modelo continua sendo servido
   * pela integração direta do provider de origem. É o caso de
   * `deepseek-chat`/`deepseek-reasoner` (apelidos da API própria da DeepSeek,
   * sem equivalente no gateway) e dos modelos legados do Gemini 1.5.
   *
   * O `id` acima NUNCA muda: é ele que está gravado nos 127 agentes, nas
   * linhas de custo em `apps.costs[]` e no select "Modelo de IA". O slug é
   * só o endereço do mesmo modelo no transporte alternativo.
   *
   * Conferidos um a um contra `https://ai-gateway.vercel.sh/v1/models`
   * em 25/08/2026 — atenção ao Anthropic, que usa PONTO
   * (`claude-haiku-4.5`) onde o id da API oficial usa hífen e data
   * (`claude-haiku-4-5-20251001`).
   */
  gatewaySlug?: string;
}

/**
 * Catálogo completo de modelos de IA suportados
 *
 * Para adicionar um novo modelo: adicionar entrada aqui e atualizar o provider correspondente no backend.
 * Para deprecar um modelo: setar deprecated: true (mantém retrocompatibilidade).
 *
 * Preços: USD por 1M tokens (março/2026)
 * Context/maxOutput: valores reais da API de cada provider
 */
export const AI_MODELS: AIModelDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  // OpenAI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gpt-4.1-nano',
    gatewaySlug: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    features: ['image', 'tools'],
    highlight: 'Ultra rápido e econômico, 1M contexto',
    pricing: { input: 0.10, output: 0.40 },
    contextWindow: 1_000_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-4o-mini',
    gatewaySlug: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Confiável e versátil',
    pricing: { input: 0.15, output: 0.60 },
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
  },
  {
    id: 'gpt-5-mini',
    gatewaySlug: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'GPT-5 econômico',
    pricing: { input: 0.25, output: 1.00 },
    contextWindow: 128_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-4.1-mini',
    gatewaySlug: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Ótimo equilíbrio qualidade/preço, 1M contexto',
    pricing: { input: 0.40, output: 1.60 },
    contextWindow: 1_000_000,
    maxOutputTokens: 32_768,
  },
  // Modelo padrão desde 14/10/2026. Sonda com 544 turnos reais (17 empresas):
  // nota 6,7 contra 5,9 do gpt-4.1-mini, menos erros graves (22% × 29%), usa
  // a ferramenta de envio em 100% dos turnos — a 1/6 do custo. O preço por
  // faixa (US$ 0,20/0,75 acima de 272 mil tokens por chamada) não entra:
  // é 0,1% das nossas chamadas.
  {
    id: 'gpt-6-luna',
    gatewaySlug: 'openai/gpt-6-luna',
    name: 'GPT-6 Luna',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Padrão da plataforma: preciso, rápido e econômico',
    pricing: { input: 0.10, output: 0.50 },
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    reasoningEffort: 'none',
  },
  {
    id: 'o4-mini',
    gatewaySlug: 'openai/o4-mini',
    name: 'o4 Mini',
    provider: 'openai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Raciocínio avançado para tarefas complexas',
    pricing: { input: 1.10, output: 4.40 },
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
  },
  {
    id: 'gpt-5',
    gatewaySlug: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Máxima inteligência OpenAI',
    pricing: { input: 1.25, output: 10.00 },
    contextWindow: 256_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-5.4-nano',
    gatewaySlug: 'openai/gpt-5.4-nano',
    name: 'GPT-5.4 Nano',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'GPT-5.4 ultra econômico — classificação e extração',
    pricing: { input: 0.20, output: 1.25 },
    contextWindow: 400_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-5.4-mini',
    gatewaySlug: 'openai/gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'GPT-5.4 econômico, ótimo custo/qualidade',
    pricing: { input: 0.75, output: 4.50 },
    contextWindow: 400_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-5.4',
    gatewaySlug: 'openai/gpt-5.4',
    name: 'GPT-5.4',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Top instruction-following (IFEval 96), 1M contexto',
    pricing: { input: 2.50, output: 15.00 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'gpt-4.1',
    gatewaySlug: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Alta qualidade, contexto gigante',
    pricing: { input: 2.00, output: 8.00 },
    contextWindow: 1_000_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-4o',
    gatewaySlug: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Multimodal robusto',
    pricing: { input: 2.50, output: 10.00 },
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
  },

  // ═══════════════════════════════════════════════════════════════
  // Anthropic
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'claude-haiku-4-5-20251001',
    gatewaySlug: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Rápido, empático, segue instruções à risca',
    pricing: { input: 1.00, output: 5.00 },
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
  },
  {
    id: 'claude-sonnet-4-5-20250929',
    gatewaySlug: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Melhor para agentes complexos',
    pricing: { input: 3.00, output: 15.00 },
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
  },
  {
    id: 'claude-opus-4-5-20251101',
    gatewaySlug: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Premium — máxima inteligência',
    pricing: { input: 5.00, output: 25.00 },
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
  },

  // ═══════════════════════════════════════════════════════════════
  // Google
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gemini-2.5-flash-lite',
    gatewaySlug: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Ultra econômico com suporte a PDF',
    pricing: { input: 0.10, output: 0.40 },
    contextWindow: 1_000_000,
    maxOutputTokens: 4_096,
  },
  {
    id: 'gemini-2.5-flash',
    gatewaySlug: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Melhor custo-benefício, 1M contexto',
    pricing: { input: 0.30, output: 2.50 },
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'gemini-2.5-pro',
    gatewaySlug: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Alta qualidade, 1M contexto',
    pricing: { input: 1.25, output: 10.00 },
    contextWindow: 1_000_000,
    maxOutputTokens: 16_384,
  },

  // ═══════════════════════════════════════════════════════════════
  // DeepSeek
  // IDs validados contra POST /chat/completions em 2026-05-17.
  // A API aceita 4 IDs: 2 explícitos (v4-pro, v4-flash) + 2 aliases
  // (deepseek-chat → V4-Pro, deepseek-reasoner → V4-Pro c/ thinking).
  // GET /models só lista os 2 explícitos, mas POST /chat/completions
  // aceita os 4. NÃO adicionar IDs sem validar via POST.
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'deepseek-v4-pro',
    gatewaySlug: 'deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4-Pro',
    provider: 'deepseek',
    features: ['tools'],
    highlight: 'Top open-weight 2026 — preço promocional até 31/mai/2026',
    // Promo: $0.435 in / $0.87 out até 2026-05-31 15:59 UTC.
    // Após essa data: ajustar para { input: 1.74, output: 3.48 }.
    pricing: { input: 0.435, output: 0.87 },
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'deepseek-v4-flash',
    gatewaySlug: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4-Flash',
    provider: 'deepseek',
    features: ['tools'],
    highlight: 'Variante leve e barata — fallback se Pro tiver downtime',
    pricing: { input: 0.14, output: 0.28 },
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat (alias V4-Pro)',
    provider: 'deepseek',
    features: ['tools'],
    highlight: 'Alias estável — aponta sempre pro modelo chat mais recente',
    pricing: { input: 0.435, output: 0.87 },
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner (thinking mode)',
    provider: 'deepseek',
    features: ['tools', 'reasoning'],
    highlight: 'Modo de raciocínio profundo — usa thinking tokens (mais lento + caro)',
    pricing: { input: 0.435, output: 0.87 },
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
  },

  // ═══════════════════════════════════════════════════════════════
  // Z.ai (GLM)
  // Fabricante sem integração direta cadastrada — chega SÓ pelo Vercel
  // AI Gateway (mesmo caso do Safeguard). Slug, preço, contexto e
  // modalidades conferidos contra https://ai-gateway.vercel.sh/v1/models
  // em 02/09/2026. Reasoning é por effort (low/high/max), SEM toggle de
  // desligar — por isso a feature 'reasoning' (pula temperature e dá 4x
  // de budget de saída no AgentRuntime).
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'glm-5.3-flash',
    gatewaySlug: 'zai/glm-5.3-flash',
    name: 'GLM 5.3 Flash',
    provider: 'zai',
    features: ['image', 'tools', 'reasoning'],
    highlight: 'Ultra econômico com visão e 1M contexto (só via gateway)',
    pricing: { input: 0.15, output: 0.50 },
    contextWindow: 1_000_000,
    maxOutputTokens: 131_000,
  },

  // ═══════════════════════════════════════════════════════════════
  // Ampliação do catálogo (18/09/2026) — 41 modelos de texto novos.
  //
  // Preço, contexto e teto de saída NÃO foram escritos à mão: saíram de
  // `https://ai-gateway.vercel.sh/v1/models`, o mesmo endereço que serve as
  // chamadas. O que é decisão nossa é a curadoria (quais entram), o nome e a
  // frase de destaque.
  //
  // Sobre a feature `reasoning`: aqui ela NÃO é o tag `reasoning` do
  // gateway — é "o raciocínio não desliga", porque é isso que o
  // `AgentRuntime` usa para pular a temperatura e dar 4× de teto de saída.
  // A regra aplicada (conferida contra as 30 entradas antigas, bate em
  // todas): sem `toggle` e sem valor de esforço que desligue (`none` /
  // `minimal`). Por isso `gpt-5.4` fica de fora e `o4-mini` fica dentro.
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gpt-5.5',
    gatewaySlug: 'openai/gpt-5.5',
    name: 'GPT-5.5',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Topo de linha da OpenAI, 1M de contexto',
    pricing: { input: 5.0, output: 30.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'gpt-5.6-luna',
    gatewaySlug: 'openai/gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Barato e rápido com 1M de contexto',
    pricing: { input: 0.2, output: 1.2 },
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'gpt-5.6-sol',
    gatewaySlug: 'openai/gpt-5.6-sol',
    name: 'GPT-5.6 Sol',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Equilíbrio entre custo e qualidade',
    pricing: { input: 2.0, output: 10.0 },
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'gpt-6-astra',
    gatewaySlug: 'openai/gpt-6-astra',
    name: 'GPT-6 Astra',
    provider: 'openai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Geração mais nova da OpenAI',
    pricing: { input: 10.0, output: 50.0 },
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'claude-sonnet-5',
    gatewaySlug: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Sonnet atual: 1M de contexto',
    pricing: { input: 2.0, output: 10.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'claude-opus-5',
    gatewaySlug: 'anthropic/claude-opus-5',
    name: 'Claude Opus 5',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'O mais capaz da Anthropic',
    pricing: { input: 5.0, output: 25.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'claude-sonnet-4-6',
    gatewaySlug: 'anthropic/claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Sonnet da geração anterior',
    pricing: { input: 3.0, output: 15.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'claude-opus-4-8',
    gatewaySlug: 'anthropic/claude-opus-4.8',
    name: 'Claude Opus 4.8',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Opus da geração anterior',
    pricing: { input: 5.0, output: 25.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'gemini-3-flash',
    gatewaySlug: 'google/gemini-3-flash',
    name: 'Gemini 3 Flash',
    provider: 'google',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Gemini 3 rápido, 1M de contexto',
    pricing: { input: 0.5, output: 3.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 65_000,
  },
  {
    id: 'gemini-3.1-flash-lite',
    gatewaySlug: 'google/gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: 'O mais barato do Gemini 3',
    pricing: { input: 0.25, output: 1.5 },
    contextWindow: 1_000_000,
    maxOutputTokens: 65_000,
  },
  {
    id: 'gemini-3.5-flash',
    gatewaySlug: 'google/gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Geração 3.5, rápido',
    pricing: { input: 1.5, output: 9.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 64_000,
  },
  {
    id: 'gemini-3.8-flash',
    gatewaySlug: 'google/gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'google',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Gemini mais recente',
    pricing: { input: 0.75, output: 3.75 },
    contextWindow: 1_000_000,
    maxOutputTokens: 65_536,
  },
  {
    id: 'gemini-3.1-pro',
    gatewaySlug: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Gemini Pro para tarefas difíceis',
    pricing: { input: 2.0, output: 12.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 64_000,
  },
  {
    id: 'deepseek-v4.1-flash',
    gatewaySlug: 'deepseek/deepseek-v4.1-flash',
    name: 'DeepSeek V4.1 Flash',
    provider: 'deepseek',
    features: ['image', 'tools'],
    highlight: 'Geração 4.1, 1M de contexto',
    pricing: { input: 0.3, output: 1.2 },
    contextWindow: 1_048_576,
    maxOutputTokens: 32_768,
  },
  {
    id: 'deepseek-v3.2',
    gatewaySlug: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'deepseek',
    features: ['tools'],
    highlight: 'Geração 3.2 estável',
    pricing: { input: 0.62, output: 1.85 },
    contextWindow: 128_000,
    maxOutputTokens: 8_000,
  },
  {
    id: 'deepseek-r1',
    gatewaySlug: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    features: ['tools', 'reasoning'],
    highlight: 'Raciocínio sempre ligado',
    pricing: { input: 1.35, output: 5.4 },
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    // Fora do seletor desde 24/09/2026 (decisão do dono): pelo gateway ele não
    // chama ferramenta de verdade — escreve a chamada como texto — e o agente
    // do TroiaChat só fala com o cliente por ferramenta. Não respondeu em
    // nenhuma rodada da bateria de modelos.
    deprecated: true,
  },
  {
    id: 'glm-5.3',
    gatewaySlug: 'zai/glm-5.3',
    name: 'GLM 5.3',
    provider: 'zai',
    features: ['tools', 'reasoning'],
    highlight: 'GLM completo, 1M de contexto',
    pricing: { input: 1.4, output: 4.4 },
    contextWindow: 1_000_000,
    maxOutputTokens: 1_000_000,
  },
  {
    id: 'glm-5.3-flashx',
    gatewaySlug: 'zai/glm-5.3-flashx',
    name: 'GLM 5.3 FlashX',
    provider: 'zai',
    features: ['image', 'tools', 'reasoning'],
    highlight: 'Meio-termo entre Flash e completo',
    pricing: { input: 0.37, output: 1.25 },
    contextWindow: 1_000_000,
    maxOutputTokens: 131_072,
  },
  {
    id: 'glm-4.7-flash',
    gatewaySlug: 'zai/glm-4.7-flash',
    name: 'GLM 4.7 Flash',
    provider: 'zai',
    features: ['tools'],
    highlight: 'O mais barato da Z.ai',
    pricing: { input: 0.07, output: 0.4 },
    contextWindow: 200_000,
    maxOutputTokens: 131_000,
  },
  {
    id: 'glm-5.2',
    gatewaySlug: 'zai/glm-5.2',
    name: 'GLM 5.2',
    provider: 'zai',
    features: ['tools'],
    highlight: 'Geração anterior do GLM',
    pricing: { input: 0.8, output: 2.55 },
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'kimi-k2.5',
    gatewaySlug: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'moonshotai',
    features: ['image', 'tools'],
    highlight: 'Kimi econômico com 256k de contexto',
    pricing: { input: 0.6, output: 3.0 },
    contextWindow: 256_000,
    maxOutputTokens: 256_000,
  },
  {
    id: 'kimi-k2.6',
    gatewaySlug: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    provider: 'moonshotai',
    features: ['image', 'tools'],
    highlight: 'Kimi da geração 2.6',
    pricing: { input: 0.95, output: 4.0 },
    contextWindow: 262_000,
    maxOutputTokens: 262_000,
  },
  {
    id: 'kimi-k3',
    gatewaySlug: 'moonshotai/kimi-k3',
    name: 'Kimi K3',
    provider: 'moonshotai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Kimi atual, 1M de contexto',
    pricing: { input: 3.0, output: 15.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 131_072,
  },
  {
    id: 'kimi-k3-fast',
    gatewaySlug: 'moonshotai/kimi-k3-fast',
    name: 'Kimi K3 Fast',
    provider: 'moonshotai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Kimi K3 com resposta mais rápida',
    pricing: { input: 4.5, output: 22.5 },
    contextWindow: 1_000_000,
    maxOutputTokens: 131_072,
  },
  {
    id: 'qwen3.7-flash',
    gatewaySlug: 'alibaba/qwen3.7-flash',
    name: 'Qwen 3.7 Flash',
    provider: 'alibaba',
    features: ['pdf', 'image', 'tools'],
    highlight: 'O mais barato do catálogo',
    pricing: { input: 0.03, output: 0.13 },
    contextWindow: 991_000,
    maxOutputTokens: 64_000,
  },
  {
    id: 'qwen3.8-flash',
    gatewaySlug: 'alibaba/qwen3.8-flash',
    name: 'Qwen 3.8 Flash',
    provider: 'alibaba',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Qwen atual, barato e com visão',
    pricing: { input: 0.15, output: 0.47 },
    contextWindow: 991_000,
    maxOutputTokens: 128_000,
  },
  {
    id: 'qwen3.8-27b',
    gatewaySlug: 'alibaba/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    provider: 'alibaba',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Qwen médio, 1M de contexto',
    pricing: { input: 0.5, output: 3.0 },
    contextWindow: 1_000_000,
    maxOutputTokens: 131_072,
  },
  {
    id: 'qwen3.8-max',
    gatewaySlug: 'alibaba/qwen3.8-max',
    name: 'Qwen 3.8 Max',
    provider: 'alibaba',
    features: ['image', 'tools', 'reasoning'],
    highlight: 'O mais capaz da Alibaba',
    pricing: { input: 2.0, output: 6.0 },
    contextWindow: 262_144,
    maxOutputTokens: 128_000,
  },
  {
    id: 'qwen3.7-plus',
    gatewaySlug: 'alibaba/qwen3.7-plus',
    name: 'Qwen 3.7 Plus',
    provider: 'alibaba',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Equilíbrio de custo e qualidade',
    pricing: { input: 0.4, output: 1.6 },
    contextWindow: 1_000_000,
    maxOutputTokens: 64_000,
  },
  {
    id: 'minimax-m2.7',
    gatewaySlug: 'minimax/minimax-m2.7',
    name: 'MiniMax M2.7',
    provider: 'minimax',
    features: ['tools'],
    highlight: 'Barato com 200k de contexto',
    pricing: { input: 0.3, output: 1.2 },
    contextWindow: 204_800,
    maxOutputTokens: 131_000,
  },
  {
    id: 'minimax-m3',
    gatewaySlug: 'minimax/minimax-m3',
    name: 'MiniMax M3',
    provider: 'minimax',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'MiniMax atual, 512k de contexto',
    pricing: { input: 0.3, output: 1.2 },
    contextWindow: 512_000,
    maxOutputTokens: 512_000,
    // Fora do seletor desde 24/09/2026 (decisão do dono): no fluxo do agente se
    // perde nas instruções — negou a foto que elas mandavam enviar e chegou a
    // inventar uma persona ("Mila da MV Refrigeração") que não existe em lugar
    // nenhum. Numa conversa simples obedece; com o prompt do agente, não.
    deprecated: true,
  },
  {
    id: 'llama-3.3-70b',
    gatewaySlug: 'meta/llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    features: ['tools'],
    highlight: 'Llama aberto, 128k de contexto',
    pricing: { input: 0.72, output: 0.72 },
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    // Fora do seletor desde 24/09/2026 (decisão do dono): depois da primeira
    // mensagem passa a escrever a chamada de ferramenta como JSON em texto,
    // mesmo com o reestímulo — sem foto e sem transferência na bateria.
    deprecated: true,
  },
  {
    id: 'llama-4-maverick',
    gatewaySlug: 'meta/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'meta',
    features: ['image', 'tools'],
    highlight: 'Llama 4 com visão',
    pricing: { input: 0.24, output: 0.97 },
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'llama-4-scout',
    gatewaySlug: 'meta/llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'meta',
    features: ['image', 'tools'],
    highlight: 'Llama 4 econômico',
    pricing: { input: 0.17, output: 0.66 },
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
  },
  {
    id: 'mistral-large-3',
    gatewaySlug: 'mistral/mistral-large-3',
    name: 'Mistral Large 3',
    provider: 'mistral',
    features: ['image', 'tools'],
    highlight: 'Topo de linha da Mistral',
    pricing: { input: 0.5, output: 1.5 },
    contextWindow: 262_144,
    maxOutputTokens: 256_000,
  },
  {
    id: 'mistral-small',
    gatewaySlug: 'mistral/mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    features: ['image', 'tools'],
    highlight: 'Mistral econômico',
    pricing: { input: 0.15, output: 0.6 },
    contextWindow: 262_144,
    maxOutputTokens: 4_000,
  },
  {
    id: 'ministral-8b',
    gatewaySlug: 'mistral/ministral-8b',
    name: 'Ministral 8B',
    provider: 'mistral',
    features: ['image', 'tools'],
    highlight: 'Mistral mínimo, muito barato',
    pricing: { input: 0.15, output: 0.15 },
    contextWindow: 262_144,
    maxOutputTokens: 4_000,
  },
  {
    id: 'grok-4.1-fast',
    gatewaySlug: 'spacexai/grok-4.1-fast-non-reasoning',
    name: 'Grok 4.1 Fast',
    provider: 'xai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Grok rápido, 1M de contexto',
    pricing: { input: 0.2, output: 0.5 },
    contextWindow: 1_000_000,
    maxOutputTokens: 1_000_000,
  },
  {
    id: 'grok-4.1-fast-reasoning',
    gatewaySlug: 'spacexai/grok-4.1-fast-reasoning',
    name: 'Grok 4.1 Fast (raciocínio)',
    provider: 'xai',
    features: ['pdf', 'image', 'tools', 'reasoning'],
    highlight: 'Grok rápido com raciocínio',
    pricing: { input: 0.2, output: 0.5 },
    contextWindow: 1_000_000,
    maxOutputTokens: 1_000_000,
  },
  {
    id: 'grok-4.3',
    gatewaySlug: 'spacexai/grok-4.3',
    name: 'Grok 4.3',
    provider: 'xai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Grok da geração 4.3',
    pricing: { input: 1.25, output: 2.5 },
    contextWindow: 1_000_000,
    maxOutputTokens: 1_000_000,
  },
  {
    id: 'grok-4.6',
    gatewaySlug: 'spacexai/grok-4.6',
    name: 'Grok 4.6',
    provider: 'xai',
    features: ['image', 'tools'],
    highlight: 'Grok mais recente',
    pricing: { input: 2.0, output: 6.0 },
    contextWindow: 500_000,
    maxOutputTokens: 500_000,
  },
  // ═══════════════════════════════════════════════════════════════
  // Áudio — transcrição e voz.
  //
  // Não são modelos de conversa e por isso têm `purpose` próprio: ficam fora
  // do seletor "Modelo de IA" do agente e aparecem só na tela de custos, que
  // é o motivo de existirem aqui. A cobrança deles não é por token (Whisper
  // cobra por minuto, TTS por caractere) — ver `ai.transcription` e
  // `ai.speech` em `credits.ts`.
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'whisper-1',
    gatewaySlug: 'openai/whisper-1',
    name: 'Whisper',
    provider: 'openai',
    purpose: 'stt',
    features: [],
    highlight: 'Transcrição de áudio (padrão do sistema)',
    // US$ 0.0001 por segundo = US$ 0.006 por minuto. `pricing` fica zerado
    // porque a interface exige as colunas de token, que aqui não se aplicam.
    audioPricing: { perMinute: 0.006 },
    pricing: { input: 0, output: 0 },
    contextWindow: 0,
    maxOutputTokens: 0,
  },
  {
    id: 'gpt-4o-mini-transcribe',
    gatewaySlug: 'openai/gpt-4o-mini-transcribe',
    name: 'GPT-4o mini Transcribe',
    provider: 'openai',
    purpose: 'stt',
    features: [],
    highlight: 'Transcrição alternativa da OpenAI',
    // Cobrado por TOKEN de áudio (US$ 1,25 por 1M), não por segundo — o valor
    // antigo aqui (US$ 0,000075/min) tratava o preço do token como preço do
    // segundo e saía 24× abaixo. Medido em 14/10/2026 pelo custo que o
    // gateway devolveu em 110 áudios reais (49 min): US$ 0,0018 por minuto.
    audioPricing: { perMinute: 0.0018 },
    pricing: { input: 0, output: 0 },
    contextWindow: 0,
    maxOutputTokens: 0,
  },
  // Transcrição padrão desde 14/10/2026. Em 110 áudios reais de clientes
  // (49 min), julgados por um modelo que ouviu cada áudio: nota 9,2 contra
  // 7,4 do Whisper, erro que muda o sentido em 17% contra 45%, e 3,6× mais
  // barato. Só existe pelo Vercel AI Gateway.
  {
    id: 'mai-transcribe-2',
    gatewaySlug: 'microsoft/mai-transcribe-2',
    name: 'MAI-Transcribe 2',
    provider: 'microsoft',
    purpose: 'stt',
    features: [],
    highlight: 'Transcrição padrão: a mais fiel medida e a mais barata',
    // US$ 0,00002778 por segundo = US$ 0,0017 por minuto (catálogo do
    // gateway, conferido pelo custo cobrado nos 110 áudios).
    audioPricing: { perMinute: 0.0017 },
    pricing: { input: 0, output: 0 },
    contextWindow: 0,
    maxOutputTokens: 0,
  },
  {
    id: 'tts-1',
    gatewaySlug: 'openai/tts-1',
    name: 'TTS-1',
    provider: 'openai',
    purpose: 'tts',
    features: [],
    highlight: 'Voz sintetizada (padrão do sistema)',
    // US$ 0.000015 por caractere = US$ 0.015 por 1.000 caracteres.
    audioPricing: { per1kChars: 0.015 },
    pricing: { input: 0, output: 0 },
    contextWindow: 0,
    maxOutputTokens: 0,
  },
  {
    id: 'tts-1-hd',
    gatewaySlug: 'openai/tts-1-hd',
    name: 'TTS-1 HD',
    provider: 'openai',
    purpose: 'tts',
    features: [],
    highlight: 'Voz sintetizada em alta definição',
    // US$ 0.00003 por caractere = o DOBRO do TTS-1, e era cobrado igual.
    audioPricing: { per1kChars: 0.03 },
    pricing: { input: 0, output: 0 },
    contextWindow: 0,
    maxOutputTokens: 0,
  },

  // ═══════════════════════════════════════════════════════════════
  // Legados (deprecated — retrocompatibilidade)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: '2M tokens de contexto',
    pricing: { input: 1.25, output: 5.00 },
    contextWindow: 2_097_152,
    maxOutputTokens: 8_192,
    deprecated: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Rápido e eficiente',
    pricing: { input: 0.075, output: 0.30 },
    contextWindow: 1_000_000,
    maxOutputTokens: 8_192,
    deprecated: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    features: ['tools'],
    highlight: 'Legado',
    pricing: { input: 0.50, output: 1.50 },
    contextWindow: 32_768,
    maxOutputTokens: 4_096,
    deprecated: true,
  },
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Legado',
    pricing: { input: 2.00, output: 8.00 },
    contextWindow: 256_000,
    maxOutputTokens: 32_768,
    deprecated: true,
  },
  // gpt-5-turbo removido em 2026-05-17 — não existe na API OpenAI (era ID inventado/obsoleto).
  {
    id: 'claude-sonnet-4-20250514',
    gatewaySlug: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Legado',
    pricing: { input: 3.00, output: 15.00 },
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    deprecated: true,
  },
  {
    id: 'claude-opus-4-20250514',
    gatewaySlug: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    features: ['pdf', 'image', 'tools'],
    highlight: 'Legado',
    pricing: { input: 15.00, output: 75.00 },
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    deprecated: true,
  },
  // claude-3-5-sonnet-latest e claude-3-5-haiku-latest removidos em 2026-05-17
  // — IDs com sufixo `-latest` não são aceitos pela API atual da Anthropic.
  // ─── Verificação de conformidade ─────────────────────────────────────────
  // Peso aberto da OpenAI, treinado para ler uma política escrita em texto
  // livre e dar veredito — que é exatamente o formato do MessageGuard.
  //
  // Medido em 25/08/2026 sobre 80 atendimentos reais: 11 apontamentos com 36%
  // de alarme falso, contra 74% do gpt-4.1-mini e 97% do gemini-2.5-flash-lite
  // nos MESMOS dados — sendo o mais barato dos três. Fora da conta uma regra
  // mal escrita, fez 1 apontamento em 80 turnos: é um juiz quieto, que é o que
  // se quer num portão que bloqueia.
  //
  // `purpose: 'judge'` o mantém fora do seletor de agente: ele não atende
  // cliente. E SÓ existe pelo gateway — a API da OpenAI não serve peso aberto.
  {
    id: 'gpt-oss-safeguard-20b',
    gatewaySlug: 'openai/gpt-oss-safeguard-20b',
    name: 'GPT-OSS Safeguard 20B',
    provider: 'openai',
    purpose: 'judge',
    features: ['tools', 'reasoning'],
    highlight: 'Verificação de conformidade — o mais preciso e o mais barato (só via gateway)',
    pricing: { input: 0.07, output: 0.20 },
    contextWindow: 128_000,
    maxOutputTokens: 32_768,
  },
  {
    id: 'gpt-oss-safeguard-120b',
    gatewaySlug: 'openai/gpt-oss-safeguard-120b',
    name: 'GPT-OSS Safeguard 120B',
    provider: 'openai',
    purpose: 'judge',
    features: ['tools', 'reasoning'],
    highlight: 'Irmão maior do Safeguard 20B — mais caro, ainda não medido aqui',
    pricing: { input: 0.15, output: 0.60 },
    contextWindow: 128_000,
    maxOutputTokens: 32_768,
  },
];

/**
 * Modelo com que todo agente NOVO nasce (tela, assistente de criação, API e
 * MCP). Um lugar só: até 14/10/2026 eram três valores soltos, e a API criava
 * em `gpt-4.1` — 5× o preço do que a tela usava.
 */
export const DEFAULT_AGENT_MODEL = 'gpt-6-luna';

// ============================================================================
// AI MODEL HELPERS
// ============================================================================

/**
 * Modelos que podem atender um cliente — o que o seletor do agente oferece.
 *
 * Exclui o que não é conversa (`purpose` de julgamento, transcrição ou voz) e
 * os legados (`deprecated`). NÃO filtra por preço: desde 18/09/2026 quem
 * informa o custo é o selo de créditos ao lado de cada modelo, com o preço
 * REAL do app (ver `AiModelCreditPrice`). O filtro por custo estimado em
 * reais que existia aqui escondia 20 modelos do catálogo — entre eles 7 que
 * já estavam no sistema (gpt-5, gpt-4o, gpt-4.1, gpt-5.4, gemini-2.5-pro,
 * claude-sonnet-4.5, claude-opus-4.5) — e ninguém na tela sabia por quê.
 */
export function getAgentModels(): AIModelDefinition[] {
  return AI_MODELS.filter(
    (model) => !model.deprecated && (model.purpose === undefined || model.purpose === 'agent'),
  );
}

/**
 * Filtra modelos viáveis por custo estimado por atendimento.
 * Cenário fixo: 40K input + 2K output tokens.
 * Exclui modelos deprecated.
 *
 * @deprecated Para o seletor do agente use `getAgentModels()`: o custo agora
 * é mostrado em créditos por modelo, em vez de virar um corte invisível.
 * Continua aqui para quem quiser a estimativa em reais.
 */
export function getViableModels(
  maxCostBRL: number = 0.40,
  usdToBRL: number = 5.80
): AIModelDefinition[] {
  const INPUT_TOKENS = 40_000;
  const OUTPUT_TOKENS = 2_000;
  return AI_MODELS.filter(model => {
    if (model.deprecated) return false;
    // Só modelo de CONVERSA entra no seletor do agente. Julgamento não
    // conversa com cliente; transcrição e voz nem texto geram — e como o
    // preço deles não é por token, `pricing` é zero e eles passariam no
    // teste de custo abaixo sem essa guarda.
    if (model.purpose !== undefined && model.purpose !== 'agent') return false;
    const cost = (INPUT_TOKENS / 1_000_000 * model.pricing.input
                + OUTPUT_TOKENS / 1_000_000 * model.pricing.output) * usdToBRL;
    return cost <= maxCostBRL;
  });
}

/**
 * Resolve o AIProviderType a partir do model ID.
 * Retorna null se modelo não encontrado.
 */
export function getProviderFromModel(modelId: string): AIProviderType | null {
  const model = AI_MODELS.find(m => m.id === modelId);
  return model?.provider ?? null;
}

/**
 * Busca definição completa do modelo por ID.
 */
export function getModelDefinition(modelId: string): AIModelDefinition | undefined {
  return AI_MODELS.find(m => m.id === modelId);
}

/**
 * Verifica se um modelo suporta uma feature específica.
 *
 * Retorna `false` se o modelo não for encontrado no catálogo (fail-safe).
 * Útil para checar antes de enviar imagens/PDFs/reasoning para o modelo.
 *
 * @example
 *   modelSupports('gpt-4o-mini', 'image') // true
 *   modelSupports('deepseek-chat', 'image') // false
 */
export function modelSupports(modelId: string, feature: AIModelFeature): boolean {
  const def = getModelDefinition(modelId);
  return def?.features.includes(feature) ?? false;
}

/**
 * Slug deste modelo no Vercel AI Gateway, ou `undefined` quando o modelo
 * não existe lá.
 *
 * `undefined` NÃO é erro: significa "este modelo continua sendo servido pela
 * integração direta do provider de origem". O caller deve tratar isso como
 * fallback silencioso, nunca como falha.
 *
 * @example
 *   getGatewaySlug('gpt-4.1-mini')               // 'openai/gpt-4.1-mini'
 *   getGatewaySlug('claude-haiku-4-5-20251001')  // 'anthropic/claude-haiku-4.5'
 *   getGatewaySlug('deepseek-reasoner')          // undefined — só na API da DeepSeek
 */
export function getGatewaySlug(modelId: string): string | undefined {
  return getModelDefinition(modelId)?.gatewaySlug;
}

/**
 * `true` quando o modelo pode ser servido pelo Vercel AI Gateway.
 *
 * Atalho de leitura para decidir se vale tentar o transporte alternativo
 * antes de cair na integração direta do provider.
 */
export function isGatewayCapable(modelId: string): boolean {
  return getGatewaySlug(modelId) !== undefined;
}

/**
 * Id do catálogo a partir de qualquer forma do modelo — o próprio id ou o
 * slug do gateway.
 *
 * Existe por causa da cobrança. A tabela de preços por modelo é indexada
 * pelo **id** (`glm-5.3-flash`), mas quem chama pelo gateway conhece o
 * modelo pelo **slug** (`zai/glm-5.3-flash`). Sem converter, o preço por
 * modelo não casa e o débito cai no preço genérico da categoria — em
 * silêncio, porque preço genérico é um valor válido. Medido em produção
 * (18/09/2026): lançamentos de `zai/glm-5.3-flash` saíram a 10 créditos
 * quando a tabela dizia 21 para `glm-5.3-flash`.
 *
 * Desconhecido volta como veio: quem não está no catálogo continua sendo
 * gravado com o nome que o provedor usou, que é melhor que perder o dado.
 */
export function canonicalModelId(modelIdOrSlug: string): string {
  if (getModelDefinition(modelIdOrSlug)) return modelIdOrSlug;
  const porSlug = AI_MODELS.find((m) => m.gatewaySlug === modelIdOrSlug);
  return porSlug ? porSlug.id : modelIdOrSlug;
}
