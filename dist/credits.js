"use strict";
// TROIA-V3-TYPES/src/credits.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREDIT_USAGE_THRESHOLDS = exports.CREDIT_CATEGORIES = exports.CreditCategory = void 0;
// === Credit Categories (enum — single source of truth for debit calls) ===
var CreditCategory;
(function (CreditCategory) {
    CreditCategory["MESSAGE_CHAT"] = "message.chat";
    CreditCategory["MESSAGE_AI"] = "message.ai";
    CreditCategory["MESSAGE_CAMPAIGN"] = "message.campaign";
    CreditCategory["MESSAGE_NOTIFICATION"] = "message.notification";
    CreditCategory["AI_TOKENS_INPUT"] = "ai.tokens.input";
    CreditCategory["AI_TOKENS_OUTPUT"] = "ai.tokens.output";
    CreditCategory["AI_TOOL_EXECUTION"] = "ai.tool.execution";
    CreditCategory["AI_VOICE_CLONE"] = "ai.voice.clone";
    CreditCategory["AI_AGENT_TRAINING"] = "ai.agent.training";
    CreditCategory["CRM_LEAD_CREATED"] = "crm.lead.created";
    CreditCategory["CRM_TICKET_OPENED"] = "crm.ticket.opened";
    CreditCategory["CRM_CONTACT_CREATED"] = "crm.contact.created";
    CreditCategory["AUTOMATION_WORKFLOW_EXECUTED"] = "automation.workflow.executed";
    CreditCategory["AUTOMATION_FORM_RESPONSE"] = "automation.form.response";
    CreditCategory["AUTOMATION_CHECKLIST_COMPLETED"] = "automation.checklist.completed";
    CreditCategory["INFRA_USER_ACTIVE"] = "infra.user.active";
    CreditCategory["INFRA_CHANNEL_ACTIVE"] = "infra.channel.active";
    /**
     * Canal de e-mail (20/09/2026). Separado de `INFRA_CHANNEL_ACTIVE` porque
     * custa a metade: canal de WhatsApp/IG/FB ocupa uma instância do gateway
     * (R$ 15/mês), canal de e-mail não ocupa nenhuma (R$ 10/mês). Enquanto os
     * dois dividiam a mesma linha, quem só usava e-mail pagava por instância
     * que não existia. Ver `DOCS/modules/CREDITS_REPRICING.md`.
     */
    CreditCategory["INFRA_CHANNEL_EMAIL"] = "infra.channel.email";
    /**
     * Armazenamento em disco (20/09/2026). A mídia de conversa é o maior custo
     * de infraestrutura que o sistema nunca cobrou: 997 GB no S3 em agosto/2026,
     * 1 MB por mensagem com anexo. A quantidade do débito são os GB ocupados
     * pela empresa, medidos pela collection `storage-usage`.
     */
    CreditCategory["INFRA_STORAGE_GB"] = "infra.storage.gb";
    CreditCategory["INFRA_EMAIL_DOMAIN"] = "infra.email.domain";
    CreditCategory["INFRA_DATABASE_SYNC"] = "infra.database.sync";
    CreditCategory["WEBSITE_SITE_PUBLISHED"] = "website.site.published";
    CreditCategory["API_EXTERNAL_CALL"] = "api.external.call";
    CreditCategory["BILLING_SUBSCRIPTION"] = "billing.subscription";
    CreditCategory["BILLING_PURCHASE"] = "billing.purchase";
    CreditCategory["BILLING_EXPIRATION"] = "billing.expiration";
    CreditCategory["BILLING_CANCELLATION"] = "billing.cancellation";
    CreditCategory["ADMIN_ADJUSTMENT"] = "admin.adjustment";
    CreditCategory["AI_CONVERSATION_QA"] = "ai.conversation.qa";
    CreditCategory["MCP_TOOL_CALL"] = "mcp_tool_call";
    /**
     * Áudio (18/09/2026). Não cabem em `AI_TOKENS_*` porque o provedor não
     * cobra por token: Whisper cobra por duração e TTS por caractere. Manter
     * separado é o que deixa o extrato legível e o preço por modelo honesto.
     */
    CreditCategory["AI_TRANSCRIPTION"] = "ai.transcription";
    CreditCategory["AI_SPEECH"] = "ai.speech";
})(CreditCategory || (exports.CreditCategory = CreditCategory = {}));
exports.CREDIT_CATEGORIES = {
    [CreditCategory.MESSAGE_CHAT]: { label: 'Mensagem de chat', unit: 'per_action', hasDirection: true, hasProviderId: true, providerType: 'messaging' },
    [CreditCategory.MESSAGE_AI]: { label: 'Mensagem de IA', unit: 'per_action', hasDirection: true, hasProviderId: true, providerType: 'messaging' },
    [CreditCategory.MESSAGE_CAMPAIGN]: { label: 'Mensagem de campanha', unit: 'per_action', hasDirection: false, hasProviderId: true, providerType: 'messaging' },
    [CreditCategory.MESSAGE_NOTIFICATION]: { label: 'Notificação', unit: 'per_action', hasDirection: false, hasProviderId: true, providerType: 'messaging' },
    [CreditCategory.AI_TOKENS_INPUT]: { label: 'Tokens IA (input)', unit: 'per_1k_tokens', hasDirection: false, hasProviderId: true, providerType: 'ai_model' },
    [CreditCategory.AI_TOKENS_OUTPUT]: { label: 'Tokens IA (output)', unit: 'per_1k_tokens', hasDirection: false, hasProviderId: true, providerType: 'ai_model' },
    [CreditCategory.AI_TOOL_EXECUTION]: { label: 'Execução de tool IA', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.AI_TRANSCRIPTION]: { label: 'Transcrição de áudio', unit: 'per_minute', hasDirection: false, hasProviderId: true, providerType: 'ai_model' },
    [CreditCategory.AI_SPEECH]: { label: 'Voz sintetizada', unit: 'per_1k_chars', hasDirection: false, hasProviderId: true, providerType: 'ai_model' },
    [CreditCategory.AI_VOICE_CLONE]: { label: 'Voz Clonada', unit: 'per_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.AI_AGENT_TRAINING]: { label: 'Treinamento de agente', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.CRM_LEAD_CREATED]: { label: 'Lead criado', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.CRM_TICKET_OPENED]: { label: 'Ticket aberto', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.CRM_CONTACT_CREATED]: { label: 'Contato criado', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.AUTOMATION_WORKFLOW_EXECUTED]: { label: 'Workflow executado', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.AUTOMATION_FORM_RESPONSE]: { label: 'Resposta de formulário', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.AUTOMATION_CHECKLIST_COMPLETED]: { label: 'Checklist concluído', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.INFRA_USER_ACTIVE]: { label: 'Usuário ativo', unit: 'per_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.INFRA_CHANNEL_ACTIVE]: { label: 'Canal ativo', unit: 'per_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.INFRA_CHANNEL_EMAIL]: { label: 'Canal de e-mail', unit: 'per_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.INFRA_STORAGE_GB]: { label: 'Armazenamento', unit: 'per_gb_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.INFRA_EMAIL_DOMAIN]: { label: 'Domínio de email', unit: 'per_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.INFRA_DATABASE_SYNC]: { label: 'Sync de database', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.WEBSITE_SITE_PUBLISHED]: { label: 'Site publicado', unit: 'per_month', hasDirection: false, hasProviderId: false },
    [CreditCategory.API_EXTERNAL_CALL]: { label: 'Chamada API externa', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.BILLING_SUBSCRIPTION]: { label: 'Assinatura', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.BILLING_PURCHASE]: { label: 'Compra de créditos', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.BILLING_EXPIRATION]: { label: 'Expiração de ciclo', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.BILLING_CANCELLATION]: { label: 'Cancelamento', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.ADMIN_ADJUSTMENT]: { label: 'Ajuste administrativo', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.AI_CONVERSATION_QA]: { label: 'Análise de qualidade (conversa)', unit: 'per_action', hasDirection: false, hasProviderId: false },
    [CreditCategory.MCP_TOOL_CALL]: { label: 'Chamada de tool MCP', unit: 'per_action', hasDirection: false, hasProviderId: false },
};
// === Credit Usage Alert (embedded in Company.creditBalance) ===
/** Faixas de consumo, em %, que disparam o aviso de créditos acabando. */
exports.CREDIT_USAGE_THRESHOLDS = [70, 80, 90, 100];
