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
    /** E4: gravação de voz — teto de duração (NUNCA #46) e de arquivo (limite do transcritor). */
    readonly voiceMaxSeconds: 300;
    readonly voiceMaxBytes: number;
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
export type AgentSessionContentBlock = AgentSessionTextBlock | AgentSessionImageBlock | AgentSessionDocumentBlock | AgentSessionConfirmationBlock | AgentSessionFileBlock | AgentSessionChartBlock | AgentSessionTaskBlock | AgentSessionTableBlock | AgentSessionDelegationBlock;
/** Tetos das tarefas agendadas (decisões do dono Q3: 20 ativas por pessoa, no mínimo a cada 15 min). */
export declare const AGENT_TASK_LIMITS: {
    readonly maxActivePerUser: 20;
    readonly minIntervalMinutes: 15;
    readonly titleMaxChars: 120;
    readonly instructionMaxChars: 4000;
    readonly maxConsecutiveFailures: 3;
    /** Prazo do cartão de confirmação numa execução agendada (ninguém está olhando). */
    readonly confirmationHours: 24;
};
export type AgentTaskStatus = 'active' | 'paused';
export type AgentTaskPauseReason = 'manual' | 'failures' | 'owner_inactive' | 'agent_unavailable' | 'completed';
export type AgentTaskRunStatus = 'completed' | 'failed' | 'waiting_confirmation' | 'skipped';
export type AgentTaskRecurrence = {
    kind: 'interval';
    everyMinutes: number;
}
/** `time` 'HH:mm'. weekdays: 0 = domingo … 6 = sábado; ausente/vazio = todos os dias. */
 | {
    kind: 'daily';
    time: string;
    weekdays?: number[];
}
/** `dayOfMonth` 1–28. */
 | {
    kind: 'monthly';
    time: string;
    dayOfMonth: number;
}
/** ISO. Roda uma vez e fica pausada com o motivo 'completed'. */
 | {
    kind: 'once';
    at: string;
};
/** Avisos além do sino — o sino vai sempre (decisão do dono Q1). Escolha da própria tarefa, não das preferências. */
export interface AgentTaskNotify {
    push?: boolean;
    email?: boolean;
    whatsapp?: boolean;
}
export interface AgentScheduledTaskResponse {
    id: string;
    agentId: string;
    agentName: string;
    ownerUserId: string;
    ownerName: string;
    title: string;
    instruction: string;
    recurrence: AgentTaskRecurrence;
    /** pt-BR, montado no servidor (ex.: "Toda segunda às 08:00"). */
    recurrenceLabel: string;
    timezone: string;
    notify: AgentTaskNotify;
    status: AgentTaskStatus;
    pauseReason?: AgentTaskPauseReason;
    /** Conversa da tarefa (existe depois da 1ª execução). */
    sessionId?: string;
    /** ISO */
    nextRunAt?: string;
    /** ISO */
    lastRunAt?: string;
    lastRunStatus?: AgentTaskRunStatus;
    consecutiveFailures: number;
    isOwner: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateAgentScheduledTaskRequest {
    agentId: string;
    title: string;
    instruction: string;
    recurrence: AgentTaskRecurrence;
    notify?: AgentTaskNotify;
}
export interface UpdateAgentScheduledTaskRequest {
    title?: string;
    instruction?: string;
    recurrence?: AgentTaskRecurrence;
    notify?: AgentTaskNotify;
    /** 'active' retoma (zera as falhas); 'paused' pausa com o motivo 'manual'. */
    status?: AgentTaskStatus;
}
export interface AgentScheduledTasksListResponse {
    tasks: AgentScheduledTaskResponse[];
}
export interface RunAgentScheduledTaskNowResponse {
    started: boolean;
    sessionId: string;
}
/** Cartão da tarefa na resposta do agente (ferramentas schedule_task / update_task). */
export interface AgentSessionTaskBlock {
    type: 'task';
    taskId: string;
    title: string;
    recurrenceLabel: string;
    status: AgentTaskStatus;
    action: 'created' | 'updated' | 'paused' | 'resumed' | 'deleted';
}
export interface InternalAgentTaskUpdatedEvent {
    task: AgentScheduledTaskResponse;
}
export interface InternalAgentTaskDeletedEvent {
    taskId: string;
}
/** Tetos da E5. `maxRows`: exportação direto do sistema (decisão do dono: 30 mil). */
export declare const AGENT_EXPORT_LIMITS: {
    readonly maxRows: 30000;
    /** Linhas que o próprio agente escreve num documento (`generate_document`). */
    readonly documentMaxRows: 2000;
    readonly chartMaxSeries: 8;
    readonly chartMaxPoints: 200;
    /** Linhas da prévia guardada no bloco do arquivo (modo exibição). */
    readonly previewRows: 50;
};
export type AgentFileFormat = 'csv' | 'xlsx' | 'pdf';
/** Arquivo gerado na conversa (exportação ou documento). Baixa por GET /sessions/:id/files/:fileId. */
export interface AgentSessionFileBlock {
    type: 'file';
    fileId: string;
    filename: string;
    mimeType: string;
    format: AgentFileFormat;
    size: number;
    /** Linhas (csv/xlsx). */
    rows?: number;
    /** A exportação parou no teto (`AGENT_EXPORT_LIMITS.maxRows`). */
    truncated?: boolean;
    /** Total que casava com a busca, quando `truncated`. */
    totalRows?: number;
    /** Prévia para o modo exibição (até `previewRows` linhas; csv/xlsx). */
    preview?: {
        columns: string[];
        rows: string[][];
    };
}
/** Estado de um pedido a outro agente (bloco 3). */
export type AgentDelegationStatus = 'working' | 'background' | 'completed' | 'failed' | 'canceled';
/**
 * Pedido a outro agente, ou trabalho em segundo plano (bloco 3, 26/11/2026).
 * O cartão mostra o andamento ao vivo; `childSessionId` abre a conversa do
 * operador (só leitura — decisão do dono: cartão + link).
 */
export interface AgentSessionDelegationBlock {
    type: 'delegation';
    delegationId: string;
    agentId: string;
    agentName: string;
    /** O que foi pedido. */
    objective: string;
    status: AgentDelegationStatus;
    /** Trabalho do PRÓPRIO agente em segundo plano (sem operador). */
    self?: boolean;
    /** Conversa do operador (só leitura). */
    childSessionId?: string;
    /** O que voltou (até `AGENT_DELEGATION_LIMITS.summaryChars`). */
    summary?: string;
    /** Motivo em pt-BR quando `failed`/`canceled`. */
    error?: string;
    /** Passos do operador (rótulos), para o cartão. */
    steps?: AgentSessionToolStep[];
    /** ISO */
    startedAt: string;
    /** ISO */
    finishedAt?: string;
}
/** Tetos da tabela completa na tela (`show_list`, decisão do dono Q-B de 25/11/2026). */
export declare const AGENT_TABLE_LIMITS: {
    /** Linhas guardadas por tabela (o mesmo teto da exportação). */
    readonly maxRows: 30000;
    /** Linhas que vêm dentro do cartão. */
    readonly previewRows: 10;
    /** Linhas por página na tela. */
    readonly pageSize: 100;
    /** Linhas por documento guardado no servidor. */
    readonly chunkRows: 500;
    /** Colunas no máximo. */
    readonly maxColumns: 40;
};
/**
 * Lista inteira do sistema na tela (`show_list`). As linhas ficam no servidor
 * (`agent-session-tables`), a tela pede por página e com busca; o modelo só
 * recebe o total, as colunas e algumas linhas. Some junto com a conversa.
 */
export interface AgentSessionTableBlock {
    type: 'table';
    tableId: string;
    title: string;
    /** Lista de origem (ex.: 'list_leads'). */
    source: string;
    columns: string[];
    /** Linhas guardadas. */
    totalRows: number;
    /** A lista tinha mais registros que o teto (`AGENT_TABLE_LIMITS.maxRows`). */
    truncated?: boolean;
    /** Total que a lista informou (quando diferente de `totalRows`). */
    sourceTotal?: number;
    /** Primeiras linhas (até `AGENT_TABLE_LIMITS.previewRows`). */
    preview: string[][];
}
/** Uma página de uma tabela guardada (GET …/tables/:tableId). */
export interface AgentSessionTablePageResponse {
    tableId: string;
    columns: string[];
    rows: string[][];
    page: number;
    pageSize: number;
    /** Linhas que casam com a busca (ou todas, sem busca). */
    matchingRows: number;
    totalRows: number;
}
export type AgentChartType = 'bar' | 'line' | 'area' | 'pie';
/** Gráfico desenhado pela tela (recharts) a partir dos dados que o agente mandou. */
export interface AgentSessionChartBlock {
    type: 'chart';
    chartId: string;
    title: string;
    chartType: AgentChartType;
    labels: string[];
    series: Array<{
        name: string;
        values: number[];
    }>;
    unit?: 'number' | 'currency' | 'percent';
    xLabel?: string;
    yLabel?: string;
}
export type AgentPageEntityType = 'lead' | 'conversation' | 'ticket' | 'contact' | 'customer' | 'funnel' | 'funnel_step' | 'ticket_pipeline' | 'channel' | 'team' | 'user' | 'campaign' | 'workflow' | 'database' | 'agent';
/**
 * "Vendo agora" do painel lateral (decisão do dono Q1): a tela e o que está aberto. É DICA para o agente
 * escolher a função certa — não dá acesso a nada; as funções conferem a permissão como sempre.
 */
export interface AgentPageContext {
    /** ex.: '/crm/funnels/6a…' */
    route: string;
    /** Nome da tela em pt-BR, ex.: 'CRM · Funil Vendas'. */
    screen: string;
    entities?: Array<{
        type: AgentPageEntityType;
        id: string;
        label?: string;
    }>;
    /** Filtros visíveis, já legíveis: { 'Etapa': 'Proposta', 'Responsável': 'Bruno' }. */
    filters?: Record<string, string>;
}
export declare const AGENT_PAGE_CONTEXT_LIMITS: {
    readonly routeMaxChars: 300;
    readonly screenMaxChars: 120;
    readonly entitiesMax: 10;
    readonly filtersMax: 12;
    readonly valueMaxChars: 120;
};
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
/** Tetos do detalhe de cada passo (plano de qualidade Q1/Q3, 25/11/2026). */
export declare const AGENT_STEP_DETAIL_LIMITS: {
    /** Campos que o agente mandou, em JSON. */
    readonly inputChars: 1000;
    /** O que voltou, em JSON compacto. */
    readonly outputChars: 4000;
    /** Resumo de uma frase. */
    readonly summaryChars: 200;
    /** O que entra no histórico do modelo por resposta anterior ("o que já consultei"). */
    readonly historyCharsPerMessage: 600;
};
/**
 * O que o passo pediu e o que voltou (plano de qualidade, 25/11/2026). A tela
 * mostra ao clicar no passo; o histórico do modelo leva o `summary`, para o
 * agente lembrar o que JÁ consultou (conversa `6b0785151d6353e3e79d28c8` do
 * servidor de teste: sem isso ele "confessou" ter inventado um limite que viu).
 * Nunca leva segredo (mesmo filtro do resultado que vai ao modelo).
 */
export interface AgentSessionToolStepDetail {
    /** O que o passo procurou (só a busca de funções). */
    query?: string;
    /** Função da plataforma chamada (ex.: 'list_leads'), quando o passo chama uma. */
    functionName?: string;
    /** Campos que o agente mandou, compactos. */
    input?: Record<string, unknown>;
    /** O que voltou em uma frase ("20 de 25.001 registros", "Erro: …"). */
    summary?: string;
    /** O que voltou, compacto — o que a tela mostra ao abrir o passo. */
    output?: unknown;
}
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
    /** O que pediu e o que voltou (ausente nas mensagens anteriores a 25/11/2026). */
    detail?: AgentSessionToolStepDetail;
}
/** E4: como a mensagem do usuário entrou. */
export type AgentSessionInputMode = 'voice';
/**
 * E4: o chat tem voz? Calculado no servidor: agente com `voiceEnabled` E o app com a habilidade de
 * transcrição E a de voz marcadas numa integração.
 */
