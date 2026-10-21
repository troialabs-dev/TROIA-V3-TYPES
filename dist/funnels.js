"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LEAD_CAPTURE_FIELDS = void 0;
exports.resolveLeadCaptureFields = resolveLeadCaptureFields;
/** E-mail aparece opcional (como sempre foi); CPF e nascimento só quando ligados. */
exports.DEFAULT_LEAD_CAPTURE_FIELDS = {
    email: 'optional',
    cpf: 'hidden',
    birthDate: 'hidden',
};
/**
 * Campos efetivos da página — fonte única para a aba Captura, a página pública
 * e o servidor. Lê `fields` e cai no legado `emailRequired` quando o e-mail
 * ainda não foi configurado pela aba nova (funil antigo, sessão antiga no Redis).
 */
function resolveLeadCaptureFields(config) {
    return {
        email: config?.fields?.email ?? (config?.emailRequired === true ? 'required' : exports.DEFAULT_LEAD_CAPTURE_FIELDS.email),
        cpf: config?.fields?.cpf ?? exports.DEFAULT_LEAD_CAPTURE_FIELDS.cpf,
        birthDate: config?.fields?.birthDate ?? exports.DEFAULT_LEAD_CAPTURE_FIELDS.birthDate,
    };
}
