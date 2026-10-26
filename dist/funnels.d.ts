import { PaginationQuery, ListResponse, AppAwareDocument, ActiveStatus } from './common';
import type { DistributionConfig } from './distribution';
import type { AlertConfig } from './alerts';
/** Como um campo da página pública de captura aparece para o cliente. */
export type LeadCaptureFieldMode = 'hidden' | 'optional' | 'required';
/** Campos da página pública que o gestor exibe/exige por funil. */
export interface LeadCaptureFields {
    email: LeadCaptureFieldMode;
    cpf: LeadCaptureFieldMode;
    birthDate: LeadCaptureFieldMode;
}
/** E-mail aparece opcional (como sempre foi); CPF e nascimento só quando ligados. */
export declare const DEFAULT_LEAD_CAPTURE_FIELDS: LeadCaptureFields;
/**
 * Campos efetivos da página — fonte única para a aba Captura, a página pública
 * e o servidor. Lê `fields` e cai no legado `emailRequired` quando o e-mail
 * ainda não foi configurado pela aba nova (funil antigo, sessão antiga no Redis).
 */
export declare function resolveLeadCaptureFields(config: {
    fields?: Partial<LeadCaptureFields>;
    emailRequired?: boolean;
} | null | undefined): LeadCaptureFields;
/**
 * Captura de leads por QR Code (D16). "Ligada" = objeto presente (qualquer
 * campo). `channelId` preenchido = Etapa 2 (confirmação no WhatsApp) ligada.
 * `message` aceita a variável `{{code}}`.
 */
export interface FunnelCaptureConfig {
    /** Modelo de captura (`Form` com `type: 'form'`). */
    formId?: string;
    /** Canal WhatsApp de confirmação; preenchido = Etapa 2 ligada. */
    channelId?: string;
    /** Ex.: "Olá! Quero participar da promoção. Código {{code}}" */
    message?: string;
    /** Texto LGPD da página pública (D9). */
    consentText?: string;
    /**
     * Legado (até 2026-10-21): e-mail obrigatório. Só vale quando `fields.email`
     * não existe — a aba Captura grava em `fields` e apaga este. Leia sempre por
     * `resolveLeadCaptureFields`.
     */
    emailRequired?: boolean;
    /**
     * Campos opcionais da página pública (nome e WhatsApp são fixos). Campo
     * ausente segue `DEFAULT_LEAD_CAPTURE_FIELDS`. Leia por `resolveLeadCaptureFields`.
     */
    fields?: Partial<LeadCaptureFields>;
    /**
     * Dar cupom de sorteio a quem se cadastrar pela página (2026-09-29). O
     * número vai para os cupons do lead e para a variável `{{cupom}}` da
     * mensagem. Cadastro de quem já tinha lead aberto no funil não ganha cupom.
     */
    issueCoupon?: boolean;
}
/**
 * Funnel - Sales funnel structure
 * Each funnel has its own independent steps.
 *
 * Distribuição: `assignmentConfig` é unificado em `DistributionConfig` —
 * mesmo shape para channels, funnels e ticket-pipelines. Processado por um
 * único `DistributionService` no backend.
 *
 * Ver plano: DOCS/architecture/ASSIGNMENTS_REMOVAL.md
 */
