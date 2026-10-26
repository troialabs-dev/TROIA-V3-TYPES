export interface ConversationPrivacy {
    enabled: boolean;
    users: string[];
}
/**
 * Quem enviou a última fala da conversa (desnormalizado de
 * `ConversationMessage.senderType`). `'system'` está deliberadamente fora:
 * mensagens system não atualizam `lastMessage*` (não são fala da conversa).
 */
export type ConversationLastMessageSenderType = 'contact' | 'user' | 'ai' | 'automation' | 'automation-follow';
/**
 * Por que a corrente de transferências por inatividade de uma espera acabou
 * sem resposta (spec 2026-09-29-transferencia-por-inatividade, D4/D6):
 * - `max_transfers`: atingiu o limite do canal;
 * - `no_candidate`: não sobrou ninguém para receber;
 * - `fixed_operator_reached`: chegou na pessoa fixa (a corrente termina nela);
 * - `fixed_operator_invalid`: a pessoa fixa não é mais usuário ativo.
 */
export type InactivityTransferEndReason = 'max_transfers' | 'no_candidate' | 'fixed_operator_reached' | 'fixed_operator_invalid';
/**
 * Estado da espera do cliente para a transferência automática por
 * inatividade. Ausente = relógio desligado nesta conversa. Datas em ISO na
 * API (`Date` no banco); ids como string na API (`ObjectId` no banco).
 *
 * O estado só some com uma resposta humana, fechamento, reabertura,
 * desatribuição ou IA ativa — mensagem nova do cliente NUNCA reinicia a
 * corrente de uma espera que já existe (I2).
 */
export interface ConversationInactivityTransferState {
    /** Quando o cliente passou a esperar uma pessoa (informativo). */
    waitingSince: string;
    /** Início da janela atual — âncora do prazo. Regravado ao armar, rearmar e transferir. */
    armedAt: string;
    /** Responsável da janela atual. */
    armedForUserId: string;
    /** Prazo da janela atual. Ausente = corrente encerrada (`endedAt`). */
    dueAt?: string;
    /** Corrente encerrada sem resposta. O estado fica até resposta, fechamento ou desatribuição. */
    endedAt?: string;
    endedReason?: InactivityTransferEndReason;
    /** Transferências já feitas nesta espera. */
    transfers: number;
    /** Quem já deixou esta espera sem resposta — não volta no rodízio dela (D6). */
    skippedUserIds: string[];
}
/**
 * Estado da janela de mensageria da Meta para a conversa.
 *
 * Presente APENAS quando o canal é Meta oficial (whatsapp-business,
 * instagram-messaging, facebook-messenger). Ausente = a política não se aplica.
 *
 * Derivado na leitura a partir de `lastMessageFromCustomer` — não é persistido.
 */
export interface MessagingWindow {
    isOpen: boolean;
    /**
     * ISO. lastMessageFromCustomer + 24h.
     * Ausente ⟺ o cliente nunca escreveu — nesse caso `isOpen` é sempre false,
     * porque não existe janela a expirar.
     */
    expiresAt?: string;
    /** O que reabre a conversa neste canal. Instagram/Messenger não têm template. */
    reopenWith: 'template' | 'customer_only';
}
/**
 * Prioridade de uma conversa. ATENÇÃO: o enum de conversas usa `'normal'`,
 * NÃO `'medium'` — difere de leads e tickets (ver `kanban-sort.ts` do módulo
 * conversations, que já documenta a divergência no peso de ordenação).
 */
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';
/**
 * Leitura de UM relógio de SLA já resolvida pelo SERVIDOR, para o card do
 * board de Atendimento.
 *
 * Existe porque o frontend NÃO possui o calendário de horário comercial: a
 * barra de esfriamento precisa de tempo ÚTIL, e tempo útil só pode ser
 * calculado por quem tem `company.businessCalendar` + `company.timezone` +
 * a tabela de feriados. Um cliente que subtraísse `Date.now() - lastMessageAt`
 * pintaria de vermelho toda a sexta-feira 18:01 até segunda 08:00, para um
 * alvo que não consumiu um único minuto.
 *
 * `measuredAt` é o instante do SERVIDOR em que `elapsedBusinessMs` e
 * `remainingBusinessMs` foram medidos. O card NÃO extrapola a partir dele
 * (não dá: o relógio pode atravessar o fim do expediente entre duas
 * leituras) — quem atualiza é o refetch de 60s do board
 * (`useAttendanceKanban`, `refetchInterval: 60_000`).
 */
