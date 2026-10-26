import { ObjectId } from 'mongodb';
export interface SmtpConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
    from: string;
}
export interface SendGridConfig {
    apiKey: string;
    fromEmail: string;
    fromName?: string;
}
export interface WhatsAppConfig {
    whatsappBusinessAccountId: string;
    phoneNumberId: string;
    webhookToken?: string;
    /** Intent — escolha do usuário no onboarding via Embedded Signup. */
    mode?: 'standalone' | 'coexistence';
    /** Truth — mirror do GET /{wabaId}?fields=account_mode (Graph API). Source of truth pra runtime. */
    accountMode?: 'STANDALONE' | 'COEXISTENCE';
    /** ISO timestamp da última sincronização de accountMode com Meta. */
    accountModeUpdatedAt?: string;
    /** POST /{wabaId}/subscribed_apps executado com sucesso (recepção de webhooks habilitada). */
    webhookSubscribed?: boolean;
    /** ISO timestamp da última assinatura de webhook bem-sucedida. */
    webhookSubscribedAt?: string;
    /** POST /{phoneNumberId}/register executado com sucesso (número apto a enviar via Cloud API). Coexistência pula (número já registrado pelo Business App). */
    phoneRegistered?: boolean;
    /** ISO timestamp do registro do número. */
    phoneRegisteredAt?: string;
    /** Última falha do setup automático (webhook subscribe ou register). Limpo quando o passo sucede. */
    setupError?: string;
}
export interface FacebookMessengerConfig {
    pageId: string;
    appSecret: string;
    webhookToken?: string;
}
export interface TelegramConfig {
    botToken: string;
    webhookUrl?: string;
}
export interface TwilioSmsConfig {
    accountSid: string;
    authToken: string;
    fromNumber: string;
}
export interface WebhookConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    authentication?: {
        type: 'bearer' | 'basic' | 'api_key';
        token: string;
    };
}
export interface InstagramConfig {
    instagramBusinessAccountId: string;
    pageId: string;
    webhookToken?: string;
}
export interface LinkedInConfig {
    organizationId: string;
    clientId: string;
    clientSecret: string;
}
export interface TikTokConfig {
    businessAccountId: string;
    appId: string;
    appSecret: string;
}
export interface GmailConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    fromEmail: string;
}
export interface GatewayConfig {
    webhookPath?: string;
    timeout?: number;
    engine?: 'node' | 'go';
}
export interface GoogleCalendarConfig {
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
}
export interface FirebaseConfig {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    databaseUrl?: string;
}
export interface OneSignalConfig {
    appId: string;
    apiKey: string;
    userAuthKey?: string;
}
export interface ElevenLabsConfig {
    apiKey: string;
    defaultVoiceId?: string;
    modelId?: string;
}
export interface JetimobConfig {
    apiKey: string;
    syncInterval?: number;
}
export interface DwvConfig {
    token: string;
    syncInterval?: number;
}
export interface MetaConfig {
    appId: string;
    appSecret: string;
    configId?: string;
    /**
     * Habilita a oferta do modo Coexistência para os tenants. Quando true, o frontend
     * renderiza o picker (standalone vs coexistência) no WhatsAppBusinessForm. Quando
     * false (ou undefined), apenas standalone é ofertado.
     *
     * Não confundir com um configId separado — Meta usa o mesmo Login Config; a
     * diferença vem do `featureType` passado em runtime (`whatsapp_business_app_onboarding`
     * vs `whatsapp_embedded_signup`).
     */
    coexistenceEnabled?: boolean;
    graphApiVersion: string;
    systemUserAccessToken?: string;
}
export interface ResendConfig {
    apiKey: string;
    defaultRegion?: string;
    webhookSecret?: string;
    webhookId?: string;
}
export interface CohereIntegrationConfig {
    apiKey: string;
    /** Cohere Rerank model. Default: 'rerank-v3.5' */
    model?: string;
}
export type ProviderConfig = SmtpConfig | SendGridConfig | WhatsAppConfig | FacebookMessengerConfig | TelegramConfig | TwilioSmsConfig | WebhookConfig | InstagramConfig | LinkedInConfig | TikTokConfig | GmailConfig | GatewayConfig | GoogleCalendarConfig | FirebaseConfig | OneSignalConfig | ElevenLabsConfig | JetimobConfig | DwvConfig | MetaConfig | ResendConfig;
export interface ProviderCredentials {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    pageAccessToken?: string;
    apiKey?: string;
    apiSecret?: string;
    username?: string;
    password?: string;
    customAuth?: Record<string, unknown>;
}
/**
 * Rate limit source - where the limit came from
 */