export interface AgentVoiceAvailability {
    available: boolean;
    reason?: 'agent_off' | 'no_stt' | 'no_tts';
    /**
     * E7: dá para conversar em TEMPO REAL (a transcrição marcada é do Vercel AI Gateway, que transcreve em
     * fluxo). Ausente/false = só a gravação da E4.
     */
    live?: boolean;
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
    /** E4: mensagem do usuário que veio de fala transcrita. Ausente = digitada. */
    inputMode?: AgentSessionInputMode;
    /** E5: a tela de onde a pessoa mandou (painel lateral). */
    pageContext?: AgentPageContext;
    /** E6: mensagem criada por uma execução agendada. */
    trigger?: 'schedule';
    /** E6: tarefa que gerou a mensagem. */
    scheduledTaskId?: string;
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
    /** E4: voz disponível nesta conversa (ver `AgentVoiceAvailability`). */
    voice: AgentVoiceAvailability;
    /** E6: conversa de uma tarefa agendada. */
    scheduledTaskId?: string;
    /** Bloco 3: conversa de um operador, aberta pelo cartão do pedido (fica fora da lista). */
    parentSessionId?: string;
    /** Bloco 3: o pedido que criou esta conversa. */
    delegationId?: string;
    createdAt: string;
    updatedAt: string;
}
/** Agente interno disponível para conversar (entrada e seletor). */
export interface InternalAgentOption {
    id: string;
    name: string;
    description?: string;
    conversationStarters: string[];
    /** E4: voz disponível com este agente (microfone na tela de entrada). */
    voice: AgentVoiceAvailability;
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
    /** E5: enviado pelo painel lateral. */
    pageContext?: AgentPageContext;
}
export interface SendAgentSessionMessageRequest {
    text: string;
    attachments?: AgentSessionAttachmentRef[];
    /** E5: enviado pelo painel lateral. */
    pageContext?: AgentPageContext;
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
/**
 * Um pedaço de áudio da resposta, gerado no servidor frase a frase a partir do texto que o próprio agente
 * escreveu. Só é emitido quando a última mensagem do usuário foi falada. Tocar em ordem de `seq` (0, 1, 2…).
 */
export interface InternalAgentSpeechChunkEvent {
    sessionId: string;
    messageId: string;
    seq: number;
    /** ex.: 'audio/mpeg' */
    mimeType: string;
    audioBase64: string;
    /** A frase já preparada para leitura (sem markdown), para legenda. */
    text: string;
}
export interface InternalAgentSpeechEndEvent {
    sessionId: string;
    messageId: string;
    /** `failed`: a voz falhou; o texto da resposta segue normal. */
    reason: 'done' | 'stopped' | 'failed';
    /** Motivo legível em pt-BR quando `failed`. */
    error?: string;
}
/** Limites da conversa de voz em tempo real (decisões V2 e V3 do dono, 26/11/2026). */
export declare const AGENT_VOICE_LIVE_LIMITS: {
    /** Uma conversa de voz dura no máximo 10 minutos; a pessoa pode começar outra na hora. */
    readonly sessionMaxMs: 600000;
    /** Sem ninguém falar (nem a pessoa, nem o agente) por 1 minuto, encerra. */
    readonly silenceMs: 60000;
    /** Uma fala (segurar o botão) solta sozinha depois disso. */
    readonly utteranceMaxMs: 120000;
    /** Fala mais curta que isso é ignorada (toque sem querer). */
    readonly utteranceMinMs: 300;
    /** Áudio enviado: PCM 16 bits, mono, nesta taxa. */
    readonly sampleRate: 24000;
    /** Tamanho de cada pedaço enviado pelo socket. */
    readonly chunkMs: 100;
};
/** POST /internal-agents/voice-live — confere app, permissão, agente e créditos e devolve o código da conversa de voz. */
export interface StartVoiceLiveRequest {
    /** Conversa existente; sem ela, `agentId` e a conversa nasce na 1ª fala. */
    sessionId?: string;
    agentId?: string;
}
export interface StartVoiceLiveResponse {
    /** Código curto que o socket usa (`voice-live:attach`). Vale 30 s até ser usado. */
    liveId: string;
    /** Quando a conversa de voz acaba pelo limite de tempo. */
    endsAt: string;
}
export type VoiceLiveEndReason = 'limit' | 'silence' | 'closed' | 'replaced' | 'error';
/** Resposta (ack) dos eventos do cliente. */
export type VoiceLiveAck<T extends object = object> = ({
    ok: true;
} & T) | {
    ok: false;
    error: string;
};
/** Ack do `voice-live:release`: o turno começou, ou a fala foi ignorada (com o motivo para a tela). */
export interface VoiceLiveReleaseResult {
    run?: StartAgentRunResponse;
    ignored?: 'silence' | 'too_short' | 'empty';
    message?: string;
}
/** Texto parcial enquanto a pessoa fala (só para o socket que está falando). */
export interface InternalAgentVoiceLiveTranscriptEvent {
    liveId: string;
    text: string;
}
export interface InternalAgentVoiceLiveEndedEvent {
    liveId: string;
    reason: VoiceLiveEndReason;
    /** Motivo legível em pt-BR. */
    message?: string;
}
/** Voz pronta oferecida no editor do agente (GET /internal-agents/speech-voices). */
export interface AgentSpeechVoiceOption {
    /** Valor gravado em `voiceConfig.speechVoice`, ou o id do documento em `voices` quando `cloned`. */
    id: string;
    name: string;
    description?: string;
    /** Voz clonada (cadastro de Vozes). */
    cloned?: boolean;
    /** É a voz padrão da integração. */
    isDefault?: boolean;
}
export interface AgentSpeechVoicesResponse {
    /** `false` quando nenhuma integração do app tem a habilidade de voz marcada. */
    available: boolean;
    /** Modelo de voz da integração marcada (slug), quando houver. */
    model?: string;
    voices: AgentSpeechVoiceOption[];
}
/** POST /internal-agents/speech-preview — amostra para o botão "Ouvir exemplo" do editor. Devolve áudio. */
export interface AgentSpeechPreviewRequest {
    speechVoice?: string;
    /** Voz clonada (id do documento em `voices`). */
    voiceId?: string;
    speed?: number;
}
/** Bloco 3: andamento de um pedido a outro agente (cartão na resposta do gestor). */
export interface InternalAgentDelegationUpdatedEvent {
    sessionId: string;
    messageId: string;
    block: AgentSessionDelegationBlock;
}
