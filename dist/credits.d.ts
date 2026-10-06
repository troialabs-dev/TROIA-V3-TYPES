export declare enum CreditCategory {
    MESSAGE_CHAT = "message.chat",
    MESSAGE_AI = "message.ai",
    MESSAGE_CAMPAIGN = "message.campaign",
    MESSAGE_NOTIFICATION = "message.notification",
    AI_TOKENS_INPUT = "ai.tokens.input",
    AI_TOKENS_OUTPUT = "ai.tokens.output",
    AI_TOOL_EXECUTION = "ai.tool.execution",
    AI_VOICE_CLONE = "ai.voice.clone",
    AI_AGENT_TRAINING = "ai.agent.training",
    CRM_LEAD_CREATED = "crm.lead.created",
    CRM_TICKET_OPENED = "crm.ticket.opened",
    CRM_CONTACT_CREATED = "crm.contact.created",
    AUTOMATION_WORKFLOW_EXECUTED = "automation.workflow.executed",
    AUTOMATION_FORM_RESPONSE = "automation.form.response",
    AUTOMATION_CHECKLIST_COMPLETED = "automation.checklist.completed",
    INFRA_USER_ACTIVE = "infra.user.active",
    INFRA_CHANNEL_ACTIVE = "infra.channel.active",
    /**
     * Canal de e-mail (20/09/2026). Separado de `INFRA_CHANNEL_ACTIVE` porque
     * custa a metade: canal de WhatsApp/IG/FB ocupa uma instância do gateway
     * (R$ 15/mês), canal de e-mail não ocupa nenhuma (R$ 10/mês). Enquanto os
     * dois dividiam a mesma linha, quem só usava e-mail pagava por instância
     * que não existia. Ver `DOCS/modules/CREDITS_REPRICING.md`.
     */
    INFRA_CHANNEL_EMAIL = "infra.channel.email",
    /**
     * Armazenamento em disco (20/09/2026). A mídia de conversa é o maior custo
     * de infraestrutura que o sistema nunca cobrou: 997 GB no S3 em agosto/2026,
     * 1 MB por mensagem com anexo. A quantidade do débito são os GB ocupados
     * pela empresa, medidos pela collection `storage-usage`.
     */
    INFRA_STORAGE_GB = "infra.storage.gb",
    INFRA_EMAIL_DOMAIN = "infra.email.domain",
    INFRA_DATABASE_SYNC = "infra.database.sync",
    WEBSITE_SITE_PUBLISHED = "website.site.published",
    API_EXTERNAL_CALL = "api.external.call",
    BILLING_SUBSCRIPTION = "billing.subscription",
    BILLING_PURCHASE = "billing.purchase",
    BILLING_EXPIRATION = "billing.expiration",
    BILLING_CANCELLATION = "billing.cancellation",
    ADMIN_ADJUSTMENT = "admin.adjustment",
    AI_CONVERSATION_QA = "ai.conversation.qa",
    MCP_TOOL_CALL = "mcp_tool_call",
    /**
     * Áudio (18/09/2026). Não cabem em `AI_TOKENS_*` porque o provedor não
     * cobra por token: Whisper cobra por duração e TTS por caractere. Manter
     * separado é o que deixa o extrato legível e o preço por modelo honesto.
     */
    AI_TRANSCRIPTION = "ai.transcription",
    AI_SPEECH = "ai.speech"
}
/**
 * Preço de um modelo de IA em CRÉDITOS, do jeito que o cliente paga.
 *
 * # Por que não dá para calcular no frontend
 *
 * O catálogo (`AI_MODELS`) traz o preço em dólar do fabricante — é o custo
 * NOSSO, não o do cliente. O que o cliente paga sai da tabela de custos do
 * app (`apps.costs[]`), que é por tenant, tem preço por modelo e pode ser
 * editada no admin. Só o servidor conhece essa tabela.
 *
 * A unidade é por 1 MILHÃO de tokens porque é assim que todo fabricante
 * publica preço, e porque em 1k os números ficam pequenos demais para
 * comparar modelos de olho (10 contra 23 esconde que um é 2,3× o outro).
 * Internamente a tabela é por 1k e o débito arredonda por 1k — esta conta é
 * de VITRINE, não de cobrança.
 */
