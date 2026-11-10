/**
 * Contratos genéricos do Kanban em escala (SP1 — 2026-07-16).
 * Usados por leads hoje; desenhados para tickets (SP3) e atendimentos (SP4).
 */
/**
 * Valor da coluna separado por status do negócio (só leads — 2026-11-09).
 * `open` = Σ `budget` dos pendentes; `won` = Σ do valor exibido no card dos
 * ganhos (`wonValue` quando > 0, senão `budget`). Perdidos não entram em nenhum.
 */
export interface KanbanValueBreakdown {
    open: number;
    won: number;
}
export interface KanbanColumnPage<T> {
    columnId: string;
    /** Total REAL da coluna no backend, respeitando todos os filtros ativos. */
    count: number;
    /** Soma do campo de valor (leads: budget) da coluna INTEIRA. */
    totalValue: number;
    /** Valor da coluna INTEIRA por status do negócio — só no board de leads. */
    valueBreakdown?: KanbanValueBreakdown;
    items: T[];
    /** Cursor opaco da próxima página; null = fim. */
    nextCursor: string | null;
}
export interface KanbanBoardAggregates {
    /** Σ counts das colunas exibidas. */
    total: number;
    /** Σ totalValue das colunas exibidas. */
    totalValue: number;
    businessStatusCounts: {
        pending: number;
        won: number;
        lost: number;
    };
    priorityCounts: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
}
/** TAggregates com default = retrocompatível com o board de leads (SP1/SP2). */
export interface KanbanBoardResponse<T, TAggregates = KanbanBoardAggregates> {
    columns: KanbanColumnPage<T>[];
    aggregates: TAggregates;
}
/** Modos de ordenação do kanban. Cada módulo suporta um subconjunto (whitelist no backend). */
export type KanbanSortMode = 'created' | 'stepEntered' | 'priority' | 'idle' | 'inactivity' | 'manual';
export declare const LEAD_KANBAN_SORT_MODES: KanbanSortMode[];
/** Aggregates do board de tickets — sem valor monetário (tickets não têm budget). */
export interface TicketKanbanBoardAggregates {
    total: number;
    /** Contagem por statusCategory de TODOS os tickets matched do pipeline (não só janelas). */
    statusCategoryCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
    /**
     * Chamados com SLA violado em TODO o pipeline filtrado (não só nas janelas
     * carregadas). Contado a partir do espelho plano `slaBreached` — a projeção
     * de `sla.clocks` feita por `projectSlaMirror`.
     */
    slaBreachedCount: number;
}
/** Modos de ordenação suportados pelo kanban de tickets (SP3). Sem 'idle' — tickets têm uma única fonte de interação. */
export declare const TICKET_KANBAN_SORT_MODES: readonly ["created", "stepEntered", "priority", "inactivity", "manual"];
/** Modos do kanban de atendimentos (SP4). Sem manual (lanes derivadas) e sem idle (fonte única lastMessageAt). */
export declare const CONVERSATION_KANBAN_SORT_MODES: readonly ["created", "priority", "inactivity"];
/** Lanes fixas do kanban de atendimentos — predicados server-side (SP4 D1). */
export type ConversationKanbanLaneId = 'ai' | 'queue' | 'inService' | 'transferred' | 'closed';
export declare const CONVERSATION_KANBAN_LANE_IDS: readonly ["ai", "queue", "inService", "transferred", "closed"];
/** Aggregates do board de atendimentos — counts por lane já vêm nos `count` das colunas (D4). */
export interface ConversationKanbanBoardAggregates {
    total: number;
}
/**
 * Tamanho do card no board. NÃO é o mesmo card com padding diferente: cada
 * valor corresponde a um desenho distinto, com hierarquia própria — ver
 * `DOCS/superpowers/specs/2026-07-27-kanban-card-density-design.md` § 1.
 *
 * A escolha vale para o board inteiro do módulo e é persistida por navegador
 * (localStorage), no dialeto que cada módulo já usa. Defaults por módulo:
 * CRM `normal`, Help Desk `detailed`, Atendimento `compact`.
 */
export type CardDensity = 'detailed' | 'normal' | 'compact';
/** Ordem canônica de exibição no seletor: do mais denso em informação ao mais enxuto. */
export declare const CARD_DENSITIES: readonly CardDensity[];
/**
 * Guard para o que vem do localStorage. Valor inválido no storage não pode
 * quebrar a tela — o caller cai no default do próprio módulo.
 */
export declare const isCardDensity: (value: unknown) => value is CardDensity;
