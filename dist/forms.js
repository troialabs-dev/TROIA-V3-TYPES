"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormStatus = exports.FORM_CONFIRMATION_EMAIL_VARIABLES = exports.DEFAULT_FORM_CONTACT_DATA = exports.CONFORMITY_VALUES = exports.FormFieldType = void 0;
// ============================================================
// FORM FIELD TYPES
// ============================================================
/**
 * FormFieldType - Tipos de campo suportados no builder
 */
var FormFieldType;
(function (FormFieldType) {
    FormFieldType["SHORT_TEXT"] = "short_text";
    FormFieldType["LONG_TEXT"] = "long_text";
    FormFieldType["EMAIL"] = "email";
    FormFieldType["PHONE"] = "phone";
    FormFieldType["NUMBER"] = "number";
    FormFieldType["URL"] = "url";
    FormFieldType["SELECT"] = "select";
    FormFieldType["MULTI_SELECT"] = "multi_select";
    FormFieldType["RADIO"] = "radio";
    FormFieldType["CHECKBOX"] = "checkbox";
    FormFieldType["DATE"] = "date";
    FormFieldType["TIME"] = "time";
    FormFieldType["FILE_UPLOAD"] = "file_upload";
    FormFieldType["RATING"] = "rating";
    FormFieldType["LINEAR_SCALE"] = "linear_scale";
    FormFieldType["HEADING"] = "heading";
    FormFieldType["PARAGRAPH"] = "paragraph";
    FormFieldType["CPF"] = "cpf";
    FormFieldType["CNPJ"] = "cnpj";
    FormFieldType["PHOTO"] = "photo";
    FormFieldType["CONFORMITY"] = "conformity";
})(FormFieldType || (exports.FormFieldType = FormFieldType = {}));
/**
 * CONFORMITY_VALUES - Valores aceitos pelo campo FormFieldType.CONFORMITY.
 */
exports.CONFORMITY_VALUES = ['conforme', 'nao_conforme', 'na'];
/** Formulário novo nasce pedindo nome e WhatsApp; e-mail opcional. */
exports.DEFAULT_FORM_CONTACT_DATA = {
    enabled: true,
    requireName: true,
    requirePhone: true,
    requireEmail: false,
};
/** Variáveis do e-mail de confirmação — `{{nome}}` etc.; `respostas` vira a lista pergunta/resposta. */
exports.FORM_CONFIRMATION_EMAIL_VARIABLES = ['nome', 'email', 'telefone', 'formulario', 'respostas'];
// ============================================================
// FORM STATUS
// ============================================================
/**
 * FormStatus - Status do formulario
 */
var FormStatus;
(function (FormStatus) {
    FormStatus["DRAFT"] = "draft";
    FormStatus["ACTIVE"] = "active";
    FormStatus["INACTIVE"] = "inactive";
})(FormStatus || (exports.FormStatus = FormStatus = {}));
