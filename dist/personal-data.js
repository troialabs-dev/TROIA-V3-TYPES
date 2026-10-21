"use strict";
/**
 * Conferência de dados pessoais digitados pelo próprio cliente (página pública
 * da captura por QR). Fica no pacote de tipos para a página e o servidor
 * aplicarem a MESMA regra — o que a página aceita, o servidor aceita.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cpfDigits = cpfDigits;
exports.formatCpf = formatCpf;
exports.isValidCpf = isValidCpf;
exports.isValidBirthDate = isValidBirthDate;
const CPF_LENGTH = 11;
/** Só os dígitos do CPF. */
function cpfDigits(value) {
    return value.replace(/\D/g, '');
}
/**
 * Máscara progressiva `000.000.000-00` — serve tanto para o campo enquanto o
 * cliente digita quanto para o valor final gravado. Corta no 11º dígito.
 */
function formatCpf(value) {
    return cpfDigits(value)
        .slice(0, CPF_LENGTH)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
/**
 * CPF existente: 11 dígitos, os dois verificadores batem (módulo 11) e não é
 * uma sequência repetida (`111.111.111-11` passa na conta, mas não existe).
 */
function isValidCpf(value) {
    const digits = cpfDigits(value);
    if (digits.length !== CPF_LENGTH || /^(\d)\1{10}$/.test(digits))
        return false;
    const numbers = digits.split('').map(Number);
    const checkDigit = (length) => {
        let sum = 0;
        for (let i = 0; i < length; i += 1)
            sum += (numbers[i] ?? 0) * (length + 1 - i);
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };
    return checkDigit(9) === numbers[9] && checkDigit(10) === numbers[10];
}
/** Ano mínimo aceito numa data de nascimento. */
const BIRTH_DATE_MIN_YEAR = 1900;
/**
 * Data de nascimento `AAAA-MM-DD` que existe no calendário (recusa 30/02),
 * de 1900 em diante e que não está no futuro. `today` só existe para teste.
 */
function isValidBirthDate(value, today = new Date()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match)
        return false;
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(Date.UTC(year, month - 1, day));
    const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    if (!exists || year < BIRTH_DATE_MIN_YEAR)
        return false;
    return value <= today.toISOString().slice(0, 10);
}
