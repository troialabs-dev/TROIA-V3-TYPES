import { ObjectId } from 'mongodb';
import type { ActorType } from './common';
/**
 * Template Status Lifecycle
 */
export declare enum TemplateStatus {
    DRAFT = "draft",// Em edição, não aprovado
    PENDING_APPROVAL = "pending_approval",// Enviado para aprovação (WhatsApp)
    APPROVED = "approved",// Aprovado (pronto para uso)
    REJECTED = "rejected",// Rejeitado pelo provider
    ARCHIVED = "archived"
}
/**
 * Template Category (WhatsApp requirement)
 */
export declare enum TemplateCategory {
    MARKETING = "MARKETING",// Promotional messages
    UTILITY = "UTILITY",// Transactional updates
    AUTHENTICATION = "AUTHENTICATION"
}
/**
 * Template Variable Definition
 * Variables use numeric positions ({{1}}, {{2}}, {{3}}) for Meta compliance
 */
export interface TemplateVariable {
    position: number;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required: boolean;
    example: string;
    description?: string;
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        enum?: string[];
    };
}
/**
 * Mídia do cabeçalho de um template (2026-08-29).
 *
 * Duas coisas diferentes usam esta informação, e confundi-las custa caro:
 *  - APROVAR o template exige um identificador de upload da Meta
 *    (`example.header_handle`), gerado uma única vez a partir de um arquivo
 *    de exemplo.
 *  - ENVIAR exige apenas uma URL pública, que pode mudar a cada disparo —
 *    é o caso da nota fiscal gerada dentro do workflow.
 *
 * Este campo guarda a URL usada no ENVIO. O identificador de aprovação vive
 * em `WhatsAppTemplateComponent.example.header_handle`.
 */
export interface TemplateHeaderMedia {
    type: 'image' | 'video' | 'document';
    url: string;
    filename?: string;
}
/**
 * WhatsApp Template Component (Meta format)
 */
export interface WhatsAppTemplateComponent {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
    text?: string;
    example?: {
        header_text?: string[];
        body_text?: string[][];
        /**
         * Identificador devolvido pelo upload da Meta. OBRIGATÓRIO para aprovar
         * cabeçalho de mídia — sem ele a Meta responde 400 (code 100,
         * subcode 2388043). Medido em 2026-08-29.
         */
        header_handle?: string[];
    };
    buttons?: Array<{
        type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
        text: string;
        url?: string;
        phone_number?: string;
    }>;
}
/**
 * WhatsApp Official Template Config (Requires Meta approval)
 */
export interface WhatsAppOfficialTemplateConfig {
    providerType: 'whatsapp_business';
    providerTemplateId?: string;
    category: TemplateCategory;
    language: string;
    components: WhatsAppTemplateComponent[];
    /**
     * Mídia do cabeçalho usada no ENVIO. Três lugares do backend já leem este
     * campo há tempos; até 2026-08-29 nenhum caminho conseguia gravá-lo, porque
     * o Zod o descartava em silêncio.
     */
    headerMedia?: TemplateHeaderMedia;
    approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    submittedAt?: Date;
    approvedAt?: Date;
}
/**
 * Gateway Template Config (Free format - no approval)
 */
export interface GatewayTemplateConfig {
    providerType: 'whatsapp_gateway';
    messageData: {
        type: 'text' | 'media' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
        message?: string;
        mediaUrl?: string;
        mediaType?: 'image' | 'video' | 'audio' | 'document';
        caption?: string;
        filename?: string;
        location?: {
            latitude: number;
            longitude: number;
            name?: string;
            address?: string;
        };
        contact?: {
            name: string;
            phone?: string;
            email?: string;
        };
    };
}
/**
 * Email Template Config (HTML + Plain Text)
 */
export interface EmailTemplateConfig {
    providerType: 'email_smtp' | 'email_sendgrid' | 'email_resend' | 'email_ses' | 'gmail_api';
    subject?: string;
    htmlBody: string;
    plainTextBody?: string;
    attachments?: Array<{
        filename: string;
        url: string;
        contentType: string;
    }>;
    fromName?: string;
    replyTo?: string;
}
/**
 * Instagram/Facebook Template Config
 */
export interface InstagramTemplateConfig {
    providerType: 'instagram_direct' | 'facebook_messenger';
    messageData: {
        text?: string;
        attachment?: {
            type: 'image' | 'video' | 'audio' | 'file';
            url: string;
        };
        quick_replies?: Array<{
            content_type: 'text';
            title: string;
            payload?: string;
        }>;
    };
}
/**
 * Provider-Specific Configuration Types
 */
export type TemplateProviderConfig = WhatsAppOfficialTemplateConfig | GatewayTemplateConfig | EmailTemplateConfig | InstagramTemplateConfig;
/**
 * Template Submission Request (para envio ao provider)
 */
export interface TemplateSubmissionRequest {
    name: string;
    category: TemplateCategory;
    language: string;
    components: WhatsAppTemplateComponent[];
}
/**
 * Template Submission Response (retorno do provider)
 */
export interface TemplateSubmissionResponse {
    success: boolean;
    providerTemplateId?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    message?: string;
    error?: string;
}
/**
 * Template Status Update (webhook do WhatsApp)
 */
export interface TemplateStatusUpdate {
    providerTemplateId: string;
    templateId?: string;
    status: 'APPROVED' | 'REJECTED';
    reason?: string;
    approvedAt?: string;
    rejectedAt?: string;
}
/**
 * Main Template Document
 */
