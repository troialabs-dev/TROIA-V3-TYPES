"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidaySuppressionKey = holidaySuppressionKey;
exports.isDeviceVerificationRequired = isDeviceVerificationRequired;
/**
 * Chave estável de supressão de feriado nacional.
 *
 * Feriados nacionais são GERADOS em código, não persistidos — logo não têm
 * `_id`. A identidade disponível é o `name`, que é constante de código; esta
 * função o normaliza para uma chave sem acento, caixa nem pontuação, igual
 * entre anos (o Carnaval de 2026 e o de 2027 têm a MESMA chave, e uma
 * supressão feita uma vez vale para sempre).
 *
 * Consumidores: a aba "Horário de atendimento" (grava a chave ao remover) e
 * `resolveHolidays` no backend (descarta o nacional cuja chave está na lista).
 */
function holidaySuppressionKey(name) {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * A empresa exige confirmação de aparelho novo? Ausente = sim.
 * Ponto ÚNICO de leitura da regra — backend e frontend usam este helper.
 */
function isDeviceVerificationRequired(security) {
    return security?.requireDeviceVerification !== false;
}