export interface AiModelCreditPrice {
    modelId: string;
    /** Créditos por 1M de tokens de entrada. `null` = categoria sem preço no app. */
    inputPerMillion: number | null;
    /** Créditos por 1M de tokens de saída. `null` = categoria sem preço no app. */
    outputPerMillion: number | null;
}
export type CreditUnit = 'per_action' | 'per_1k_tokens' | 'per_month' | 'per_day' | 'per_minute' | 'per_1k_chars' | 'per_gb_month';
export interface CreditCategoryConfig {
    label: string;
    unit: CreditUnit;
    hasDirection: boolean;
    hasProviderId: boolean;
    providerType?: 'messaging' | 'ai_model';
}
export declare const CREDIT_CATEGORIES: Record<CreditCategory, CreditCategoryConfig>;
export interface CreditCostEntry {
    category: CreditCategory;
    providerId?: string;
    direction?: 'inbound' | 'outbound';
    cost: number;
    unit: CreditUnit;
    description?: string;
}
export interface CompanyCard {
    providerId: string;
    integrationId: string;
    customerId: string;
    tokenId?: string;
    number: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    brand: string;
    nickname?: string;
    isDefault: boolean;
    createdAt: Date;
}
export interface CompanyCardResponse {
    providerId: string;
    integrationId: string;
    maskedNumber: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    nickname?: string;
    isDefault: boolean;
    createdAt: string;
}
/** Faixas de consumo, em %, que disparam o aviso de créditos acabando. */
export declare const CREDIT_USAGE_THRESHOLDS: readonly [70, 80, 90, 100];
export type CreditUsageThreshold = (typeof CREDIT_USAGE_THRESHOLDS)[number];
/**
 * Estado do aviso de consumo de créditos. O percentual é contado sobre o saldo
 * logo depois da ÚLTIMA ENTRADA de créditos (recarga, renovação ou ajuste) —
 * a maioria das empresas não tem plano com créditos por ciclo.
 */