export type RateLimitSource = 'default' | 'webhook' | 'manual' | 'api';
/**
 * WhatsApp Business API messaging tiers
 */
export type WhatsAppTier = 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';
/**
 * WhatsApp quality rating levels
 */
export type QualityRating = 'green' | 'yellow' | 'red';
/**
 * Provider rate limits configuration
 * Used to control message sending rates per provider/integration
 */
export interface ProviderRateLimits {
    messagesPerSecond: number;
    messagesPerMinute: number;
    messagesPerHour: number;
    messagesPerDay: number;
    conversationMinDelayMs?: number;
    conversationMessagesPerHour?: number;
    tier?: WhatsAppTier;
    qualityRating?: QualityRating;
    source: RateLimitSource;
    lastUpdated?: Date;
    errorCount?: number;
    lastErrorAt?: Date;
}
/**
 * Rate limit usage tracking (stored in Redis)
 */
export interface RateLimitUsage {
    integrationId: string;
    sentToday: number;
    sentThisHour: number;
    sentThisMinute: number;
    dailyLimit: number;
    remainingToday: number;
    resetAt: Date;
}
/**
 * Rate limit check result
 */
export interface RateLimitCheckResult {
    allowed: boolean;
    waitMs?: number;
    reason?: 'daily_limit_reached' | 'hourly_limit_reached' | 'minute_limit_reached' | 'second_limit_reached' | 'quality_rating_flagged' | 'minimum_delay_between_messages';
    currentUsage?: RateLimitUsage;
}
export declare enum ProviderId {
    EMAIL_SMTP = "email-smtp",
    EMAIL_SENDGRID = "email-sendgrid",
    EMAIL_SES = "email-ses",
    EMAIL_RESEND = "email-resend",
    GMAIL_API = "gmail-api",
    WHATSAPP_BUSINESS = "whatsapp-business",
    WHATSAPP_BUSINESS_NOTIFICATIONS = "whatsapp-business-notifications",
    FACEBOOK_MESSENGER = "facebook-messenger",
    TELEGRAM_BOT = "telegram-bot",
    SMS_TWILIO = "sms-twilio",
    PUSH_FIREBASE = "push-firebase",
    PUSH_ONESIGNAL = "push-onesignal",
    GATEWAY_WHATSAPP = "gateway-whatsapp",
    GEO_MAXMIND = "geo-maxmind",
    INSTAGRAM_MESSAGING = "instagram-messaging",
    LINKEDIN_MESSAGING = "linkedin-messaging",
    TIKTOK_MESSAGING = "tiktok-messaging",
    TIKTOK_BUSINESS = "tiktok-business",
    PAYMENT_ASAAS = "payment-asaas",
    PAYMENT_STRIPE = "payment-stripe",
    PAYMENT_PAYPAL = "payment-paypal",
    PAYMENT_MERCADOPAGO = "payment-mercadopago",
    GOOGLE_CALENDAR = "google-calendar",
    OUTLOOK_CALENDAR = "outlook-calendar",
    ICLOUD_CALENDAR = "icloud-calendar",
    WEBSITE_CHAT = "website-chat",
    WEBSITE_WIDGET = "website-widget",
    API_WEBHOOK = "api-webhook",
    AI_OPENAI = "ai-openai",
    AI_ANTHROPIC = "ai-anthropic",
    AI_XAI = "ai-xai",
    AI_GOOGLE = "ai-google",
    AI_MISTRAL = "ai-mistral",
    AI_DEEPSEEK = "ai-deepseek",
    /**
     * Z.ai (GLM) — hoje sem provider direto registrado no backend (sem entry
     * no ProviderRegistry, de propósito): os modelos GLM chegam SÓ pelo
     * AI_VERCEL_GATEWAY. O id existe para o `AIProviderType 'zai'` ter um
     * ProviderId no mapa do ModelResolverService, como mistral/xai.
     */
    AI_ZAI = "ai-zai",
    /**
     * Fabricantes servidos SÓ pelo Vercel AI Gateway (18/09/2026), mesmo
     * desenho do `AI_ZAI` acima: sem entry no ProviderRegistry de propósito —
     * não há integração direta para cadastrar no admin. O id existe para o
     * `AIProviderType` correspondente ter um ProviderId nos mapas do
     * `ModelResolverService`.
     */
    AI_MOONSHOTAI = "ai-moonshotai",
    AI_ALIBABA = "ai-alibaba",
    AI_MINIMAX = "ai-minimax",
    AI_META = "ai-meta",
    /** Microsoft (14/10/2026) — só a transcrição MAI-Transcribe 2, pelo gateway. */
    AI_MICROSOFT = "ai-microsoft",
    AI_ELEVENLABS = "ai-elevenlabs",
    AI_COHERE = "ai-cohere",
    /**
     * Vercel AI Gateway — **transporte**, não origem de modelo.
     *
     * Serve modelos de vários providers (OpenAI, Anthropic, Google, DeepSeek…)
     * por um endpoint único com uma chave só. O campo `provider` de cada
     * modelo em `AI_MODELS` continua sendo a ORIGEM (`openai`, `google`…) —
     * o gateway só troca por onde a chamada passa.
     *
     * Cobre apenas geração de texto e embeddings. **Nunca** declarar
     * capabilities de áudio (STT/TTS) ou rerank aqui: elas são resolvidas por
     * capability e o gateway sequestraria o Whisper e o Cohere.
     */
    AI_VERCEL_GATEWAY = "ai-vercel-gateway",
    DATABASE_JETIMOB = "database-jetimob",
    DATABASE_DWV = "database-dwv",
    DATABASE_KENLO = "database-kenlo",
    VIEWS_BEST_FLOW = "views-best-flow",
    VIEWS_GOOGLE_ANALYTICS = "views-google-analytics",
    VIEWS_TROIA_TRACKER = "views-troia-tracker",
    VIEWS_API = "views-api",
    VECTOR_PINECONE = "vector-pinecone",
    META = "meta"
}
export type ProviderCategory = 'email' | 'messaging' | 'social' | 'payment' | 'calendar' | 'web' | 'ai' | 'database' | 'vector' | 'meta' | 'geo' | 'views';
export declare const PROVIDER_CATEGORY: Record<ProviderId, ProviderCategory>;
/** Check if a providerId belongs to a given category */
export declare const isProviderCategory: (providerId: string | null | undefined, category: ProviderCategory) => boolean;
/**
 * Providers da Meta que aplicam a política de janela de 24h.
 *
 * NÃO inclui `whatsapp-business-notifications` (canal de 2FA/notificações, não
 * é canal de conversa) nem `gateway-whatsapp` (Baileys, não é API oficial).
 */
