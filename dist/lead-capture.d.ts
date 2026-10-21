/**
 * Captura de leads por QR Code — sessão efêmera no Redis (D11: sem collection),
 * página pública e respostas da API autenticada do vendedor.
 *
 * Spec: DOCS/superpowers/specs/2026-08-20-qr-lead-capture-gamification-design.md §4.1
 */
import type { LeadCaptureFields } from './funnels';
export type LeadCaptureSessionStatus = 'waiting_scan' | 'filled' | 'confirmed' | 'form_completed' | 'done' | 'cancelled';
/** Foto da config `Funnel.capture` no instante em que a sessão foi criada. */
export interface LeadCaptureSnapshot {
    formId?: string;
    channelId?: string;
    /** `Channel.identifier` (só dígitos) — número do link `wa.me`. */
    channelPhone?: string;
    /** Nome do canal na hora da sessão — a modal mostra "canal {channelName}". */
    channelName?: string;
    message?: string;
    consentText?: string;
    /** Funil dá cupom a quem se cadastra (`FunnelCaptureConfig.issueCoupon`). */
    issueCoupon?: boolean;
    /** Legado: sessão criada antes de `fields` (vive até 7 dias no Redis). */
    emailRequired?: boolean;
    /** Campos da página, já resolvidos na criação da sessão. Leia por `resolveLeadCaptureFields`. */
    fields?: LeadCaptureFields;
}
export interface LeadCaptureSession {
    uuid: string;
    /** `CAT-XXXX` (alfabeto A-HJ-NP-Z2-9) — vai na mensagem do WhatsApp. */
    code: string;
    appId: string;
    companyId: string;
    /** Vendedor que abriu a sessão. */
    userId: string;
    funnelId: string;
    /** Nome do funil na hora da sessão (a modal exibe sem N+1). */
    funnelName: string;
    /** Primeira etapa do funil (D12). */
    stepId: string;
    stepName: string;
    /** D15 — escolhidos/assumidos na modal. */
    teamId?: string;
    teamName?: string;
    unitId?: string;
    unitName?: string;
    capture: LeadCaptureSnapshot;
    status: LeadCaptureSessionStatus;
    leadId?: string;
    contactId?: string;
    conversationId?: string;
    checklistId?: string;
    /** D5 — contato já tinha lead aberto no funil (sem duplicados). */
    wasExistingLead?: boolean;
    existingAssigneeName?: string;
    /** D5 — quando o lead existente foi criado e em que etapa está (modal 02-B). */
    existingLeadCreatedAt?: string;
    existingLeadStepName?: string;
    /** Etapa 1. */
    customer?: {
        name: string;
        phone: string;
        email?: string;
    };
    /** Cupom de sorteio dado no cadastro (funil com `issueCoupon`). */
    coupon?: number;
    consent?: {
        acceptedAt: string;
        ip?: string;
        userAgent?: string;
    };
    /** Etapa 2 — como a mensagem casou (mockup 03-A código / 03-B telefone). */
    confirmedVia?: 'code' | 'phone';
    /** Texto da mensagem de confirmação (máx. 200 chars) — exibido na variante "pelo telefone". */
    confirmationText?: string;
    /**
     * Pontos REALMENTE creditados a este vendedor por este lead (captura +
     * formulário), somados do livro-caixa no instante em que a sessão virou
     * `done`. `0` = gamificação/regra desligada, cap diário batido, lead de
     * outro vendedor (D5) ou nada confirmado. A celebração e a tela "Concluído"
     * usam ESTE número — nunca os pontos do catálogo padrão.
     */
    pointsEarned?: number;
    createdAt: string;
    filledAt?: string;
    confirmedAt?: string;
    formCompletedAt?: string;
    doneAt?: string;
    expiresAt: string;
}
export interface LeadCaptureOptionsResponse {
    funnels: Array<{
        id: string;
        name: string;
        color?: string;
        hasForm: boolean;
        hasChannel: boolean;
    }>;
    teams: Array<{
        id: string;
        name: string;
    }>;
    units: Array<{
        id: string;
        name: string;
    }>;
}
export interface CreateLeadCaptureSessionRequest {
    funnelId: string;
    teamId?: string;
    unitId?: string;
}
export interface LeadCaptureSessionResponse {
    session: LeadCaptureSession;
    /** PNG em data URL gerado no backend (lib `qrcode`). */
    qrDataUrl: string;
    /** `https://{app.domains[0]}/leads/capture/{uuid}` */
    url: string;
}
/** `GET /api/leads/capture/public/:uuid` — só o que a página pública precisa (D6). */
export interface LeadCapturePublicInfo {
    company: {
        name: string;
        logo?: string;
        primaryColor?: string;
    };
    seller: {
        firstName: string;
    };
    consentText: string;
    hasWhatsappStep: boolean;
    /** Igual a `fields.email === 'required'` — mantido para a página antiga ainda em cache. */
    emailRequired: boolean;
    /** Quais campos opcionais a página mostra e quais exige. */
    fields: LeadCaptureFields;
    status: LeadCaptureSessionStatus;
}
export interface LeadCapturePublicSubmitRequest {
    name: string;
    phone: string;
    email?: string;
    /** CPF com ou sem máscara — o servidor confere os dígitos. */
    cpf?: string;
    /** Data de nascimento `AAAA-MM-DD`. */
    birthDate?: string;
    consent: true;
}
export interface LeadCapturePublicSubmitResponse {
    /** Presente só quando o funil tem canal de confirmação (Etapa 2). */
    whatsappUrl?: string;
    code: string;
    /** `true` = sem Etapa 2, captura já confirmada ("Pronto!"). */
    done: boolean;
    /** Cupom de sorteio dado neste cadastro, formatado (0012). */
    coupon?: string;
}
/** TTL da sessão no Redis — 7 dias (D2). */
export declare const LEAD_CAPTURE_SESSION_TTL_SECONDS: number;
