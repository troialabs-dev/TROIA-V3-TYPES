"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSAT_RATING_VALUES = exports.CSAT_SURVEY_STATUS_LABELS = exports.CSAT_SURVEY_STATUSES = void 0;
// ============================================================================
// RELATÓRIO DE CSAT — Relatórios → CSAT (2026-09-23)
// ============================================================================
//
// Uma linha por atendimento que RECEBEU a pesquisa de satisfação — pelo
// encerramento com o CSAT do canal ligado ou pelo nó "CSAT — Satisfação do
// Cliente" do workflow. A nota é `conversation.satisfaction` (1–5, MENOR =
// melhor; 0 = não coletada). Permissão própria: módulo `reports-csat`.
/**
 * Situação da pesquisa de um atendimento.
 * - 'answered': o cliente escolheu uma opção válida (nota 1–5)
 * - 'invalid': 3 respostas que não casaram com opção nenhuma (nota 0)
 * - 'awaiting': enviada, ainda dentro do prazo de resposta do canal
 * - 'no_answer': enviada, prazo vencido sem resposta
 */
exports.CSAT_SURVEY_STATUSES = ['answered', 'invalid', 'awaiting', 'no_answer'];
/** Nome de cada situação — o mesmo na tela e na planilha exportada. */
exports.CSAT_SURVEY_STATUS_LABELS = {
    answered: 'Respondida',
    invalid: 'Resposta inválida',
    awaiting: 'Aguardando resposta',
    no_answer: 'Sem resposta',
};
/** Notas válidas — 1 é a MELHOR (escala do `ChannelSatisfactionOption`). */
exports.CSAT_RATING_VALUES = [1, 2, 3, 4, 5];
