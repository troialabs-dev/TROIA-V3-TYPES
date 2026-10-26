/**
 * Supported AI providers for agent execution
 * These are the providers that support AI_TEXT_GENERATION and AI_CHAT_COMPLETION capabilities
 */
export type AIProviderType = 'openai' | 'anthropic' | 'xai' | 'google' | 'mistral' | 'deepseek' | 'zai' | 'moonshotai' | 'alibaba' | 'minimax' | 'meta' | 'microsoft';
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
export type AIProviderConfig = OpenAIConfig | AnthropicConfig | CohereConfig | HuggingFaceConfig;
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
export declare const AI_MODELS: AIModelDefinition[];
/**
 * Modelo com que todo agente NOVO nasce (tela, assistente de criação, API e
 * MCP). Um lugar só: até 14/10/2026 eram três valores soltos, e a API criava
 * em `gpt-4.1` — 5× o preço do que a tela usava.
 */
export declare const DEFAULT_AGENT_MODEL = "gpt-6-luna";
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
export declare function getAgentModels(): AIModelDefinition[];
/**
 * Filtra modelos viáveis por custo estimado por atendimento.
 * Cenário fixo: 40K input + 2K output tokens.
 * Exclui modelos deprecated.
 *
 * @deprecated Para o seletor do agente use `getAgentModels()`: o custo agora
 * é mostrado em créditos por modelo, em vez de virar um corte invisível.
 * Continua aqui para quem quiser a estimativa em reais.
 */
export declare function getViableModels(maxCostBRL?: number, usdToBRL?: number): AIModelDefinition[];
/**
 * Resolve o AIProviderType a partir do model ID.
 * Retorna null se modelo não encontrado.
 */
export declare function getProviderFromModel(modelId: string): AIProviderType | null;
/**
 * Busca definição completa do modelo por ID.
 */
export declare function getModelDefinition(modelId: string): AIModelDefinition | undefined;
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
export declare function modelSupports(modelId: string, feature: AIModelFeature): boolean;
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
export declare function getGatewaySlug(modelId: string): string | undefined;
/**
 * `true` quando o modelo pode ser servido pelo Vercel AI Gateway.
 *
 * Atalho de leitura para decidir se vale tentar o transporte alternativo
 * antes de cair na integração direta do provider.
 */
export declare function isGatewayCapable(modelId: string): boolean;
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
export declare function canonicalModelId(modelIdOrSlug: string): string;