export interface Template {
    _id?: ObjectId;
    appId: ObjectId;
    companyId: ObjectId;
    name: string;
    description?: string;
    status: TemplateStatus;
    providerId: ObjectId;
    channelId: ObjectId;
    providerConfig: TemplateProviderConfig;
    variables: TemplateVariable[];
    version?: string;
    usageCount: number;
    lastUsedAt?: Date;
    /**
     * Motivo da recusa do provedor ao RECEBER o template para aprovação (antes
     * de qualquer revisão) — o template fica em rascunho. Texto pronto para a
     * tela. Ausente quando o envio para aprovação deu certo ou não se aplica.
     *
     * Existe desde 05/11/2026: a Meta recusou dois templates da Mastercell
     * (conta banida, "proibida de criar templates") e a tela mostrava sucesso —
     * o motivo ia só para o registro de erros do servidor.
     */
    submissionError?: string;
    /** Quando a recusa de `submissionError` aconteceu. */
    submissionErrorAt?: Date;
    /**
     * Quem criou o template. OPCIONAL desde 2026-08-30 — era declarado
     * obrigatório e NENHUM caminho gravava (o mapper devolvia `''`).
     */
    createdBy?: ObjectId;
    /**
     * De que coleção é o id em `createdBy`. Ver `CreatorStamp` em `common.ts`.
     * Ausente = registro anterior a 2026-08-30 (a informação não existia).
     */
    createdByType?: ActorType;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
/**
 * API Response Type (no ObjectId exposure)
 */
export interface TemplateResponse extends Omit<Template, '_id' | 'appId' | 'companyId' | 'providerId' | 'channelId' | 'createdBy'> {
    id: string;
    appId: string;
    companyId: string;
    providerId: string;
    channelId: string;
    createdBy?: string;
    /**
     * De que coleção é o id em `createdBy`. Ver `CreatorStamp` em `common.ts`.
     * Ausente = registro anterior a 2026-08-30 (a informação não existia).
     */
    createdByType?: ActorType;
}
/**
 * Create Template Request
 */
export interface CreateTemplateRequest {
    name: string;
    description?: string;
    channelId: string;
    providerConfig?: TemplateProviderConfig;
    variables: TemplateVariable[];
}
/**
 * Update Template Request
 */
export interface UpdateTemplateRequest {
    name?: string;
    description?: string;
    providerConfig?: TemplateProviderConfig;
    variables?: TemplateVariable[];
}
/**
 * Template Query Filters
 */
export interface TemplateQuery {
    status?: TemplateStatus | TemplateStatus[];
    providerId?: string;
    providerType?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'usageCount' | 'lastUsedAt';
    sortOrder?: 'asc' | 'desc';
}
/**
 * Template List Response
 */
export interface TemplateListResponse {
    items: TemplateResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Template Preview Request (with sample data)
 */
export interface TemplatePreviewRequest {
    templateId: string;
    sampleData: Record<number, string | number | boolean>;
}
/**
 * Template Preview Response
 */
export interface TemplatePreviewResponse {
    providerId: string;
    providerType: string;
    rendered: {
        components?: WhatsAppTemplateComponent[];
        messageData?: Record<string, unknown>;
        subject?: string;
        htmlBody?: string;
        plainTextBody?: string;
        text?: string;
        attachment?: Record<string, unknown>;
    };
    variablesUsed: Record<number, string | number | boolean>;
}
/**
 * Template Version Change Types (semantic versioning)
 */
export type TemplateVersionChangeType = 'major' | 'minor' | 'patch' | 'initial';
/**
 * Template Version Document
 * Immutable snapshot stored in `template-versions` collection
 */
export interface TemplateVersion {
    _id?: ObjectId;
    templateId: ObjectId | string;
    version: string;
    htmlBody: string;
    subject: string;
    changePercentage: number;
    changeType: TemplateVersionChangeType;
    appId: ObjectId | string;
    companyId: ObjectId | string;
    createdAt: Date | string;
}
/**
 * Template Version API Response
 */
export interface TemplateVersionResponse {
    id: string;
    templateId: string;
    version: string;
    htmlBody: string;
    subject: string;
    changePercentage: number;
    changeType: TemplateVersionChangeType;
    appId: string;
    companyId: string;
    createdAt: string;
}
/**
 * Template Version Query
 */
export interface TemplateVersionQuery {
    page?: number;
    limit?: number;
}
/**
 * Generate HTML Request (AI-powered)
 */
export interface GenerateHtmlRequest {
    instructions: string;
    currentHtml: string;
}
/**
 * Generate HTML Response
 */
export interface GenerateHtmlResponse {
    html: string;
}
/**
 * Submit Template for Approval Request (WhatsApp only)
 */
export interface SubmitTemplateApprovalRequest {
    templateId: string;
}
/**
 * Template Approval Status Response
 */
export interface TemplateApprovalStatusResponse {
    templateId: string;
    status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    providerTemplateId?: string;
    rejectionReason?: string;
    submittedAt?: Date;
    approvedAt?: Date;
}
/** Detalhe de template para preview cross-module (chat), sem exigir permissão `templates.read`. */
export interface TemplateDropdownDetail {
    id: string;
    name: string;
    description?: string;
    channelId: string;
    providerId: string;
    status: TemplateStatus;
    providerConfig: TemplateResponse['providerConfig'];
    variables: TemplateVariable[];
}
