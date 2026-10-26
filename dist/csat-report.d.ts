import type { ListResponse } from './common';
/**
 * Situação da pesquisa de um atendimento.
 * - 'answered': o cliente escolheu uma opção válida (nota 1–5)
 * - 'invalid': 3 respostas que não casaram com opção nenhuma (nota 0)
 * - 'awaiting': enviada, ainda dentro do prazo de resposta do canal
 * - 'no_answer': enviada, prazo vencido sem resposta
 */
export declare const CSAT_SURVEY_STATUSES: readonly ["answered", "invalid", "awaiting", "no_answer"];
export type CsatSurveyStatus = (typeof CSAT_SURVEY_STATUSES)[number];
/** Nome de cada situação — o mesmo na tela e na planilha exportada. */
export declare const CSAT_SURVEY_STATUS_LABELS: Record<CsatSurveyStatus, string>;
/** Notas válidas — 1 é a MELHOR (escala do `ChannelSatisfactionOption`). */
export declare const CSAT_RATING_VALUES: readonly [1, 2, 3, 4, 5];
export type CsatRatingValue = (typeof CSAT_RATING_VALUES)[number];
/**
 * Filtros do relatório. Período inclusivo sobre o ENCERRAMENTO do atendimento
 * (é quando a pesquisa sai): instante ISO 8601 — a tela manda o início e o fim
 * do dia no fuso do navegador — ou `YYYY-MM-DD`, que vale o dia inteiro em UTC.
 */
export interface CsatReportFilters {
    startDate?: string;
    endDate?: string;
    channelId?: string;
    teamId?: string;
    /** Atendente responsável pela conversa no encerramento. */
    assigneeId?: string;
    /** Agente de IA da conversa. */
    agentId?: string;
    status?: CsatSurveyStatus;
    rating?: CsatRatingValue;
}
export interface CsatReportQuery extends CsatReportFilters {
    page?: number;
    limit?: number;
}
export interface CsatReportRef {
    id: string;
    name: string;
}
export interface CsatReportItem {
    conversationId: string;
    /** Encerramento do atendimento (ISO) — quando a pesquisa foi enviada. */
    endedAt: string | null;
    /** Quando a nota foi registrada (ISO). Também preenchido em 'invalid'. */
    answeredAt: string | null;
    status: CsatSurveyStatus;
    /** 1–5 quando `answered`; null nas demais situações. */
    rating: CsatRatingValue | null;
    /** Legenda e emoji da opção como o CANAL configurou (ou os padrão). */
    ratingLabel: string | null;
    ratingEmoji: string | null;
    contact: {
        id: string;
        name: string | null;
        phone: string | null;
    } | null;
    channel: CsatReportRef | null;
    assignee: CsatReportRef | null;
    team: CsatReportRef | null;
    agent: CsatReportRef | null;
}
export type CsatReportListResponse = ListResponse<CsatReportItem>;
/**
 * Resumo do recorte. Usa os mesmos filtros da lista, MENOS situação e nota —
 * senão a taxa de resposta de "só respondidas" daria sempre 100%.
 */
export interface CsatReportSummary {
    /** Pesquisas enviadas (= answered + invalid + awaiting + noAnswer). */
    sent: number;
    answered: number;
    invalid: number;
    awaiting: number;
    noAnswer: number;
    /** answered ÷ (answered + invalid + noAnswer), em %. null sem pesquisa com prazo encerrado. */
    responseRate: number | null;
    /** Média das notas 1–5 (MENOR = melhor). null sem resposta. */
    averageRating: number | null;
    /** Quantas respostas de cada nota — sempre as 5 posições, na ordem 1→5. */
    distribution: Array<{
        value: CsatRatingValue;
        count: number;
    }>;
}
