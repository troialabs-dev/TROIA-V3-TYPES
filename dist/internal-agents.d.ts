/**
 * Agentes internos — chat da equipe com agentes de IA (etapa E1, 24/11/2026).
 *
 * Contrato entre backend e tela: DOCS/superpowers/plans/2026-11-24-agentes-internos-e1.md §3–§5.
 * Rotas em `/api/internal-agents`, permissão `internal-agents` (escopo own | all).
 */
import type { AgentActAs } from './ai-agents';
/** Limites do chat interno — usados pelo Zod do backend e pela tela. */
export declare const AGENT_SESSION_LIMITS: {
    readonly textMaxChars: 20000;
    readonly attachmentsPerMessage: 5;
    readonly titleMaxChars: 120;
    readonly searchMaxChars: 100;
    readonly conversationStartersMax: 6;
    readonly conversationStarterMaxChars: 120;
    readonly messagesPageMax: 100;
    /** Arquivo de texto (txt/csv/md/json) até este tamanho tem o conteúdo lido pelo agente. */
    readonly inlineTextAttachmentMaxBytes: number;
};
export type AgentSessionMessageRole = 'user' | 'assistant';
/** `streaming` só existe em mensagem do agente enquanto a resposta chega. */
export type AgentSessionMessageStatus = 'completed' | 'streaming' | 'stopped' | 'failed';
/** Texto. Na resposta do agente é Markdown (com tabelas GFM). */
export interface AgentSessionTextBlock {
    type: 'text';
    text: string;
}
export interface AgentSessionImageBlock {
    type: 'image';
    url: string;
    filename: string;
    mimeType: string;
    size: number;
}
export interface AgentSessionDocumentBlock {
    type: 'document';
    url: string;
    filename: string;
    mimeType: string;
    size: number;
}
/**
 * Conteúdo de uma mensagem. A E5 acrescenta tipos (gráfico, arquivo gerado) —
 * consumidores IGNORAM tipos que não conhecem.
 */