export interface ConversationSlaSnapshot {
    clockKey: SlaClockKey;
    state: SlaClockState;
    /** ISO. Instante absoluto do vencimento, já em tempo útil. */
    dueAt: string;
    targetMs: number;
    /** Tempo útil consumido a partir do qual o nível vira `warning`. */
    warnAtMs: number;
    elapsedBusinessMs: number;
    /** `targetMs - elapsedBusinessMs`. Negativo = já estourado. */
    remainingBusinessMs: number;
    useBusinessHours: boolean;
    measuredAt: string;
}
/**
 * Limiares da política de primeira resposta resolvidos para o contexto do
 * board (empresa + canal opcional). Alimenta a legenda da barra e serve de
 * piso quando um card ainda não tem relógio (conversa sem inbound).
 *
 * `source: 'fallback'` significa que NENHUMA política de conversa casou —
 * nesse caso os números vêm das constantes do frontend e a UI deve dizer
 * "padrão do sistema", nunca inventar um nome de política.
 */
export interface ConversationSlaThresholdsResponse {
    policyId: string | null;
    policyName: string | null;
    targetMs: number;
    warnAtMs: number;
    useBusinessHours: boolean;
    source: 'policy' | 'fallback';
}
/**
 * Carrega o carimbo de autoria (`createdBy` + `createdByType`) desde
 * 2026-08-30. Os dois são opcionais: registro anterior a essa data não tem a
 * informação, e ausente é a verdade. Ver `CreatorStamp` em `common.ts`.
 */