export declare const OFFICIAL_META_MESSAGING_PROVIDERS: readonly [ProviderId.WHATSAPP_BUSINESS, ProviderId.INSTAGRAM_MESSAGING, ProviderId.FACEBOOK_MESSENGER];
export type OfficialMetaMessagingProvider = typeof OFFICIAL_META_MESSAGING_PROVIDERS[number];
/** Duração da janela de atendimento da Meta, em horas. */
export declare const MESSAGING_WINDOW_HOURS = 24;
/** Antecedência com que o chat avisa que a janela vai fechar, em horas. */
export declare const MESSAGING_WINDOW_WARNING_HOURS = 2;
/**
 * Valor de `code` na response de erro quando o envio é recusado por janela fechada.
 *
 * TEM que ser idêntico ao nome da classe `MessagingWindowClosedError` no backend:
 * o errorHandler devolve `code: error.name`. Renomear a classe sem atualizar esta
 * constante quebra o frontend em silêncio.
 */
export declare const MESSAGING_WINDOW_CLOSED_CODE = "MessagingWindowClosedError";
/** `code` devolvido pela API quando o envio é recusado por contato bloqueado. */
export declare const CONTACT_BLOCKED_CODE = "ContactBlockedError";
/**
 * `ConversationMessage.failedCode` — WhatsApp Cloud API "Re-engagement message"
 * (código real do Graph). Fonte: developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes.
 *
 * Movido de `TROIA-V3-BACKEND/src/shared/messaging-window/errors.ts` pra
 * `@troia-v3/types` (review 2026-07-27, item "CORRIGIR LOGO DEPOIS" — o
 * frontend duplicava os dois valores à mão em `useMessagingWindow.ts` com um
 * comentário dizendo "espelha o backend"; a §5.1 da spec já tinha movido as
 * outras constantes de janela pra types justamente pra evitar esse drift).
 * O backend continua exportando o MESMO nome via `shared/messaging-window/errors.ts`
 * (re-export) — nenhum call site precisou mudar.
 */
