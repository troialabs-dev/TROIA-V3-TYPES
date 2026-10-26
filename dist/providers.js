"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderCapability = exports.isOfficialMetaMessagingProvider = exports.META_WINDOW_CLOSED_FAILED_CODES = exports.META_WINDOW_CLOSED_CUSTOMER_ONLY_CODE = exports.WHATSAPP_WINDOW_CODE = exports.CONTACT_BLOCKED_CODE = exports.MESSAGING_WINDOW_CLOSED_CODE = exports.MESSAGING_WINDOW_WARNING_HOURS = exports.MESSAGING_WINDOW_HOURS = exports.OFFICIAL_META_MESSAGING_PROVIDERS = exports.isProviderCategory = exports.PROVIDER_CATEGORY = exports.ProviderId = void 0;
// ============================================================================
// PROVIDER ENUM (Centralized)
// ============================================================================
var ProviderId;
(function (ProviderId) {
    // Email Providers
    ProviderId["EMAIL_SMTP"] = "email-smtp";
    ProviderId["EMAIL_SENDGRID"] = "email-sendgrid";
    ProviderId["EMAIL_SES"] = "email-ses";
    ProviderId["EMAIL_RESEND"] = "email-resend";
    ProviderId["GMAIL_API"] = "gmail-api";
    // Messaging Providers
    ProviderId["WHATSAPP_BUSINESS"] = "whatsapp-business";
    ProviderId["WHATSAPP_BUSINESS_NOTIFICATIONS"] = "whatsapp-business-notifications";
    ProviderId["FACEBOOK_MESSENGER"] = "facebook-messenger";
    ProviderId["TELEGRAM_BOT"] = "telegram-bot";
    ProviderId["SMS_TWILIO"] = "sms-twilio";
    ProviderId["PUSH_FIREBASE"] = "push-firebase";
    ProviderId["PUSH_ONESIGNAL"] = "push-onesignal";
    ProviderId["GATEWAY_WHATSAPP"] = "gateway-whatsapp";
    // Geo Providers (IP → localização aproximada)
    ProviderId["GEO_MAXMIND"] = "geo-maxmind";
    // Social Media Providers
    ProviderId["INSTAGRAM_MESSAGING"] = "instagram-messaging";
    ProviderId["LINKEDIN_MESSAGING"] = "linkedin-messaging";
    ProviderId["TIKTOK_MESSAGING"] = "tiktok-messaging";
    ProviderId["TIKTOK_BUSINESS"] = "tiktok-business";
    // Payment Providers
    ProviderId["PAYMENT_ASAAS"] = "payment-asaas";
    ProviderId["PAYMENT_STRIPE"] = "payment-stripe";
    ProviderId["PAYMENT_PAYPAL"] = "payment-paypal";
    ProviderId["PAYMENT_MERCADOPAGO"] = "payment-mercadopago";
    // Calendar Providers
    ProviderId["GOOGLE_CALENDAR"] = "google-calendar";
    ProviderId["OUTLOOK_CALENDAR"] = "outlook-calendar";
    ProviderId["ICLOUD_CALENDAR"] = "icloud-calendar";
    // Web/API Providers
    ProviderId["WEBSITE_CHAT"] = "website-chat";
    ProviderId["WEBSITE_WIDGET"] = "website-widget";
    ProviderId["API_WEBHOOK"] = "api-webhook";
    // AI Providers
    ProviderId["AI_OPENAI"] = "ai-openai";
    ProviderId["AI_ANTHROPIC"] = "ai-anthropic";
    ProviderId["AI_XAI"] = "ai-xai";
    ProviderId["AI_GOOGLE"] = "ai-google";
    ProviderId["AI_MISTRAL"] = "ai-mistral";
    ProviderId["AI_DEEPSEEK"] = "ai-deepseek";
    /**
     * Z.ai (GLM) — hoje sem provider direto registrado no backend (sem entry
     * no ProviderRegistry, de propósito): os modelos GLM chegam SÓ pelo
     * AI_VERCEL_GATEWAY. O id existe para o `AIProviderType 'zai'` ter um
     * ProviderId no mapa do ModelResolverService, como mistral/xai.
     */
    ProviderId["AI_ZAI"] = "ai-zai";
    /**
     * Fabricantes servidos SÓ pelo Vercel AI Gateway (18/09/2026), mesmo
     * desenho do `AI_ZAI` acima: sem entry no ProviderRegistry de propósito —
     * não há integração direta para cadastrar no admin. O id existe para o
     * `AIProviderType` correspondente ter um ProviderId nos mapas do
     * `ModelResolverService`.
     */
    ProviderId["AI_MOONSHOTAI"] = "ai-moonshotai";
    ProviderId["AI_ALIBABA"] = "ai-alibaba";
    ProviderId["AI_MINIMAX"] = "ai-minimax";
    ProviderId["AI_META"] = "ai-meta";
    /** Microsoft (14/10/2026) — só a transcrição MAI-Transcribe 2, pelo gateway. */
    ProviderId["AI_MICROSOFT"] = "ai-microsoft";
    ProviderId["AI_ELEVENLABS"] = "ai-elevenlabs";
    ProviderId["AI_COHERE"] = "ai-cohere";
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
    ProviderId["AI_VERCEL_GATEWAY"] = "ai-vercel-gateway";
    // Database Providers (Properties, Real Estate, etc.)
    ProviderId["DATABASE_JETIMOB"] = "database-jetimob";
    ProviderId["DATABASE_DWV"] = "database-dwv";
    ProviderId["DATABASE_KENLO"] = "database-kenlo";
    // Views Providers (contadores de visitantes / analytics de tráfego)
    ProviderId["VIEWS_BEST_FLOW"] = "views-best-flow";
    ProviderId["VIEWS_GOOGLE_ANALYTICS"] = "views-google-analytics";
    ProviderId["VIEWS_TROIA_TRACKER"] = "views-troia-tracker";
    ProviderId["VIEWS_API"] = "views-api";
    // Vector Storage Providers
    ProviderId["VECTOR_PINECONE"] = "vector-pinecone";
    // Meta Platform (Unified Meta services)
    ProviderId["META"] = "meta";
})(ProviderId || (exports.ProviderId = ProviderId = {}));
exports.PROVIDER_CATEGORY = {
    // Email
    [ProviderId.EMAIL_SMTP]: 'email',
    [ProviderId.EMAIL_SENDGRID]: 'email',
    [ProviderId.EMAIL_SES]: 'email',
    [ProviderId.EMAIL_RESEND]: 'email',
    [ProviderId.GMAIL_API]: 'email',
    // Messaging
    [ProviderId.WHATSAPP_BUSINESS]: 'messaging',
    [ProviderId.WHATSAPP_BUSINESS_NOTIFICATIONS]: 'messaging',
    [ProviderId.FACEBOOK_MESSENGER]: 'messaging',
    [ProviderId.TELEGRAM_BOT]: 'messaging',
    [ProviderId.SMS_TWILIO]: 'messaging',
    [ProviderId.PUSH_FIREBASE]: 'messaging',
    [ProviderId.PUSH_ONESIGNAL]: 'messaging',
    [ProviderId.GATEWAY_WHATSAPP]: 'messaging',
    // Geo (IP → localização aproximada)
    [ProviderId.GEO_MAXMIND]: 'geo',
    // Social
    [ProviderId.INSTAGRAM_MESSAGING]: 'social',
    [ProviderId.LINKEDIN_MESSAGING]: 'social',
    [ProviderId.TIKTOK_MESSAGING]: 'social',
    [ProviderId.TIKTOK_BUSINESS]: 'social',
    // Payment
    [ProviderId.PAYMENT_ASAAS]: 'payment',
    [ProviderId.PAYMENT_STRIPE]: 'payment',
    [ProviderId.PAYMENT_PAYPAL]: 'payment',
    [ProviderId.PAYMENT_MERCADOPAGO]: 'payment',
    // Calendar
    [ProviderId.GOOGLE_CALENDAR]: 'calendar',
    [ProviderId.OUTLOOK_CALENDAR]: 'calendar',
    [ProviderId.ICLOUD_CALENDAR]: 'calendar',
    // Web/API
    [ProviderId.WEBSITE_CHAT]: 'web',
    [ProviderId.WEBSITE_WIDGET]: 'web',
    [ProviderId.API_WEBHOOK]: 'web',
    // AI
    [ProviderId.AI_OPENAI]: 'ai',
    [ProviderId.AI_ANTHROPIC]: 'ai',
    [ProviderId.AI_XAI]: 'ai',
    [ProviderId.AI_GOOGLE]: 'ai',
    [ProviderId.AI_MISTRAL]: 'ai',
    [ProviderId.AI_DEEPSEEK]: 'ai',
    [ProviderId.AI_ZAI]: 'ai',
    [ProviderId.AI_MOONSHOTAI]: 'ai',
    [ProviderId.AI_ALIBABA]: 'ai',
    [ProviderId.AI_MINIMAX]: 'ai',
    [ProviderId.AI_META]: 'ai',
    [ProviderId.AI_MICROSOFT]: 'ai',
    [ProviderId.AI_ELEVENLABS]: 'ai',
    [ProviderId.AI_COHERE]: 'ai',
    [ProviderId.AI_VERCEL_GATEWAY]: 'ai',
    // Database
    [ProviderId.DATABASE_JETIMOB]: 'database',
    [ProviderId.DATABASE_DWV]: 'database',
    [ProviderId.DATABASE_KENLO]: 'database',
    // Views (contadores de visitantes)
    [ProviderId.VIEWS_BEST_FLOW]: 'views',
    [ProviderId.VIEWS_GOOGLE_ANALYTICS]: 'views',
    [ProviderId.VIEWS_TROIA_TRACKER]: 'views',
    [ProviderId.VIEWS_API]: 'views',
    // Vector
    [ProviderId.VECTOR_PINECONE]: 'vector',
    // Meta
    [ProviderId.META]: 'meta',
};
/** Check if a providerId belongs to a given category */
const isProviderCategory = (providerId, category) => {
    if (!providerId)
        return false;
    return exports.PROVIDER_CATEGORY[providerId] === category;
};
exports.isProviderCategory = isProviderCategory;
// ============================================================================
// META MESSAGING WINDOW
// ============================================================================
/**
 * Providers da Meta que aplicam a política de janela de 24h.
 *
 * NÃO inclui `whatsapp-business-notifications` (canal de 2FA/notificações, não
 * é canal de conversa) nem `gateway-whatsapp` (Baileys, não é API oficial).
 */