export interface Conversation extends CreatorStamp {
    id: string;
    appId: string;
    companyId: string;
    subject?: string;
    status: 'waiting' | 'active' | 'closed';
    priority: ConversationPriority;
    closeReason?: 'resolved' | 'spam' | 'duplicate' | 'no_response' | 'transferred' | 'expired' | 'other';
    closeNotes?: string;
    isReturn?: boolean;
    channelId: string;
    conversationType?: 'individual' | 'group';
    providerConversationId?: string;
    source: string;
    /**
     * @deprecated Use `contact.customerId`.
     *
     * Campo ÓRFÃO: nenhum fluxo de negócio o escreve — só o CRUD genérico
     * escrevia, e `CreateConversationSchema`/`UpdateConversationSchema` deixaram
     * de aceitá-lo (C7, 2026-08-19). A LEITURA continua tolerante e o dado NÃO é
     * apagado do banco (reversível). O vínculo de verdade é `Contact.customerId`.
     */
    customerId?: string;
    userId?: string;
    contactId?: string;
    groupId?: string;
    contact?: {
        id: string;
        name: string;
        picture?: string;
        phone?: string;
        tags?: string[];
        /**
         * FK do vínculo real contato ↔ Cliente (`Contact.customerId`). É ESTE o
         * campo que o header do atendimento usa — não `Conversation.customerId`
         * (órfão, ver abaixo) nem `Lead.customerId` (cliente resultante da
         * conversão do lead).
         */
        customerId?: string;
        /**
         * Cliente já resolvido pelo backend — só o necessário para a pílula do
         * header. Populado nos DOIS caminhos de projeção do
         * `conversations/repository.ts` (Two-Phase Fetch e aggregation); se só um
         * for alterado, o cliente aparece de forma intermitente conforme a rota.
         */
        customer?: {
            id: string;
            name: string;
        };
        /** Contato bloqueado nesta empresa (2026-09-01). Ver contacts.ts. */
        blocked?: boolean;
    };
    group?: {
        id: string;
        name: string;
        picture?: string;
    };
    members?: Array<{
        id: string;
        name: string;
        picture?: string;
        phone?: string;
        role: 'admin' | 'member';
        joinedAt: string;
    }>;
    leadId?: string;
    ticketId?: string;
    assigneeId?: string;
    assignee?: {
        id: string;
        name: string;
        picture?: string;
    };
    teamId?: string;
    assignmentType?: string;
    assignedAt?: string;
    assignedBy?: string;
    agentId?: string;
    agentStatus?: 'active' | 'inactive' | 'paused';
    /** Nota CSAT: 0 = não coletada (3 tentativas inválidas); 1–5 = nota (menor = melhor) */
    satisfaction?: number;
    /** Pesquisa CSAT enviada, aguardando resposta do contato */
    satisfactionPending?: boolean;
    /** Tentativas de resposta inválida (0–3) */
    satisfactionTryings?: number;
    /** Quando a nota foi registrada (ISO na API; Date no banco) */
    satisfactionAt?: string;
    /** Auto-respostas fora do horário já enviadas nesta conversa (máx 3) */
    outOfHoursTryings?: number;
    /** Quando saiu o último aviso fora do horário (ISO na API; Date no banco) — no máximo 1 por hora */
    outOfHoursLastSentAt?: string;
    /** Espera do cliente para a transferência automática por inatividade — ausente = relógio desligado */
    inactivityTransfer?: ConversationInactivityTransferState;
    /**
     * Cliente esperando uma PESSOA numa conversa ainda sem responsável (fila),
     * num canal com a transferência por inatividade ligada. Quando alguém
     * assumir a conversa, o relógio arma a partir daí — mesmo que uma mensagem
     * automática (fora do horário, boas-vindas) tenha saído depois do cliente.
     * Some com resposta humana, fechamento ou quando o relógio arma.
     */
    inactivityAwaitingSince?: string;
    /**
     * Última resposta de uma PESSOA da empresa (tela ou celular), ISO na API /
     * Date no banco. Só avança. Impede que uma mensagem do cliente anterior a
     * essa resposta, processada depois dela, arme o relógio por engano.
     */
    lastHumanReplyAt?: string;
    provider?: {
        id: string;
        name: string;
        type: string;
        logo?: string;
    };
    messageCount: number;
    lastMessage?: string;
    lastMessageAt?: string;
    /**
     * Direção da ÚLTIMA fala da conversa — desnormalizada junto com
     * `lastMessage`/`lastMessageAt` (Tarefa 14). `'inbound'` = o cliente falou por
     * último (nós devemos resposta); `'outbound'` = nós falamos por último.
     *
     * Mensagem interna (`isInternal: true`) NÃO atualiza este campo, pelo mesmo
     * motivo que não atualiza a prévia: nota interna e registro de transferência
     * não são fala da conversa.
     *
     * Ausente em conversas antigas fora da janela da migration
     * `2026-07-27-002-backfill-conversation-last-message-direction` — o card
     * simplesmente não mostra o indicador de direção nesse caso, e o campo passa
     * a existir na próxima mensagem real.
     */
    lastMessageDirection?: 'inbound' | 'outbound';
    /**
     * Quem enviou a ÚLTIMA fala da conversa — desnormalizado junto com
     * `lastMessage`/`lastMessageAt`/`lastMessageDirection` (2026-08-04); os
     * quatro descrevem a MESMA mensagem e nunca podem divergir.
     *
     * Mensagem interna (`isInternal: true`) e mensagem `senderType: 'system'`
     * NÃO atualizam este campo (nem os irmãos): nota interna, registro de
     * transferência e injeções de contexto para o agente (webhook/skill) não são
     * fala da conversa — por isso `'system'` está fora do union.
     *
     * Consumido pelos filtros de trigger de workflow ("Quem enviou a última
     * mensagem" — inatividade/data via query Mongo, evento via contexto).
     * Ausente em conversas antigas fora da janela da migration de backfill
     * `2026-08-04-001-backfill-conversation-last-message-sender-type`.
     */
    lastMessageSenderType?: ConversationLastMessageSenderType;
    lastMessageFromCustomer?: string;
    /**
     * ✅ Computed (not stored in database) — só em canais Meta oficiais.
     *
     * ⚠️ Populado apenas nas leituras cujo pipeline hidrata `provider` via
     * aggregation — na prática, qualquer método do repository que passa por
     * `enrichConversations` (privado) ou pelo pipeline próprio de `findById`.
     * Exemplos atuais — lista ilustrativa, não fechada; cresce a cada endpoint
     * novo que reaproveite um desses dois caminhos — inclui `GET /conversations`,
     * `GET /conversations/:id`, `GET /conversations/history`,
     * `GET /conversations/history/:contactId/:channelId`,
     * `GET /conversations/kanban` e `GET /conversations/kanban/column`.
     *
     * Ausente nas respostas de mutação que devolvem o doc bruto do Mongo sem
     * reidratar `provider` — ex.: `PUT /conversations/:id` (usa `findOneAndUpdate`
     * direto). Não usar essas respostas para decidir o estado do composer.
     */
    messagingWindow?: MessagingWindow;
    firstResponseTime?: number;
    averageResponseTime?: number;
    tags: string[];
    category?: string;
    privacy?: ConversationPrivacy;
    muted?: boolean;
    userRole?: 'viewer' | 'attendant';
    metadata?: Record<string, unknown>;
    unreadTracking?: {
        [userId: string]: {
            count: number;
            lastResetAt: string;
            autoResetOnOpen: boolean;
        };
    };
    /**
     * Relógios de SLA da conversa. Escritor ÚNICO:
     * `ConversationsRepository.writeSlaClocks` (que deriva os três espelhos
     * planos abaixo internamente — esquecê-los é estruturalmente impossível).
     *
     * NUNCA gravável pela API: `UpdateConversationSchema` não lista estes
     * campos e o Zod descarta o que não lista (regra 51).
     *
     * Chaves possíveis: `first_response` (recorrente — uma instância por
     * rodada de "cliente falou, devemos resposta") e `resolution` (uma por
     * conversa, encerrada no fechamento).
     */
    sla?: SlaState;
    /** Espelho plano: QUALQUER relógio em `breached`. */
    slaBreached?: boolean;
    /**
     * Espelho plano do prazo mais crítico, em ISO. É o campo lido pelo
     * gatilho de workflow `trigger_date_field` — por isso é plano e por isso
     * é `$unset` (e não `null`) quando não há relógio: o gatilho trata `null`
     * como valor e dispararia sobre "sem prazo".
     *
     * O dedupe do gatilho de data é por BALDE DE DIA em UTC
     * (`WorkflowsRepository.dateFieldDayBucket`, `d.toISOString().slice(0,10)`,
     * repository.ts:880-882, com claim atômico por índice único em
     * :897-926). Consequência: uma conversa cujo `slaBreachTime` se mova duas
     * vezes no MESMO dia dispara o workflow no máximo UMA vez. É aceitável e
     * deliberado — mas precisa estar escrito, porque a alternativa (dedupe por
     * valor de prazo) faria uma retomada de pausa disparar de novo.
     */
    slaBreachTime?: string;
    /**
     * Alias de LEITURA de `slaBreachTime`, em paridade literal com `Ticket`.
     *
     * DECISÃO DESTE PLANO (o contrato §6 deixava em aberto): a conversa
     * ESPELHA os três campos planos, `slaDueAt` inclusive. É o nome que o card
     * compacto do board lê — o mesmo que o `TicketCard` já usa —, e ter dois
     * nomes para o mesmo instante custa um campo, enquanto divergir por
     * entidade custaria um ramo em toda superfície compartilhada.
     *
     * ⚠️ O MECANISMO é diferente dos outros dois, e a diferença importa: quem
     * ESCREVE é `projectSlaMirror` (dentro de `writeSlaClocks`), e ele só produz
     * `slaBreached` + `slaBreachTime`. `slaDueAt` NÃO tem escritor — é campo
     * legado, e `buildSlaWriteOps` faz `$unset` dele em toda escrita, de
     * propósito. O alias nasce no mapper de LEITURA do repositório
     * (`slaDueAt ?? slaBreachTime`). Não "acrescente" `slaDueAt` ao projetor
     * achando que ele ficou de fora por esquecimento.
     */
    slaDueAt?: string;
    startedAt: string;
    endedAt?: string;
    closedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateConversationRequest {
    subject?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    status?: 'waiting' | 'active' | 'closed';
    channelId: string;
    conversationType?: 'individual' | 'group';
    providerConversationId?: string;
    source: string;
    customerId?: string;
    contactId?: string;
    groupId?: string;
    leadId?: string;
    ticketId?: string;
    assigneeId?: string;
    teamId?: string;
    agentId?: string;
    agentStatus?: 'active' | 'inactive' | 'paused';
    tags?: string[];
    category?: string;
    privacy?: ConversationPrivacy;
    metadata?: Record<string, unknown>;
    /** Template oficial a enviar ao iniciar a conversa (canais whatsapp-business). */
    templateId?: string;
    /** Valores das variáveis do template, por posição: { "1": "João", "2": "ACME" }. */
    templateVariables?: Record<string, string>;
}
export interface UpdateConversationRequest {
    subject?: string;
    status?: 'waiting' | 'active' | 'closed';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    conversationType?: 'individual' | 'group';
    closeReason?: 'resolved' | 'spam' | 'duplicate' | 'no_response' | 'transferred' | 'expired' | 'other';
    closeNotes?: string;
    customerId?: string;
    contactId?: string;
    groupId?: string;
    leadId?: string;
    ticketId?: string;
    assigneeId?: string;
    teamId?: string;
    agentId?: string;
    agentStatus?: 'active' | 'inactive' | 'paused';
    tags?: string[];
    category?: string;
    privacy?: ConversationPrivacy;
    metadata?: Record<string, unknown>;
}
export type ConversationResponse = Conversation;
export interface ConversationQuery extends PaginationQuery {
    filters?: {
        search?: string;
        subject?: string;
        status?: 'waiting' | 'active' | 'closed' | Array<'waiting' | 'active' | 'closed'>;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        channelId?: string | string[];
        channelIds?: string[];
        _accessFilter?: Record<string, unknown>;
        channelType?: 'whatsapp' | 'instagram' | 'email' | 'chat' | 'sms' | 'telegram' | 'facebook' | 'widget';
        conversationType?: 'individual' | 'group' | 'ai';
        providerId?: string;
        source?: string;
        excludeSource?: string;
        customerId?: string;
        contactId?: string;
        leadId?: string;
        ticketId?: string;
        groupId?: string;
        assigneeId?: string | string[];
        teamId?: string;
        category?: string;
        tags?: string[];
        stepId?: string[];
        contactCustomerId?: string[];
        conversationTags?: string[];
        excludeConversationTags?: string[];
        hasUnreadMessages?: boolean;
        createdFrom?: string;
        createdTo?: string;
        lastMessageFrom?: string;
        lastMessageTo?: string;
    };
}
export interface ConversationListResponse extends ListResponse<ConversationResponse> {
}
/** Linha do histórico agrupado: a conversa fechada mais recente do par (contato, canal) + contagem */
export interface ConversationHistoryGroupResponse extends ConversationResponse {
    conversationCount: number;
}
export interface ConversationHistoryGroupListResponse extends ListResponse<ConversationHistoryGroupResponse> {
}
export type ConversationMediaType = 'image' | 'video' | 'audio' | 'document';
export interface ConversationMediaItem {
    messageId: string;
    type: ConversationMediaType;
    url: string;
    caption?: string;
    filename?: string;
    thumbnailUrl?: string;
    size?: number;
    mimeType?: string;
    sentAt: string;
}
export interface ConversationMediaCounts {
    total: number;
    image: number;
    video: number;
    audio: number;
    document: number;
}
export interface ConversationMediaQuery extends PaginationQuery {
    type?: ConversationMediaType;
}
export interface ConversationMediaListResponse {
    items: ConversationMediaItem[];
    total: number;
    page: number;
    limit: number;
    counts: ConversationMediaCounts;
}
export interface AssignConversationRequest {
    assigneeId?: string;
    teamId?: string;
    assignmentType?: string;
}
export interface TransferConversationRequest {
    fromAssigneeId?: string;
    toAssigneeId?: string;
    fromTeamId?: string;
    toTeamId?: string;
    reason?: string;
    notes?: string;
}
export interface CloseConversationRequest {
    reason?: string;
    notes?: string;
    rating?: number;
}
export interface ConversationStats {
    total: number;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    byPriority: Record<string, number>;
    averageResponseTime: number;
    totalUnread: number;
}
export interface BulkConversationOperationRequest {
    conversationIds: string[];
    operation: 'assign' | 'transfer' | 'close' | 'addTag' | 'removeTag' | 'changeStatus' | 'changePriority';
    data?: {
        assigneeId?: string;
        teamId?: string;
        status?: 'waiting' | 'active' | 'closed';
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        tag?: string;
        reason?: string;
        notes?: string;
    };
}
/** Projeção enxuta da conversa para o card do kanban (SP4) — só o que os cards de Atendimento renderizam. */
export interface ConversationKanbanCard {
    id: string;
    status: 'waiting' | 'active' | 'closed';
    subject?: string;
    source?: string;
    agentId?: string;
    agentStatus?: 'active' | 'inactive' | 'paused';
    assigneeId?: string;
    closeReason?: 'resolved' | 'spam' | 'duplicate' | 'no_response' | 'transferred' | 'expired' | 'other';
    lastMessage?: string;
    lastMessageAt?: string;
    /** Quem falou por último. Alimenta os cards Normal (01) e Compacto (06). */
    lastMessageDirection?: 'inbound' | 'outbound';
    /**
     * Relógio de primeira resposta já medido pelo servidor. Ausente em DOIS
     * casos — conversa que nunca recebeu inbound e empresa sem política de
     * conversa —, e só neles o card cai no fallback de tempo de parede do
     * `cooldown.ts`.
     *
     * ⚠️ Relógio PARADO (`met`/`cancelled`) continua vindo: o repositório
     * projeta o relógio existente seja qual for o estado, e o `cooldown.ts` o
     * trata DENTRO do ramo do SLA (nível `neutral`, `source: 'sla'`). Card com
     * atendimento respondido não volta a medir parede.
     */
    sla?: ConversationSlaSnapshot;
    /** Persistida na conversa (default 'normal'); o board JÁ ordena por ela (sortMode 'priority'). */
    priority?: ConversationPriority;
    /** Tags da CONVERSA. Omitido quando vazio. */
    tags?: string[];
    /** Tags do CONTATO (hidratadas via `enrichConversations`). Omitido quando vazio. */
    contactTags?: string[];
    /** Nome do canal (não do provider). O ícone/cor de marca continua vindo de `providerType`. */
    channelName?: string;
    /**
     * Início do ATENDIMENTO (status → 'active'). Ausente enquanto a conversa está
     * em fila — NÃO cai para `createdAt` (diferente do `ConversationResponse.startedAt`,
     * que é obrigatório no tipo e por isso coalesce). Tempo em fila = startedAt − createdAt.
     */
    startedAt?: string;
    /** Computado server-side a partir de `unreadTracking[userId]` (campo é por-usuário). */
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
    /** `blocked` presente e `true` só quando o contato está bloqueado (2026-09-01). Ver contacts.ts. */
    contact?: {
        id: string;
        name: string;
        picture?: string;
        phone?: string;
        blocked?: boolean;
    };
    assignee?: {
        id: string;
        name: string;
        picture?: string;
    };
    /** Derivado da hidratação channel→integration (mesma que `enrichConversations` já faz). */
    providerType?: string;
}
/** Query do board de atendimentos (GET /conversations/kanban). */
export interface ConversationKanbanQuery {
    search?: string;
    /** Tamanho da janela por coluna (default 50, máx 100 — validado no backend). */
    windowSize?: number;
    /** Modo de ordenação (default 'created'). Whitelist em CONVERSATION_KANBAN_SORT_MODES. Import de './kanban'. */
    sortMode?: KanbanSortMode;
    /** Subset de ConversationQuery.filters — status NÃO existe aqui (é a raia). */
    filters?: {
        channelId?: string;
        assigneeId?: string;
        teamId?: string;
        providerId?: string;
    };
}
/** Página de UMA coluna (lane) do kanban de atendimentos — extende o board com laneId + cursor. */
export interface ConversationKanbanColumnQuery extends ConversationKanbanQuery {
    laneId: ConversationKanbanLaneId;
    cursor?: string;
}
import { CreatorStamp, ListResponse, PaginationQuery } from './common';
import type { KanbanSortMode, ConversationKanbanLaneId } from './kanban';
import type { SlaClockKey, SlaClockState, SlaState } from './sla';