export interface CreditUsageAlertState {
    /** Saldo logo depois da última entrada de créditos: a base do percentual. */
    base: number;
    /** Quando essa entrada aconteceu. */
    baseAt: Date;
    /** Maior faixa já avisada desde `baseAt` (0 = nenhuma). */
    notified: number;
}
export interface CreditBalance {
    balance: number;
    totalCreditsIn: number;
    totalCreditsOut: number;
    lastDebitAt?: Date;
    lastCreditAt?: Date;
    usageAlert?: CreditUsageAlertState;
}
export type CreditSubscriptionStatus = 'pending' | 'active' | 'awaiting_payment' | 'past_due' | 'suspended' | 'cancelled';
export type CreditPaymentMethod = 'credit_card' | 'pix';
/** Pending plan change — upgrade (awaiting PIX payment) or downgrade (scheduled for next cycle) */
export interface PendingPlanChange {
    planId: string;
    planName: string;
    creditsPerCycle: number;
    effectiveAt: Date;
    type: 'upgrade' | 'downgrade';
    /** Asaas payment ID — only for PIX upgrades awaiting payment */
    pendingPaymentId?: string;
    /** Pro-rata charge amount — only for upgrades */
    proRataCharge?: number;
    /** Additional credits to inject on confirmation — only for upgrades */
    additionalCredits?: number;
}
/** Result of PUT /credits/plan */
export interface ChangePlanResult {
    type: 'upgrade' | 'downgrade';
    effectiveAt: 'immediate' | 'next_cycle' | 'pending_payment';
    additionalCredits?: number;
    proRataCharge?: number;
    pixData?: {
        qrCode: string;
        copyPaste: string;
        expiresAt: string;
        paymentId: string;
    };
}
export interface CreditSubscription {
    planId: string;
    creditsPerCycle: number;
    cycleDays: number;
    subscribedAt: Date;
    currentCycleStart: Date;
    currentCycleEnd: Date;
    nextRenewalAt: Date;
    autoRecharge: {
        enabled: boolean;
        thresholdBalance: number;
        rechargeAmount: number;
        maxRechargesPerCycle?: number;
    };
    paymentMethod: CreditPaymentMethod;
    defaultCardIndex?: number;
    pendingPaymentId?: string;
    payment: {
        lastAttemptAt?: Date;
        failedAttempts: number;
        nextRetryAt?: Date;
        lastError?: string;
        suspendedAt?: Date;
        cancelledAt?: Date;
    };
    status: CreditSubscriptionStatus;
    pendingPlanChange?: PendingPlanChange;
    discount?: SubscriptionDiscount;
}
export interface SubscriptionDiscount {
    type: 'percent' | 'fixed';
    value: number;
}
export interface CreditAlert {
    trigger: {
        type: 'balance_below' | 'daily_consumption_above';
        value: number;
    };
    notification: {
        channels: ('socket' | 'email' | 'whatsapp')[];
        recipients: string[];
    };
    lastTriggeredAt?: Date;
    cooldownMinutes: number;
    enabled: boolean;
}
export type CreditInvoiceStatus = 'open' | 'closed' | 'cancelled';
export interface CreditInvoicePayment {
    amount: number;
    discount: number;
    total: number;
    currency: string;
}
export interface CreditInvoice {
    cycleNumber: number;
    period: {
        start: Date;
        end: Date;
    };
    planId?: string;
    planName?: string;
    payment?: CreditInvoicePayment;
    summary: {
        balanceBefore: number;
        totalCreditsIn: number;
        totalCreditsOut: number;
        expired: number;
        balanceAfter: number;
    };
    status: CreditInvoiceStatus;
    closedAt?: Date;
    createdAt: Date;
}
export type CreditTransactionType = 'debit' | 'credit';
export type CreditTransactionSource = 'subscription' | 'purchase' | 'auto_recharge' | 'consumption' | 'recurring' | 'refund' | 'admin' | 'expiration' | 'cancellation';
export interface CreditTransactionMetadata {
    conversationId?: string;
    channelId?: string;
    campaignId?: string;
    contactId?: string;
    leadId?: string;
    agentId?: string;
    modelId?: string;
    tokensInput?: number;
    tokensOutput?: number;
    /**
     * Parte da entrada que o provedor serviu do cache (20/09/2026). Só mede —
     * o desconto do cache (75% na OpenAI) é automático e já vem embutido no
     * preço que pagamos, mas sem este campo não há como saber QUANTO estamos
     * aproveitando, e é ele que decide se o custo por atendimento é R$ 0,15 ou
     * R$ 0,10. Ver `DOCS/modules/CREDITS_REPRICING.md` § "Medir o aproveitamento
     * do cache".
     */
    tokensCached?: number;
    /** Bytes ocupados no fechamento — só em `INFRA_STORAGE_GB`. */
    storageBytes?: number;
    workflowId?: string;
    nodeId?: string;
    toolNames?: string[];
    url?: string;
    description?: string;
    adminName?: string;
}
export interface CreditTransaction {
    companyId: string;
    appId: string;
    type: CreditTransactionType;
    amount: number;
    balanceAfter: number;
    category: CreditCategory;
    providerId?: string;
    direction?: 'inbound' | 'outbound';
    metadata: CreditTransactionMetadata;
    source: CreditTransactionSource;
    createdAt: Date;
}
export interface CreditTransactionResponse {
    id: string;
    companyId: string;
    appId: string;
    type: CreditTransactionType;
    amount: number;
    balanceAfter: number;
    category: CreditCategory;
    providerId?: string;
    direction?: 'inbound' | 'outbound';
    metadata: CreditTransactionMetadata;
    source: CreditTransactionSource;
    createdAt: string;
}
export interface AddCardRequest {
    number: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    nickname?: string;
    setAsDefault?: boolean;
}
export interface SubscribePlanRequest {
    planId: string;
    paymentMethod: CreditPaymentMethod;
    cardIndex?: number;
    newCard?: AddCardRequest;
    cycle: 'monthly' | 'yearly';
    discount?: SubscriptionDiscount;
}
export interface PurchaseCreditsRequest {
    amount: number;
    paymentMethod: CreditPaymentMethod;
    cardIndex?: number;
    newCard?: AddCardRequest;
}
export interface UpdateAutoRechargeRequest {
    enabled: boolean;
    thresholdBalance?: number;
    rechargeAmount?: number;
    maxRechargesPerCycle?: number;
}
export interface CreateCreditAlertRequest {
    trigger: {
        type: 'balance_below' | 'daily_consumption_above';
        value: number;
    };
    notification: {
        channels: ('socket' | 'email' | 'whatsapp')[];
        recipients: string[];
    };
    cooldownMinutes: number;
}
export interface CreditDashboardResponse {
    balance: number;
    totalCreditsIn: number;
    totalCreditsOut: number;
    subscription: {
        planId: string;
        planName: string;
        creditsPerCycle: number;
        currentCycleStart: string | null;
        currentCycleEnd: string | null;
        nextRenewalAt: string | null;
        status: CreditSubscriptionStatus;
        paymentMethod: CreditPaymentMethod;
        pendingPlanChange?: {
            planId: string;
            planName: string;
            creditsPerCycle: number;
            effectiveAt: string;
            type: 'upgrade' | 'downgrade';
            pendingPaymentId?: string;
            proRataCharge?: number;
            additionalCredits?: number;
        };
    } | null;
    consumptionByCategory: Array<{
        category: CreditCategory;
        total: number;
    }>;
    autoRecharge: {
        enabled: boolean;
        thresholdBalance: number;
        rechargeAmount: number;
        maxRechargesPerCycle?: number;
    };
}
export interface InvoiceCategoryConsumption {
    category: CreditCategory;
    total: number;
}
export interface InvoiceDetailResponse {
    invoice: CreditInvoice;
    transactions: CreditTransactionResponse[];
    consumptionByCategory: InvoiceCategoryConsumption[];
}
export interface PixQrCodeResponse {
    qrCode: string;
    copyPaste: string;
    expiresAt: string;
}
export interface ConsumptionByDayItem {
    date: string;
    categories: Record<string, number>;
    total: number;
}
export interface ConsumptionByDayResponse {
    items: ConsumptionByDayItem[];
    period: {
        start: string;
        end: string;
    };
    totals: Array<{
        category: CreditCategory;
        total: number;
    }>;
}
export interface TransactionListParams {
    category?: CreditCategory;
    type?: CreditTransactionType;
    source?: CreditTransactionSource;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export interface TransactionListResult {
    items: CreditTransactionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export type OutboundSource = 'campaign' | 'trigger' | 'follow-up' | 'workflow';
export interface OutboundMessageJob {
    source: OutboundSource;
    appId: string;
    companyId: string;
    integrationId: string;
    channelId: string;
    campaignId?: string;
    campaignMessageId?: string;
    leadId?: string;
    agentId?: string;
    followUpId?: string;
    followUpActionId?: string;
    contactId?: string;
    workflowExecutionId?: string;
    workflowNodeId?: string;
    messageContent?: string;
    targetContactIds?: string[];
    targetConversationId?: string;
    /** Mensagem já gravada com status `pending` que o WorkflowHandler despacha. */
    messageId?: string;
}
export interface ChannelWarmup {
    enabled: boolean;
    startedAt: Date;
    dayNumber: number;
    dailyLimit: number;
    sentToday: number;
    lastActivityAt: Date;
}