exports.OFFICIAL_META_MESSAGING_PROVIDERS = [
    ProviderId.WHATSAPP_BUSINESS,
    ProviderId.INSTAGRAM_MESSAGING,
    ProviderId.FACEBOOK_MESSENGER,
];
/** Duração da janela de atendimento da Meta, em horas. */
exports.MESSAGING_WINDOW_HOURS = 24;
/** Antecedência com que o chat avisa que a janela vai fechar, em horas. */
exports.MESSAGING_WINDOW_WARNING_HOURS = 2;
/**
 * Valor de `code` na response de erro quando o envio é recusado por janela fechada.
 *
 * TEM que ser idêntico ao nome da classe `MessagingWindowClosedError` no backend:
 * o errorHandler devolve `code: error.name`. Renomear a classe sem atualizar esta
 * constante quebra o frontend em silêncio.
 */
exports.MESSAGING_WINDOW_CLOSED_CODE = 'MessagingWindowClosedError';
/** `code` devolvido pela API quando o envio é recusado por contato bloqueado. */
exports.CONTACT_BLOCKED_CODE = 'ContactBlockedError';
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
exports.WHATSAPP_WINDOW_CODE = 131047;
/**
 * `ConversationMessage.failedCode` — sentinela (NÃO é código real do Graph)
 * usada quando a falha é "janela fechada" num canal `reopenWith: 'customer_only'`
 * (Instagram ou Messenger) e o call site só tem o `reopenWith` em mãos, sem
 * saber qual dos dois canais originou o erro. Deliberadamente negativa —
 * nenhum código real do Graph é negativo. Ver `WHATSAPP_WINDOW_CODE` acima
 * pro contexto da migração pra `@troia-v3/types`.
 */
