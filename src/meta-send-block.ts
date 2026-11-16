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

/**
 * `failedCode` / `errorCode` — sentinela (NÃO é código real do Graph, que nunca
 * é negativo): recusado pela trava porque a Meta bloqueou a conta e ninguém
 * liberou o envio ainda. Nenhuma chamada foi feita à Meta.
 */
export const META_ACCOUNT_BLOCKED_CODE = -3;

/**
 * `failedCode` / `errorCode` — sentinela: recusado pela trava porque a conta
 * está em retomada depois de um bloqueio e o teto de clientes do dia já foi
 * atingido. Nenhuma chamada foi feita à Meta.
 */
export const META_RESUME_DAILY_CAP_CODE = -4;

/** Os dois códigos de recusa da trava — para quem só precisa saber "foi a trava". */
export const META_SEND_GUARD_REFUSAL_CODES = [META_ACCOUNT_BLOCKED_CODE, META_RESUME_DAILY_CAP_CODE] as const;

/**
 * Estado da trava numa integração:
 * - `blocked`: a Meta bloqueou; nenhum modelo sai até alguém liberar.
 * - `resuming`: alguém liberou; o envio voltou com teto diário.
 */
export type MetaSendBlockStatus = 'blocked' | 'resuming';

/** De onde veio a prova do bloqueio. */
export type MetaSendBlockSource =
  /** A Meta recusou a chamada de envio. */
  | 'send_error'
  /** A Meta aceitou a chamada e depois devolveu a falha no aviso de status. */
  | 'message_status'
  /** A Meta mandou o aviso de conta (banimento ou restrição). */
  | 'account_update';

/** Andamento da retomada em ritmo reduzido. */
export interface MetaSendResumeProgress {
  /** Dia da retomada, começando em 1. */
  day: number;
  /** Teto de clientes diferentes neste dia. */
  dailyCap: number;
  /** Clientes diferentes que já receberam neste dia. */
  usedToday: number;
  /** Limite diário da conta na Meta lido na liberação; `null` quando não foi possível ler. */
  accountLimit: number | null;
}

/** Resposta de `GET /channels/:id/meta-send-block` e do `POST …/release`. */
export interface MetaSendBlockResponse {
  /** `none` = sem trava ativa (nunca bloqueou, ou a retomada já terminou). */
  status: 'none' | MetaSendBlockStatus;
  blockedAt?: string;
  /** Código que a Meta devolveu (131031, 368) ou 0 quando veio só o aviso de conta. */
  code?: number;
  /** Texto da Meta. */
  reason?: string;
  source?: MetaSendBlockSource;
  /** Quando a Meta avisou que reativou a conta — ainda falta alguém liberar o envio. */
  metaReinstatedAt?: string;
  releasedAt?: string;
  resume?: MetaSendResumeProgress;
}
