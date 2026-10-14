export type DashboardPeriodMode = 'week' | 'month' | 'year' | 'custom';
export interface CommercialDashboardQuery {
    period: DashboardPeriodMode;
    /** Required when period='month' or 'year'. */
    year?: number;
    /** Required when period='month'. */
    month?: number;
    /** Required when period='custom'. ISO date YYYY-MM-DD. */
    startDate?: string;
    /** Required when period='custom'. ISO date YYYY-MM-DD. */
    endDate?: string;
    /**
     * Recorte por unidade. Leads e vendas casam com `capture.unitId` (a foto de
     * onde a captura/venda aconteceu, NUNCA #83); visitas com `view-events.unitId`;
     * atividades (mensagens, ligações, e-mails, reuniões) com os usuários
     * vinculados à unidade. `unitId` vence `unitState`.
     */
    unitId?: string;
    /** UF do endereço da unidade — recorta todas as unidades do estado. */
    unitState?: string;
}
export interface KpiValue {
    value: number;
    deltaPct: number;
    trend: 'up' | 'down' | 'neutral';
}
export interface GoalSummary {
    target: number;
    achieved: number;
    achievedPct: number;
    remaining: number;
    daysRemaining: number;
}
export interface RevenueChartPoint {
    date: string;
    revenue: number;
    /** Vendas (leads ganhos com valor) no bucket — mesma régua de `kpis.deals`. */
    deals: number;
    /** Leads criados no bucket (qualquer status). */
    leads: number;
    /**
     * Visitas medidas no bucket. `null` = nenhuma medição chegou (sensor fora,
     * loja fechada ou empresa sem fonte de visitas) — não é o mesmo que zero.
     */
    visits: number | null;
}
export interface RevenueChart {
    points: RevenueChartPoint[];
    target: number;
    /**
     * `month` em `period='year'` (`date` = `YYYY-MM-01`), `day` nos demais.
     * Opcional só para o frontend aguentar resposta anterior ao campo.
     */
    granularity?: 'day' | 'month';
}
export interface PeriodComparisonItem {
    label: string;
    revenue: number;
    /** Número de vendas no período do slot. */
    deals: number;
    isCurrent: boolean;
}
export interface TeamActivityCounter {
    value: number;
    deltaPct: number;
}
export interface TeamMeetingsCounter extends TeamActivityCounter {
    noShowPct: number;
}
export interface TeamActivitiesSummary {
    calls: TeamActivityCounter;
    emails: TeamActivityCounter;
    messages: TeamActivityCounter;
    meetings: TeamMeetingsCounter;
}
export interface TopPerformer {
    userId: string;
    name: string;
    avatarUrl?: string;
    initials: string;
    revenue: number;
    deals: number;
    conversionRate: number;
    goalPct: number | null;
}
export interface ScorecardActivities {
    calls: number;
    emails: number;
    messages: number;
    meetings: number;
    /** Soma de calls + emails + messages + meetings (atividades totais do user no período). */
    total: number;
}
export interface ScorecardRow {
    userId: string;
    name: string;
    avatarUrl?: string;
    initials: string;
    /** Total de leads atribuídos ao user no período (qualquer status). */
    leads: number;
    revenue: number;
    deals: number;
    conversionRate: number;
    avgTicket: number;
    /**
     * Leads captados pelo vendedor pela página de captura (QR) no período —
     * `capture.sessionUuid` presente, atribuídos por `capture.capturedBy`.
     */
    capturedLeads: number;
    /** Dos `capturedLeads`, quantos estão ganhos (com valor). */
    capturedWon: number;
    /** `capturedWon / capturedLeads × 100` (0 sem captura). */
    capturedConversionRate: number;
    /** Soma de `wonValue` dos `capturedWon`. */
    capturedRevenue: number;
    activities: ScorecardActivities;
    goalPct: number | null;
}
export interface WeeklyHeatmapDay {
    dayOfWeek: 1 | 2 | 3 | 4 | 5;
    revenue: number;
}
export interface WeeklyHeatmapWeek {
    weekStart: string;
    days: WeeklyHeatmapDay[];
    total: number;
}
export interface TopCampaign {
    campaignName: string;
    leads: number;
    won: number;
    revenue: number;
    conversionRate: number;
    deltaPct: number;
}
export interface CommercialDashboardResponse {
    period: {
        type: DashboardPeriodMode;
        start: string;
        end: string;
        label: string;
    };
    /**
     * Recorte de unidade aplicado (eco da query). Ausente = empresa inteira.
     * A meta exibida continua sendo a da EMPRESA — a tela avisa quando há recorte.
     */
    unitFilter?: {
        unitId?: string;
        unitState?: string;
    };
    kpis: {
        revenue: KpiValue;
        deals: KpiValue;
        avgTicket: KpiValue;
        conversionRate: KpiValue;
        /** Leads criados no período (denominador de `conversionRate`). */
        leads: KpiValue;
        /** Leads captados pela página de captura (QR) no período. */
        capturedLeads: KpiValue;
        /** Dos captados no período, quantos estão ganhos (com valor). */
        capturedWon: KpiValue;
        /** `capturedWon / capturedLeads × 100`. */
        capturedConversionRate: KpiValue;
        /** Receita dos captados ganhos. */
        capturedRevenue: KpiValue;
        /** Visitas medidas no período (`view-events`). */
        visits: KpiValue;
        /** `deals / visits × 100` — conversão de loja. 0 sem visitas. */
        visitConversionRate: KpiValue;
    };
    goal: GoalSummary | null;
    revenueChart: RevenueChart;
    comparison: PeriodComparisonItem[];
    teamActivities: TeamActivitiesSummary;
    topPerformers: TopPerformer[];
    scorecard: ScorecardRow[];
    weeklyHeatmap: WeeklyHeatmapWeek[];
    topCampaigns: TopCampaign[];
}
