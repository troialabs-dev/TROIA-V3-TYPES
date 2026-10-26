"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAY_HOUR_METRICS = exports.VISITS_LEAD_STATUS_FILTERS = exports.VISITS_LEAD_ORIGIN_FILTERS = void 0;
/**
 * Recorte de procedência dos LEADS contados na tela.
 *
 * `capture_page` = lead que veio da página pública de captura por QR Code — o
 * lead que tem sessão de captura gravada (`capture.sessionUuid`). É o único
 * sinal que sobrevive a uma venda do ERP reaproveitar o mesmo lead.
 */
exports.VISITS_LEAD_ORIGIN_FILTERS = ['capture_page'];
/** Status do lead (`businessStatus`) — lead sem o campo conta como `pending`. */
exports.VISITS_LEAD_STATUS_FILTERS = ['pending', 'won', 'lost'];
// ============================================================================
// Concentração por dia e hora — agnóstica à métrica
// ============================================================================
exports.DAY_HOUR_METRICS = ['visits', 'leads', 'sales'];
