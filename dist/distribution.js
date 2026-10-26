"use strict";
/**
 * Distribution — Shared Types
 *
 * Tipos da nova engine de distribuição automática que substitui o módulo
 * legado `assignments`. É consumida pelos services de domínio
 * (`conversationsService`, `leadsService`, `ticketsService`) e pelo
 * frontend (componente `DistributionConfigSection`).
 *
 * Este arquivo expõe tipos e um leitor de config (`isLeadOwnerPreferred`) —
 * a implementação do motor vive em `TROIA-V3-BACKEND/src/modules/distribution/`.
 *
 * Durante a migração (Fase 0 → Fase 10), este arquivo coexiste com o
 * legado `assignment.ts`. O legado será removido na Fase 10.
 *
 * Ver plano completo: DOCS/architecture/ASSIGNMENTS_REMOVAL.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLeadOwnerPreferred = isLeadOwnerPreferred;
/**
 * A regra "priorizar o responsável pelo lead" vale neste canal? Faz parte da
 * distribuição automática: com ela desligada no canal, a regra não age.
 */
function isLeadOwnerPreferred(config) {
    return config?.enabled === true && config.preferLeadOwner !== false;
}
