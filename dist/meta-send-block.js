"use strict";
/**
 * Trava de envio do WhatsApp oficial — bloqueio de conta pela Meta.
 *
 * Quando a Meta bloqueia uma conta (erro 131031/368, ou aviso de banimento ou
 * de restrição), o sistema para de enviar modelos por aquela integração e NÃO
 * religa sozinho: alguém libera na tela do canal. Depois da liberação o envio
 * volta em ritmo reduzido (teto de clientes por dia que dobra a cada dia).
 *
 * Origem: a conta oficial da Mastercell foi bloqueada 3 vezes em 5 dias
 * (31/10 a 04/11/2026). A cada liberação o fluxo voltou sozinho, no ritmo
 * cheio e com o mesmo texto — a terceira janela durou 1 hora.
 * Ver DOCS/modules/META_SEND_GUARD.md.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.META_SEND_GUARD_REFUSAL_CODES = exports.META_RESUME_DAILY_CAP_CODE = exports.META_ACCOUNT_BLOCKED_CODE = void 0;
/**
 * `failedCode` / `errorCode` — sentinela (NÃO é código real do Graph, que nunca
 * é negativo): recusado pela trava porque a Meta bloqueou a conta e ninguém
 * liberou o envio ainda. Nenhuma chamada foi feita à Meta.
 */
exports.META_ACCOUNT_BLOCKED_CODE = -3;
/**
 * `failedCode` / `errorCode` — sentinela: recusado pela trava porque a conta
 * está em retomada depois de um bloqueio e o teto de clientes do dia já foi
 * atingido. Nenhuma chamada foi feita à Meta.
 */
exports.META_RESUME_DAILY_CAP_CODE = -4;
/** Os dois códigos de recusa da trava — para quem só precisa saber "foi a trava". */
exports.META_SEND_GUARD_REFUSAL_CODES = [exports.META_ACCOUNT_BLOCKED_CODE, exports.META_RESUME_DAILY_CAP_CODE];
