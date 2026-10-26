/**
 * Dashboard de Analytics — extrato de visitas medidas.
 *
 * Consome o módulo `views`. Hoje a única fonte é o contador de fluxo físico
 * (Best Flow); a modelagem já é agnóstica para receber site/GA depois — por
 * isso o recorte é por `source`/`channel`/`origin`, o mesmo vocabulário do
 * rastreamento de leads, e não por "loja".
 */
import type { DashboardPeriodMode, KpiValue } from './dashboards-commercial';
import type { LeadChannel, LeadMedium, LeadSource } from './leads';
/** Granularidade da série, derivada do período (nunca escolhida pelo usuário). */
export type VisitsGranularity = 'day' | 'month';
/**
 * Recorte de procedência dos LEADS contados na tela.
 *
 * `capture_page` = lead que veio da página pública de captura por QR Code — o
 * lead que tem sessão de captura gravada (`capture.sessionUuid`). É o único
 * sinal que sobrevive a uma venda do ERP reaproveitar o mesmo lead.
 */
export declare const VISITS_LEAD_ORIGIN_FILTERS: readonly ["capture_page"];
export type VisitsLeadOriginFilter = (typeof VISITS_LEAD_ORIGIN_FILTERS)[number];
/** Status do lead (`businessStatus`) — lead sem o campo conta como `pending`. */
export declare const VISITS_LEAD_STATUS_FILTERS: readonly ["pending", "won", "lost"];
export type VisitsLeadStatusFilter = (typeof VISITS_LEAD_STATUS_FILTERS)[number];
export interface VisitsAnalyticsQuery {
    period: DashboardPeriodMode;
    year?: number;
    month?: number;
    startDate?: string;
    endDate?: string;
    unitId?: string;
    /**
     * UF do endereço da unidade (`SC`, `PR`…) — recorta a tela para TODAS as
     * unidades daquele estado. `unitId` é mais específico e vence quando os dois
     * chegam juntos.
     */
    unitState?: string;
    channel?: LeadChannel;
    origin?: string;
    source?: LeadSource;
    /**
     * Só valem para o que conta LEADS (barra, card e mapa de calor na métrica
     * `leads`). Visitas e vendas não mudam: são outra coisa.
     */
    leadOrigin?: VisitsLeadOriginFilter;
    leadStatus?: VisitsLeadStatusFilter;
}
export interface VisitsEntriesQuery extends VisitsAnalyticsQuery {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
}
export interface VisitsSeriesPoint {
    /** `YYYY-MM-DD` (ou `YYYY-MM-01` em modo ano), no fuso da empresa. */
    date: string;
    views: number;
    /**
     * `false` = NENHUMA unidade reportou neste bucket.
     *
     * É a distinção que o gráfico precisa fazer: o contador de fluxo **omite** a
     * janela sem movimento, então ausência de registro é indistinguível de
     * sensor quebrado. Um dia `measured: true, views: 0` é "a loja abriu e
     * ninguém entrou"; `measured: false` é "não sabemos". Mostrar os dois como
     * zero transformaria falha de coleta em queda de movimento.
     */
    measured: boolean;
    unitsReporting: number;
    /**
     * Negócios ganhos no mesmo bucket (`businessStatus: 'won'` com valor > 0),
     * pela data da VENDA — não pela de criação do lead.
     *
     * Independente de `measured`: a venda aconteceu mesmo num dia em que nenhuma
     * unidade reportou fluxo. O gráfico desenha as duas séries separadamente
     * justamente por isso.
     */
    sales: number;
    /** Receita dos negócios ganhos no bucket. */
    revenue: number;
    /**
     * Leads criados no bucket, pela data de CRIAÇÃO — mesma definição do mapa de
     * calor na métrica `leads`. Independente de `measured`, como `sales`.
     */
    leads: number;
}
/**
 * Leads do período com a conversão de visitas em leads.
 *
 * `conversionPct` é `null` quando o período não tem nenhuma visita medida:
 * dividir por zero não é "0%", é "não dá para saber".
 */