exports.META_WINDOW_CLOSED_CUSTOMER_ONLY_CODE = -1;
/**
 * Conveniência pros dois consumidores que só precisam checar membership
 * (`ConversationMessage.failedCode` pertence a "janela fechada"?) — backend
 * (`shared/messaging-window/errors.ts` → `isMetaWindowError`) e frontend
 * (`useMessagingWindow.ts` → `META_WINDOW_CODES`, `ChatMessage.tsx`).
 */
exports.META_WINDOW_CLOSED_FAILED_CODES = [exports.WHATSAPP_WINDOW_CODE, exports.META_WINDOW_CLOSED_CUSTOMER_ONLY_CODE];
/** Type guard aceitando string crua (o providerId chega como string do Mongo). */
const isOfficialMetaMessagingProvider = (providerId) => typeof providerId === 'string' &&
    exports.OFFICIAL_META_MESSAGING_PROVIDERS.includes(providerId);
exports.isOfficialMetaMessagingProvider = isOfficialMetaMessagingProvider;
// ============================================================================
// PROVIDER CAPABILITIES (Centralized)
// ============================================================================
var ProviderCapability;
(function (ProviderCapability) {
    // Email capabilities
    ProviderCapability["SEND_EMAIL"] = "send_email";
    ProviderCapability["RECEIVE_EMAIL"] = "receive_email";
    // Messaging capabilities
    ProviderCapability["SEND_MESSAGE"] = "send_message";
    ProviderCapability["RECEIVE_MESSAGE"] = "receive_message";
    ProviderCapability["SEND_MEDIA"] = "send_media";
    ProviderCapability["RECEIVE_MEDIA"] = "receive_media";
    ProviderCapability["SEND_LOCATION"] = "send_location";
    ProviderCapability["SEND_CONTACT"] = "send_contact";
    ProviderCapability["SEND_REACTION"] = "send_reaction";
    ProviderCapability["SEND_ATTACHMENT"] = "send_attachment";
    ProviderCapability["RECEIVE_ATTACHMENT"] = "receive_attachment";
    // Notification capabilities
    ProviderCapability["SEND_SMS"] = "send_sms";
    ProviderCapability["SEND_PUSH"] = "send_push";
    /**
     * Marca a integração como remetente de códigos 2FA/verificação do SISTEMA
     * (app-level, não company). Não-exclusiva: várias integrações podem carregá-la
     * e a cascata do SystemWhatsAppService ordena por preferência de provider
     * (whatsapp-business > gateway-whatsapp).
     */
    ProviderCapability["SEND_2FA"] = "send_2fa";
    /**
     * Marca a integração como remetente de notificações de sistema (template
     * UTILITY genérico) via WhatsApp Oficial (Sistema). Independente de
     * SEND_2FA — viabilidade é resolvida por-capability (template próprio,
     * `config.templates.notification`).
     */
    ProviderCapability["SEND_NOTIFICATION"] = "send_notification";
    /**
     * Resolve IP → localização aproximada (país/região/cidade). Enriquece
     * dispositivos de operadores (`users.devices[]`) e de contatos
     * (`contact-devices`). Trocar de provedor é reconfigurar a integração no
     * admin — nada muda no app.
     */
    ProviderCapability["GEO_LOOKUP"] = "geo_lookup";
    /**
     * Busca contagem de visitantes de uma fonte externa (contador de fluxo por
     * câmera, Google Analytics, etc). É o que o worker de views usa para
     * selecionar quais integrações sincronizar — deliberadamente separado de
     * `SYNC_DATA`, que arrasta a integração para o `IntegrationSyncScheduler`
     * genérico, onde o `switch` cai no `default:` e marca `lastSyncAt` sem ter
     * feito nada. Ver `@DOCS/modules/VIEWS.md`.
     */
    ProviderCapability["FETCH_VISITOR_COUNT"] = "fetch_visitor_count";
    // Social media capabilities
    ProviderCapability["CREATE_POST"] = "create_post";
    ProviderCapability["CREATE_STORY"] = "create_story";
    ProviderCapability["CREATE_CAMPAIGN"] = "create_campaign";
    // Advanced capabilities
    ProviderCapability["CREATE_EVENT"] = "create_event";
    ProviderCapability["CREATE_TEMPLATE"] = "create_template";
    ProviderCapability["TRACK_DELIVERY"] = "track_delivery";
    ProviderCapability["TRACK_OPENS"] = "track_opens";
    ProviderCapability["TRACK_CLICKS"] = "track_clicks";
    ProviderCapability["SCHEDULE_MESSAGE"] = "schedule_message";
    // Calendar capabilities
    ProviderCapability["CALENDAR_SYNC"] = "calendar_sync";
    ProviderCapability["CALENDAR_READ"] = "calendar_read";
    ProviderCapability["CALENDAR_WRITE"] = "calendar_write";
    // Sync capabilities
    ProviderCapability["SYNC_DATA"] = "sync_data";
    // Payment capabilities
    ProviderCapability["PROCESS_PAYMENT"] = "process_payment";
    ProviderCapability["PROCESS_SUBSCRIPTION"] = "process_subscription";
    ProviderCapability["TOKENIZE_CARD"] = "tokenize_card";
    ProviderCapability["REFUND_PAYMENT"] = "refund_payment";
    ProviderCapability["CANCEL_SUBSCRIPTION"] = "cancel_subscription";
    // CRM capabilities
    ProviderCapability["CREATE_CONTACT"] = "create_contact";
    ProviderCapability["UPDATE_CONTACT"] = "update_contact";
    ProviderCapability["CREATE_LIST"] = "create_list";
    ProviderCapability["SEND_BULK"] = "send_bulk";
    ProviderCapability["BULK_SEND"] = "bulk_send";
    // Webhook capabilities
    ProviderCapability["CREATE_WEBHOOK"] = "create_webhook";
    ProviderCapability["RECEIVE_WEBHOOK"] = "receive_webhook";
    ProviderCapability["VERIFY_WEBHOOK"] = "verify_webhook";
    ProviderCapability["SEND_WEBHOOK"] = "send_webhook";
    // Form capabilities
    ProviderCapability["CREATE_FORM"] = "create_form";
    ProviderCapability["SUBMIT_FORM"] = "submit_form";
    ProviderCapability["CREATE_SURVEY"] = "create_survey";
    ProviderCapability["RECEIVE_FORM"] = "receive_form";
    // Widget capabilities
    ProviderCapability["CREATE_WIDGET"] = "create_widget";
    ProviderCapability["TRACK_VISITOR"] = "track_visitor";
    ProviderCapability["LIVE_CHAT"] = "live_chat";
    // API capabilities
    ProviderCapability["REST_API"] = "rest_api";
    ProviderCapability["GRAPHQL"] = "graphql";
    // Analytics capabilities
    ProviderCapability["GET_INSIGHTS"] = "get_insights";
    ProviderCapability["GET_AUDIENCE"] = "get_audience";
    ProviderCapability["TRACK_OPEN"] = "track_open";
    // Bot capabilities
    ProviderCapability["CREATE_BOT"] = "create_bot";
    // Page management
    ProviderCapability["MANAGE_PAGE"] = "manage_page";
    // Account management
    ProviderCapability["MANAGE_ACCOUNT"] = "manage_account";
    // AI Capabilities
    ProviderCapability["GENERATE_EMBEDDING"] = "generate_embedding";
    ProviderCapability["RERANK"] = "rerank";
    ProviderCapability["VECTOR_STORAGE"] = "vector_storage";
    ProviderCapability["AI_TEXT_GENERATION"] = "ai_text_generation";
    ProviderCapability["AI_CHAT_COMPLETION"] = "ai_chat_completion";
    // Internal subagents (services da plataforma TROIA que usam LLM, agrupados por afinidade funcional).
    // Cada tenant marca essas capabilities na integration que quer usar para cada grupo.
    ProviderCapability["AI_INTERNAL_JUDGE"] = "ai_internal_judge";
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
    ProviderCapability["AI_INTERNAL_COMPLIANCE"] = "ai_internal_compliance";
    ProviderCapability["AI_INTERNAL_PROCESSING"] = "ai_internal_processing";
    ProviderCapability["AI_INTERNAL_ANALYTICS"] = "ai_internal_analytics";
    ProviderCapability["AI_INTERNAL_IMPORTING"] = "ai_internal_importing";
    ProviderCapability["TEXT_TO_SPEECH"] = "text_to_speech";
    ProviderCapability["SPEECH_TO_TEXT"] = "speech_to_text";
    // Template Management
    ProviderCapability["TEMPLATE_MANAGEMENT"] = "template_management";
    // Database Capabilities (Properties, Real Estate, etc.)
    ProviderCapability["FETCH_PROPERTIES"] = "fetch_properties";
    ProviderCapability["SYNC_PROPERTIES"] = "sync_properties";
    ProviderCapability["CREATE_PROPERTY"] = "create_property";
    ProviderCapability["UPDATE_PROPERTY"] = "update_property";
    ProviderCapability["DELETE_PROPERTY"] = "delete_property";
    // Meta Platform Capabilities
    ProviderCapability["SOCIAL_LOGIN"] = "social_login";
    ProviderCapability["WHATSAPP_EMBEDDED_SIGNUP"] = "whatsapp_embedded_signup";
    // Voice Cloning capabilities
    ProviderCapability["VOICE_CLONING"] = "voice_cloning";
    // Batch & Domain Management capabilities
    ProviderCapability["BATCH_SEND"] = "batch_send";
    ProviderCapability["DOMAIN_MANAGEMENT"] = "domain_management"; // Manage email domains (DNS, verification)
})(ProviderCapability || (exports.ProviderCapability = ProviderCapability = {}));