export interface Funnel extends AppAwareDocument {
    name: string;
    description?: string;
    color: string;
    order: number;
    status: ActiveStatus;
    /** Distribuição automática de leads — config unificada (D8, D9). */
    assignmentConfig?: DistributionConfig;
    /**
     * Contador monotônico de rotação usado por `DistributionService`.
     * Incrementado atomicamente via `$inc` a cada atribuição. O userId
     * selecionado é `pool[lastAssignedUserId % pool.length]`.
     *
     * Mantém o nome legado para preservar o campo no MongoDB mas muda
     * semântica de "id do último usuário" (string) para "contador sequencial"
     * (number). Ver decisão D4 / D_fase1b no plano.
     */
    lastAssignedUserId?: number;
    /** Permite criar leads duplicados (mesmo contactId) neste funil. Leads em funis diferentes não são afetados. Default: true */
    allowDuplicateContacts?: boolean;
    /**
     * Escopo da checagem de duplicados quando allowDuplicateContacts === false.
     * 'funnel' = considera apenas leads deste funil (default).
     * 'all_funnels' = considera leads em andamento de qualquer funil do tenant.
     */
    duplicateCheckScope?: 'funnel' | 'all_funnels';
    /** Tipos de lead disponíveis neste funil (ex: Venda, Suporte, Consultoria) */
    types?: string[];
    /** Config default dos alertas de inatividade deste funil (override por etapa em FunnelStep). */
    alertConfig?: AlertConfig;
    /** Captura por QR Code (D16). Ausente = captura desligada neste funil. */
    capture?: FunnelCaptureConfig;
}
export interface CreateFunnelRequest {
    name: string;
    description?: string;
    color: string;
    order?: number;
    assignmentConfig?: DistributionConfig;
    /** Permite criar leads duplicados (mesmo contactId) neste funil. Leads em funis diferentes não são afetados. Default: true */
    allowDuplicateContacts?: boolean;
    /**
     * Escopo da checagem de duplicados quando allowDuplicateContacts === false.
     * 'funnel' = considera apenas leads deste funil (default).
     * 'all_funnels' = considera leads em andamento de qualquer funil do tenant.
     */
    duplicateCheckScope?: 'funnel' | 'all_funnels';
    /** Tipos de lead disponíveis neste funil */
    types?: string[];
    /** Config default dos alertas de inatividade deste funil. */
    alertConfig?: AlertConfig;
    /** Captura por QR Code (D16). */
    capture?: FunnelCaptureConfig;
}
export interface UpdateFunnelRequest {
    name?: string;
    description?: string;
    color?: string;
    order?: number;
    status?: ActiveStatus;
    assignmentConfig?: DistributionConfig;
    /** Permite criar leads duplicados (mesmo contactId) neste funil. Leads em funis diferentes não são afetados. Default: true */
    allowDuplicateContacts?: boolean;
    /**
     * Escopo da checagem de duplicados quando allowDuplicateContacts === false.
     * 'funnel' = considera apenas leads deste funil (default).
     * 'all_funnels' = considera leads em andamento de qualquer funil do tenant.
     */
    duplicateCheckScope?: 'funnel' | 'all_funnels';
    /** Tipos de lead disponíveis neste funil */
    types?: string[];
    /** Config default dos alertas de inatividade deste funil. */
    alertConfig?: AlertConfig;
    /** Captura por QR Code (D16). `null` = desligar (remove o bloco). */
    capture?: FunnelCaptureConfig | null;
}
export type FunnelResponse = Omit<Funnel, '_id'> & {
    id: string;
    /**
     * Scope do usuário logado neste funil (proveniente de `funnels-users`).
     * - `'own'` | `'team'` | `'all'`: user tem entry ativa com esse scope
     * - `null` ou ausente: user não tem entry ativa (D-context-gate inativo)
     *
     * Frontend usa pra esconder/filtrar UI:
     * - Filtro de operadores aparece se `userScope === 'team' | 'all'`
     * - Em `'team'` o dropdown de users deve ser filtrado pra mostrar só
     *   operadores das mesmas teams que o user logado.
     */
    userScope?: 'own' | 'team' | 'all' | null;
    /**
     * `true` se o funil tem pelo menos 1 entry ativa em `funnels-users`
     * (qualquer usuário, não só o logado). `false` = funil órfão — D-context-gate
     * inativo: leads não aparecem em listagens e distribuição não roda.
     * Campo computado no read (getAll/dropdown); ausente em endpoints que não
     * enriquecem (retrocompat).
     */
    hasUsers?: boolean;
};
export interface FunnelQuery extends PaginationQuery {
    filters?: {
        status?: ActiveStatus;
        name?: string;
    };
}
export interface FunnelListResponse extends ListResponse<FunnelResponse> {
}
/**
 * FunnelStep - Individual stages within a funnel
 * Each step has its own color and order within the funnel
 */