export interface VisitsLeadsKpi extends KpiValue {
    /** `leads ÷ visitas × 100` no período inteiro. */
    conversionPct: number | null;
}
export interface VisitsHourPoint {
    /** 0-23, no fuso da empresa. */
    hour: number;
    views: number;
    measured: boolean;
}
export interface VisitsHeatmapCell {
    /** 1 = segunda … 7 = domingo (ISO). */
    dayOfWeek: number;
    hour: number;
    views: number;
}
export interface VisitsBreakdownRow {
    key: string;
    label: string;
    views: number;
    sharePct: number;
    deltaPct: number;
    /**
     * `true` = reportou no período anterior e sumiu neste. Detector de sensor
     * quebrado — a linha NÃO mostra delta, porque -100% aqui é falha de coleta,
     * não queda de movimento.
     */
    wentSilent: boolean;
}
export interface VisitsCoverage {
    unitsReporting: number;
    /** Unidades que reportaram nos 30 dias ANTERIORES ao fim do período. */
    unitsExpected: number;
    /** Fim da última janela medida, ISO. Alimenta o "medido até". */
    coverageUntil: string | null;
    /** `true` = o período pedido termina depois da última medição. */
    isPartial: boolean;
}
/** Uma fonte de visitas conectada, como a tela mostra. */
export interface VisitsSourceCard {
    integrationId: string;
    providerId: string;
    providerName: string;
    name: string;
    status: string;
    lastSyncedAt: string | null;
    lastError: string | null;
    /** `true` = credencial recusada; a integração precisa ser reconectada. */
    needsReconnect: boolean;
    /**
     * Config da integração — o que o formulário de edição consegue pré-preencher.
     *
     * Seguro por desenho: credencial NUNCA mora em `config` (é a razão de existir
     * o campo `credentials`, protegido por projeção). Um provider que gravasse
     * senha aqui já a estaria vazando no `GET /company-integrations`, que devolve
     * o config inteiro.
     */
    config?: Record<string, unknown>;
}
export interface VisitsAnalyticsResponse {
    period: {
        type: DashboardPeriodMode;
        start: string;
        end: string;
        label: string;
        timezone: string;
    };
    granularity: VisitsGranularity;
    kpis: {
        totalViews: KpiValue;
        dailyAvg: KpiValue;
        peakDay: {
            date: string;
            views: number;
        } | null;
        peakHour: {
            hour: number;
            views: number;
        } | null;
        leads: VisitsLeadsKpi;
    };
    series: VisitsSeriesPoint[];
    byHour: VisitsHourPoint[];
    heatmap: VisitsHeatmapCell[];
    byUnit: VisitsBreakdownRow[];
    byChannel: VisitsBreakdownRow[];
    byOrigin: VisitsBreakdownRow[];
    bySource: VisitsBreakdownRow[];
    coverage: VisitsCoverage;
    sources: VisitsSourceCard[];
    availableFilters: {
        units: Array<{
            id: string;
            name: string;
        }>;
        channels: LeadChannel[];
        origins: string[];
        sources: LeadSource[];
    };
}
export interface VisitsEntryRow {
    id: string;
    startedAt: string;
    endedAt: string;
    unitId?: string;
    unitName?: string;
    source: LeadSource;
    medium?: LeadMedium;
    channel: LeadChannel;
    origin: string;
    views: number;
    /** `> 1` = a fonte mandou mais de uma linha para esta janela (janela ambígua). */
    occurrences: number;
}
export interface VisitsEntriesResponse {
    items: VisitsEntryRow[];
    total: number;
    page: number;
    limit: number;
}
export declare const DAY_HOUR_METRICS: readonly ["visits", "leads", "sales"];
export type DayHourMetric = (typeof DAY_HOUR_METRICS)[number];
/**
 * Uma célula do mapa de calor, seja qual for a métrica.
 *
 * Mantém a convenção do heatmap de visitas (`VisitsHeatmapCell`): `dayOfWeek`
 * ISO com 1 = segunda, e hora no fuso da empresa. É o que permite ao mesmo
 * componente pintar as três métricas sem conversão.
 */
export interface DayHourCell {
    /** 1 = segunda … 7 = domingo (ISO). */
    dayOfWeek: number;
    hour: number;
    /** Visitas somadas, leads criados ou negócios ganhos — conforme a métrica. */
    value: number;
    /** Só em `sales`: receita dos negócios ganhos na célula. */
    revenue?: number;
}
export interface DayHourResponse {
    metric: DayHourMetric;
    cells: DayHourCell[];
    total: number;
    /** Só em `sales`. */
    revenueTotal?: number;
}
export interface DayHourQuery extends VisitsAnalyticsQuery {
    metric: DayHourMetric;
}