export declare const WHATSAPP_WINDOW_CODE = 131047;
/**
 * `ConversationMessage.failedCode` — sentinela (NÃO é código real do Graph)
 * usada quando a falha é "janela fechada" num canal `reopenWith: 'customer_only'`
 * (Instagram ou Messenger) e o call site só tem o `reopenWith` em mãos, sem
 * saber qual dos dois canais originou o erro. Deliberadamente negativa —
 * nenhum código real do Graph é negativo. Ver `WHATSAPP_WINDOW_CODE` acima
 * pro contexto da migração pra `@troia-v3/types`.
 */
export declare const META_WINDOW_CLOSED_CUSTOMER_ONLY_CODE = -1;
/**
 * Conveniência pros dois consumidores que só precisam checar membership
 * (`ConversationMessage.failedCode` pertence a "janela fechada"?) — backend
 * (`shared/messaging-window/errors.ts` → `isMetaWindowError`) e frontend
 * (`useMessagingWindow.ts` → `META_WINDOW_CODES`, `ChatMessage.tsx`).
 */
export declare const META_WINDOW_CLOSED_FAILED_CODES: readonly [131047, -1];
/** Type guard aceitando string crua (o providerId chega como string do Mongo). */
export declare const isOfficialMetaMessagingProvider: (providerId: string | null | undefined) => providerId is OfficialMetaMessagingProvider;
export declare enum ProviderCapability {
    SEND_EMAIL = "send_email",
    RECEIVE_EMAIL = "receive_email",
    SEND_MESSAGE = "send_message",
    RECEIVE_MESSAGE = "receive_message",
    SEND_MEDIA = "send_media",
    RECEIVE_MEDIA = "receive_media",
    SEND_LOCATION = "send_location",
    SEND_CONTACT = "send_contact",
    SEND_REACTION = "send_reaction",
    SEND_ATTACHMENT = "send_attachment",
    RECEIVE_ATTACHMENT = "receive_attachment",
    SEND_SMS = "send_sms",
    SEND_PUSH = "send_push",
    /**
     * Marca a integração como remetente de códigos 2FA/verificação do SISTEMA
     * (app-level, não company). Não-exclusiva: várias integrações podem carregá-la
     * e a cascata do SystemWhatsAppService ordena por preferência de provider
     * (whatsapp-business > gateway-whatsapp).
     */
    SEND_2FA = "send_2fa",
    /**
     * Marca a integração como remetente de notificações de sistema (template
     * UTILITY genérico) via WhatsApp Oficial (Sistema). Independente de
     * SEND_2FA — viabilidade é resolvida por-capability (template próprio,
     * `config.templates.notification`).
     */
    SEND_NOTIFICATION = "send_notification",
    /**
     * Resolve IP → localização aproximada (país/região/cidade). Enriquece
     * dispositivos de operadores (`users.devices[]`) e de contatos
     * (`contact-devices`). Trocar de provedor é reconfigurar a integração no
     * admin — nada muda no app.
     */
    GEO_LOOKUP = "geo_lookup",
    /**
     * Busca contagem de visitantes de uma fonte externa (contador de fluxo por
     * câmera, Google Analytics, etc). É o que o worker de views usa para
     * selecionar quais integrações sincronizar — deliberadamente separado de
     * `SYNC_DATA`, que arrasta a integração para o `IntegrationSyncScheduler`
     * genérico, onde o `switch` cai no `default:` e marca `lastSyncAt` sem ter
     * feito nada. Ver `@DOCS/modules/VIEWS.md`.
     */
    FETCH_VISITOR_COUNT = "fetch_visitor_count",
    CREATE_POST = "create_post",
    CREATE_STORY = "create_story",
    CREATE_CAMPAIGN = "create_campaign",
    CREATE_EVENT = "create_event",
    CREATE_TEMPLATE = "create_template",
    TRACK_DELIVERY = "track_delivery",
    TRACK_OPENS = "track_opens",
    TRACK_CLICKS = "track_clicks",
    SCHEDULE_MESSAGE = "schedule_message",
    CALENDAR_SYNC = "calendar_sync",
    CALENDAR_READ = "calendar_read",
    CALENDAR_WRITE = "calendar_write",
    SYNC_DATA = "sync_data",// ✅ Provider supports data synchronization
    PROCESS_PAYMENT = "process_payment",
    PROCESS_SUBSCRIPTION = "process_subscription",
    TOKENIZE_CARD = "tokenize_card",
    REFUND_PAYMENT = "refund_payment",
    CANCEL_SUBSCRIPTION = "cancel_subscription",
    CREATE_CONTACT = "create_contact",
    UPDATE_CONTACT = "update_contact",
    CREATE_LIST = "create_list",
    SEND_BULK = "send_bulk",
    BULK_SEND = "bulk_send",
    CREATE_WEBHOOK = "create_webhook",
    RECEIVE_WEBHOOK = "receive_webhook",
    VERIFY_WEBHOOK = "verify_webhook",
    SEND_WEBHOOK = "send_webhook",
    CREATE_FORM = "create_form",
    SUBMIT_FORM = "submit_form",
    CREATE_SURVEY = "create_survey",
    RECEIVE_FORM = "receive_form",
    CREATE_WIDGET = "create_widget",
    TRACK_VISITOR = "track_visitor",
    LIVE_CHAT = "live_chat",
    REST_API = "rest_api",
    GRAPHQL = "graphql",
    GET_INSIGHTS = "get_insights",
    GET_AUDIENCE = "get_audience",
    TRACK_OPEN = "track_open",
    CREATE_BOT = "create_bot",
    MANAGE_PAGE = "manage_page",
    MANAGE_ACCOUNT = "manage_account",
    GENERATE_EMBEDDING = "generate_embedding",
    RERANK = "rerank",
    VECTOR_STORAGE = "vector_storage",
    AI_TEXT_GENERATION = "ai_text_generation",// LLM text generation (GPT, Claude, etc.)
    AI_CHAT_COMPLETION = "ai_chat_completion",// Chat completion with conversation history
    AI_INTERNAL_JUDGE = "ai_internal_judge",// LlmJudgeService (10 evaluators), quality-test, ab-test — dão NOTA 0-1
    /**
     * Verificação de conformidade da mensagem ANTES de enviar (MessageGuard:
     * regras baseline + rubrica do agente; regra semântica de pré-condição de
     * tool).
     *
     * Separada de `AI_INTERNAL_JUDGE` em 25/08/2026 porque são tarefas
     * diferentes e o melhor modelo de cada uma é outro. Medido sobre os mesmos
     * dados: aqui a saída é **veredito binário** (violou ou não), e o
     * `gpt-oss-safeguard-20b` — treinado exatamente para ler política e dar
     * veredito — teve 36% de alarme falso contra 74% do `gpt-4.1-mini` e 97%
     * do `gemini-2.5-flash-lite`, sendo o mais barato dos três. Já nos
     * evaluators, que pedem NOTA de 0 a 1, o mesmo Safeguard **não devolveu
     * nota** e levou 9 segundos: ele é classificador, não pontuador.
     *
     * Ausente ⇒ cai em `AI_INTERNAL_JUDGE` (retrocompatível).
     */
    AI_INTERNAL_COMPLIANCE = "ai_internal_compliance",
    AI_INTERNAL_PROCESSING = "ai_internal_processing",// narration-cleaner, summarizer, wizard draft, workflow modifier; fallback do lead import
    AI_INTERNAL_ANALYTICS = "ai_internal_analytics",// gap classifier/resolution, insights, topic-tagger, prompt coach/migration/rewriter, training
    AI_INTERNAL_IMPORTING = "ai_internal_importing",// lead import (mapeamento de colunas CSV + extração por lotes); ausente → fallback AI_INTERNAL_PROCESSING
    TEXT_TO_SPEECH = "text_to_speech",// Convert text to audio (TTS)
    SPEECH_TO_TEXT = "speech_to_text",// Convert audio to text (STT/Whisper)
    TEMPLATE_MANAGEMENT = "template_management",// Submit, approve, manage templates
    FETCH_PROPERTIES = "fetch_properties",// Fetch properties from external system
    SYNC_PROPERTIES = "sync_properties",// Sync properties bidirectionally
    CREATE_PROPERTY = "create_property",// Create property in external system
    UPDATE_PROPERTY = "update_property",// Update property in external system
    DELETE_PROPERTY = "delete_property",// Delete property from external system
    SOCIAL_LOGIN = "social_login",// OAuth social login (Facebook, Instagram)
    WHATSAPP_EMBEDDED_SIGNUP = "whatsapp_embedded_signup",// WhatsApp Business Embedded Signup flow
    VOICE_CLONING = "voice_cloning",// Clone custom voices (ElevenLabs, etc.)
    BATCH_SEND = "batch_send",// Send emails/messages in batch
    DOMAIN_MANAGEMENT = "domain_management"
}
export interface BaseIntegrationRequest {
    name: string;
    description?: string;
}
export interface CreateSmtpIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.EMAIL_SMTP;
    config: SmtpConfig;
    credentials?: ProviderCredentials;
}
export interface CreateSendGridIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.EMAIL_SENDGRID;
    config: SendGridConfig;
    credentials?: ProviderCredentials;
}
export interface CreateWhatsAppIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.WHATSAPP_BUSINESS;
    config: WhatsAppConfig;
    credentials: ProviderCredentials;
}
export interface CreateFacebookMessengerIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.FACEBOOK_MESSENGER;
    config: FacebookMessengerConfig;
    credentials: ProviderCredentials;
}
export interface CreateTelegramIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.TELEGRAM_BOT;
    config: TelegramConfig;
    credentials?: ProviderCredentials;
}
export interface CreateWebhookIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.API_WEBHOOK;
    config: WebhookConfig;
    credentials?: ProviderCredentials;
}
export interface CreateGatewayIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.GATEWAY_WHATSAPP;
    config: GatewayConfig;
    credentials?: ProviderCredentials;
}
export interface CreateGoogleCalendarIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.GOOGLE_CALENDAR;
    config: GoogleCalendarConfig;
    credentials?: ProviderCredentials;
}
export interface CreateMetaIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.META;
    config: MetaConfig;
    credentials?: ProviderCredentials;
}
export interface CreateResendIntegrationRequest extends BaseIntegrationRequest {
    providerId: ProviderId.EMAIL_RESEND;
    config: ResendConfig;
    credentials?: ProviderCredentials;
}
export type CreateProviderIntegrationRequest = CreateSmtpIntegrationRequest | CreateSendGridIntegrationRequest | CreateWhatsAppIntegrationRequest | CreateFacebookMessengerIntegrationRequest | CreateTelegramIntegrationRequest | CreateWebhookIntegrationRequest | CreateGatewayIntegrationRequest | CreateGoogleCalendarIntegrationRequest | CreateMetaIntegrationRequest | CreateResendIntegrationRequest;
export interface Provider {
    _id?: ObjectId;
    name: string;
    type: string;
    category: 'messaging' | 'payment' | 'email' | 'calendar' | 'storage' | 'social';
    capabilities: ProviderCapability[];
    syncInterval?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export interface ProviderResponse extends Omit<Provider, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    id: string;
    syncInterval?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}
export interface GenericProviderConfig {
    [key: string]: unknown;
}
export interface VectorMetadata {
    appId: string;
    companyId: string;
    resourceType: 'conversation-message-chunk' | 'database-document';
    resourceId: string;
}
export interface VectorSearchResult {
    id: string;
    score: number;
    metadata: VectorMetadata;
}
export interface VectorFilter {
    appId: string;
    companyId: string;
    resourceType?: 'conversation-message-chunk' | 'database-document';
}