export interface FunnelStep extends AppAwareDocument {
    funnelId: string;
    name: string;
    description?: string;
    color: string;
    order: number;
    status: ActiveStatus;
    /** Override opcional dos alertas de inatividade nesta etapa (por relógio; herda do funil). */
    alertConfig?: AlertConfig;
}
export interface CreateFunnelStepRequest {
    funnelId: string;
    name: string;
    description?: string;
    color: string;
    order?: number;
    /** Override opcional dos alertas de inatividade nesta etapa. */
    alertConfig?: AlertConfig;
}
export interface UpdateFunnelStepRequest {
    name?: string;
    description?: string;
    color?: string;
    order?: number;
    status?: ActiveStatus;
    /** Override opcional dos alertas de inatividade nesta etapa. */
    alertConfig?: AlertConfig;
}
export type FunnelStepResponse = Omit<FunnelStep, '_id'> & {
    id: string;
};
export interface FunnelStepQuery extends PaginationQuery {
    filters?: {
        funnelId?: string;
        status?: ActiveStatus;
        name?: string;
    };
}
export interface FunnelStepListResponse extends ListResponse<FunnelStepResponse> {
}
/**
 * Bulk operations
 */
export interface ReorderFunnelsRequest {
    funnelIds: string[];
}
export interface ReorderFunnelStepsRequest {
    stepIds: string[];
}
/**
 * Validation responses
 */
export interface FunnelDeleteValidation {
    canDelete: boolean;
    /**
     * Nome histórico do contador de leads vinculados ao funil. Mantido para
     * compatibilidade com os consumidores antigos de
     * `GET /funnels/validate-delete/:id`.
     */
    linkedLeadsCount: number;
    /**
     * Mesmo número de `linkedLeadsCount`, com o nome que a modal de exclusão do
     * CRM consome (`GET /funnels/:id/can-delete` — RD1/RD2 da Fase C2).
     */
    leadCount: number;
    message: string;
}
export interface FunnelStepDeleteValidation {
    canDelete: boolean;
    linkedLeadsCount: number;
    message: string;
}
/**
 * Destino dos leads na exclusão de um funil (Fase C2 — RD1).
 *
 * - `delete`   → soft delete de TODOS os leads do funil (em lote).
 * - `transfer` → leads passam a viver no funil/etapa informados, com entrada
 *   nova em `stepsHistory` (a etapa anterior é fechada com `exitedAt`).
 */
export type FunnelLeadsDisposition = {
    action: 'delete';
} | {
    action: 'transfer';
    funnelId: string;
    stepId: string;
};
/**
 * Corpo OPCIONAL de `DELETE /api/funnels/:id`.
 *
 * Sem corpo (ou sem `leads`) o comportamento antigo é preservado: funil com
 * leads vinculados é recusado com 400. Com `leads`, o destino escolhido é
 * aplicado antes de excluir o funil.
 */
export interface DeleteFunnelRequest {
    leads?: FunnelLeadsDisposition;
}
/** Resultado auditável da exclusão de um funil (`DELETE /api/funnels/:id`). */
export interface DeleteFunnelResult {
    funnelId: string;
    /** O que foi feito com os leads: `none` = o funil não tinha leads. */
    leadsAction: 'none' | 'delete' | 'transfer';
    /** Quantos leads foram soft-deletados ou transferidos. */
    leadsAffected: number;
    /** Etapas do funil soft-deletadas em cascata. */
    stepsDeleted: number;
    /** Vínculos em `funnels-users` soft-deletados em cascata. */
    usersUnlinked: number;
    /** Destino, quando `leadsAction === 'transfer'`. */
    transferredTo?: {
        funnelId: string;
        stepId: string;
    };
}