export type AgentSessionContentBlock = AgentSessionTextBlock | AgentSessionImageBlock | AgentSessionDocumentBlock | AgentSessionConfirmationBlock;
/** Com que identidade o agente age nesta conversa (selo "Agindo como"). */
export interface AgentSessionIdentity {
    actingAs: AgentActAs;
    /** 'Você' quando requester; nome do agente quando agent. */
    principalName: string;
    levelName: string | null;
    /** R3: "Módulo: ações" que o nível do agente tem e o de quem usa não tem. Vazio quando requester. */
    exceedsRequester: string[];
}
export type AgentConfirmationStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'failed';
/** Cartão "Confirmar / Cancelar" antes de uma alteração (D12, chave do agente). */
export interface AgentSessionConfirmationBlock {
    type: 'confirmation';
    confirmationId: string;
    functionName: string;
    /** 'Transferir lead' */
    label: string;
    /** Frase pronta em pt-BR. */
    summary: string;
    /** Até 8 itens; valores cortados em 120 caracteres. */
    argsPreview: Array<{
        label: string;
        value: string;
    }>;
    status: AgentConfirmationStatus;
    /** ISO */
    expiresAt: string;
    decidedAt?: string;
    /** 'Ticket #482 criado' | motivo da falha */
    resultSummary?: string;
}
export interface DecideAgentConfirmationRequest {
    decision: 'approve' | 'reject';
}
export interface DecideAgentConfirmationResponse {
    session: AgentSessionResponse;
    /** Mensagem do agente com o bloco atualizado. */
    confirmationMessage: AgentSessionMessageResponse;
    /** Nova resposta do agente (status 'streaming'), que comenta o resultado. */
    assistantMessage: AgentSessionMessageResponse;
}
export interface InternalAgentConfirmationUpdatedEvent {
    sessionId: string;
    messageId: string;
    block: AgentSessionConfirmationBlock;
}
export type AgentSessionToolStepStatus = 'running' | 'done' | 'error';
/** Passo de ferramenta mostrado na resposta ("Consultou a base Imóveis"). Sem args nem resultado. */
export interface AgentSessionToolStep {
    /** toolCallId do modelo */
    id: string;
    /** ex.: 'search_properties' */
    toolName: string;
    /** texto pronto em pt-BR */
    label: string;
    status: AgentSessionToolStepStatus;
    /** ISO */
    startedAt: string;
    /** ISO */
    finishedAt?: string;
}
export interface AgentSessionMessageResponse {
    id: string;
    sessionId: string;
    role: AgentSessionMessageRole;
    content: AgentSessionContentBlock[];
    status: AgentSessionMessageStatus;
    /** Motivo legível em pt-BR quando `status` é `failed`. */
    error?: string;
    toolSteps: AgentSessionToolStep[];
    /** ISO */
    sentAt: string;
    /** ISO */
    completedAt?: string;
}
export interface AgentSessionResponse {
    id: string;
    agentId: string;
    agentName: string;
    ownerUserId: string;
    ownerName: string;
    title: string;
    pinned: boolean;
    /** ISO */
    lastMessageAt: string;
    /** até 140 caracteres, sem Markdown */
    lastMessagePreview: string;
    messageCount: number;
    isRunning: boolean;
    runningMessageId?: string;
    /** O usuário logado é o dono? */
    isOwner: boolean;
    /**
     * O que QUEM PEDIU pode fazer nesta conversa, calculado no servidor (Q2, dono 24/11): ação do nível +
     * escopo, como no resto do sistema. Dono: `canSend` = create, `canUpdate` = update, `canDelete` = delete.
     * Conversa de outra pessoa (só com escopo "de todos"): `canSend` = false sempre; `canUpdate` = update;
     * `canDelete` = delete.
     */
    canSend: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    createdAt: string;
    updatedAt: string;
}
/** Agente interno disponível para conversar (entrada e seletor). */
export interface InternalAgentOption {
    id: string;
    name: string;
    description?: string;
    conversationStarters: string[];
}
/** Referência a um anexo já enviado por POST /internal-agents/attachments. */
export interface AgentSessionAttachmentRef {
    key: string;
    filename: string;
    mimeType: string;
    size: number;
}
export interface AgentSessionAttachmentUploadResponse extends AgentSessionAttachmentRef {
    url: string;
    kind: 'image' | 'document';
}
export interface CreateAgentSessionRequest {
    agentId: string;
    text: string;
    attachments?: AgentSessionAttachmentRef[];
}
export interface SendAgentSessionMessageRequest {
    text: string;
    attachments?: AgentSessionAttachmentRef[];
}
export interface UpdateAgentSessionRequest {
    title?: string;
    pinned?: boolean;
}
export interface AgentSessionsListQuery {
    search?: string;
    agentId?: string;
    /** `all` só tem efeito com escopo "de todos"; sem ele vale sempre `me`. */
    owner?: 'me' | 'all';
    /** padrão 1 */
    page?: number;
    /** padrão 30, máx 100 */
    limit?: number;
}
export interface AgentSessionsListResponse {
    sessions: AgentSessionResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}
export interface AgentSessionDetailResponse {
    session: AgentSessionResponse;
    /** `null` quando o agente foi excluído ou deixou de ser interno. */
    agent: InternalAgentOption | null;
    /** O agente ainda pode responder (ativo, interno, não excluído). */
    agentAvailable: boolean;
    /** E2: identidade calculada na hora. `null` = funções da plataforma desligadas (sem selo). */
    identity: AgentSessionIdentity | null;
}
export interface AgentSessionMessagesPage {
    /** ordem crescente de sentAt */
    messages: AgentSessionMessageResponse[];
    hasMore: boolean;
}
export interface StartAgentRunResponse {
    session: AgentSessionResponse;
    userMessage: AgentSessionMessageResponse;
    /** status 'streaming', content [] */
    assistantMessage: AgentSessionMessageResponse;
}
export interface StopAgentRunResponse {
    stopped: boolean;
}
export type InternalAgentRunStartedEvent = StartAgentRunResponse;
export interface InternalAgentRunDeltaEvent {
    sessionId: string;
    messageId: string;
    seq: number;
    /** Texto ACUMULADO da resposta até agora (não o pedaço). */
    text: string;
}
export interface InternalAgentRunStepEvent {
    sessionId: string;
    messageId: string;
    step: AgentSessionToolStep;
}
export interface InternalAgentRunFinishedEvent {
    session: AgentSessionResponse;
    /** status final: completed | stopped | failed */
    message: AgentSessionMessageResponse;
}
export interface InternalAgentSessionUpdatedEvent {
    session: AgentSessionResponse;
}
export interface InternalAgentSessionDeletedEvent {
    sessionId: string;
}
