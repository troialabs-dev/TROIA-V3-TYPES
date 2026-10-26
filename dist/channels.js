"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CHANNEL_INACTIVITY_TRANSFER_CONFIG = exports.DEFAULT_CHANNEL_SATISFACTION_CONFIG = void 0;
/**
 * Pesquisa padrão do sistema — FONTE ÚNICA (2026-09-23). A tela do canal
 * pré-preenche com ela, e o nó "CSAT — Satisfação do Cliente" do workflow a
 * usa quando o canal nunca configurou a própria pesquisa. `enabled: false`:
 * o padrão não liga a pesquisa em canal nenhum (day-0 off continua valendo).
 */
exports.DEFAULT_CHANNEL_SATISFACTION_CONFIG = {
    enabled: false,
    message: 'Como você avalia o atendimento que acabou de receber? Responda com o número da opção:',
    options: [
        { value: 1, emoji: '😍', label: 'Ótimo' },
        { value: 2, emoji: '🙂', label: 'Bom' },
        { value: 3, emoji: '😐', label: 'Regular' },
        { value: 4, emoji: '🙁', label: 'Ruim' },
        { value: 5, emoji: '😡', label: 'Péssimo' },
    ],
    timeoutMinutes: 60,
};
exports.DEFAULT_CHANNEL_INACTIVITY_TRANSFER_CONFIG = {
    enabled: false,
    timeoutMinutes: 10,
    target: 'distribution',
    businessHoursOnly: true,
    maxTransfers: 3,
    transferLinkedLead: false,
};
