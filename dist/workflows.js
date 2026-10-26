"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_VALIDATION_CODES = exports.WORKFLOW_NODE_INPUT_RETENTION_DAYS = exports.WORKFLOW_NODE_INPUT_MAX_BYTES = exports.WORKFLOW_EXECUTION_SUMMARY_RING_SIZE = exports.WORKFLOW_EXECUTION_RETENTION_DAYS = exports.WORKFLOW_EXECUTION_STATS_BUCKETS = exports.WORKFLOW_EXECUTION_STATS_WINDOW_DAYS = exports.WAIT_UNTIL_MAX_DURATION_MS = exports.WAIT_CANCEL_EVENT_ACTORS = exports.WORKFLOW_WAIT_CANCELLED_HANDLE = exports.WORKFLOW_CANCELLATION_EVENT_TYPES = exports.WORKFLOW_CANCELLATION_EVENTS = exports.WORKFLOW_EVENT_ACTORS = exports.WORKFLOW_QUESTION_NODE_TYPES = exports.ASK_FORM_ASKABLE_FIELD_TYPES = exports.NEXT_NUMBER_LEAD_COUPON_SEQUENCE = exports.NEXT_NUMBER_MAX_PAD_LENGTH = exports.NEXT_NUMBER_DEFAULT_PAD_LENGTH = exports.ASK_QUESTION_DEFAULT_TIMEOUT = exports.ASK_QUESTION_DEFAULT_MAX_RETRIES = exports.ASK_QUESTION_MAX_RETRIES_CAP = exports.ASK_QUESTION_MAX_OPTIONS = exports.ASK_QUESTION_OPTION_HANDLE_PREFIX = exports.ASK_QUESTION_NO_REPLY_HANDLE = exports.ASK_QUESTION_INVALID_HANDLE = exports.ASK_QUESTION_ANSWERED_HANDLE = exports.ASK_QUESTION_ANSWER_TYPES = exports.SATISFACTION_SURVEY_CLOSE_REASONS = exports.BUSINESS_HOURS_NODE_TYPES = exports.WORKFLOW_EXECUTION_IDENTIFIER_MAX_LENGTH = exports.WORKFLOW_CONDITION_OPERATORS = exports.WORKFLOW_EXECUTION_OPEN_STATUSES = exports.WORKFLOW_EXECUTION_STATUSES = exports.WORKFLOW_AUTO_PAUSE_REASONS = exports.WORKFLOW_FREQUENT_FAILURES_ALERT_INTERVAL_HOURS = exports.WORKFLOW_FREQUENT_FAILURES_THRESHOLD = exports.WORKFLOW_FREQUENT_FAILURES_WINDOW = exports.WORKFLOW_AUTO_PAUSE_CONSECUTIVE_FAILURES = exports.WORKFLOW_STATUSES = exports.WORKFLOW_SUCCESS_FAILURE_NODE_TYPES = exports.WORKFLOW_FAILURE_HANDLE = exports.WORKFLOW_SUCCESS_HANDLE = exports.WORKFLOW_FILTERABLE_NODE_TYPES = exports.WORKFLOW_NODE_TYPES = void 0;
exports.nodeTypeAcceptsFilters = nodeTypeAcceptsFilters;
exports.nodeTypeHasSuccessFailureOutputs = nodeTypeHasSuccessFailureOutputs;
exports.askQuestionOptionHandle = askQuestionOptionHandle;
exports.askQuestionOutputHandles = askQuestionOutputHandles;
exports.defaultAskQuestionRetryMessage = defaultAskQuestionRetryMessage;
exports.formatSequenceNumber = formatSequenceNumber;
exports.isAskFormFieldAskable = isAskFormFieldAskable;
exports.askFormNumberRange = askFormNumberRange;
exports.askFormOptionsByPosition = askFormOptionsByPosition;
exports.defaultAskFormQuestionText = defaultAskFormQuestionText;
exports.askFormFieldsFilledElsewhere = askFormFieldsFilledElsewhere;
exports.askFormOutputHandles = askFormOutputHandles;
exports.isWorkflowQuestionNodeType = isWorkflowQuestionNodeType;
exports.questionNodeOutputHandles = questionNodeOutputHandles;
exports.waitHasCancelledOutput = waitHasCancelledOutput;
exports.readWaitCancelEvents = readWaitCancelEvents;
const forms_1 = require("./forms");
// ============================================================
// WORKFLOW TYPES
// ============================================================
/**
 * Node Types - All supported node types for workflows.
 *
 * SINGLE SOURCE OF TRUTH: add new node types here only.
 * The WorkflowNodeType union is derived from this array so that
 * runtime validators (Zod enums) can import WORKFLOW_NODE_TYPES
 * directly and stay in sync automatically.
 */
exports.WORKFLOW_NODE_TYPES = [
    // Triggers
    'trigger_webhook',
    'trigger_schedule',
    'trigger_event',
    'trigger_manual',
    'trigger_date_field',
    'trigger_inactivity',
    'trigger_instagram_comment',
    'trigger_instagram_mention',
    // Actions
    'action_send_message',
    'action_send_email',
    'action_send_template',
    'action_send_media',
    'action_http_request',
    'action_query_database',
    'action_create_lead',
    'action_update_lead',
    'action_update_contact',
    'action_add_tag',
    'action_remove_tag',
    'action_assign',
    'action_set_variable',
    'action_create_conversation',
    'action_transfer_conversation',
    'action_satisfaction_survey',
    'action_ask_question',
    'action_ask_form',
    'action_next_number',
    'action_save_form_response',
    'action_create_ticket',
    'action_internal_notification',
    'action_find_leads',
    'action_create_database_document',
    'action_mirror_media',
    'action_voice_clone',
    'action_voice_tts',
    'action_voice_clone_delete',
    'action_create_checklist',
    'action_find_unit',
    'action_find_user',
    'action_find_contact',
    'action_url_to_pdf',
    'action_nfe_pdf',
    // Controls
    'control_if',
    'control_switch',
    'control_wait_for',
    'control_loop',
    'control_split',
    'control_retry_scope',
    // AI
    'ai_agent',
    'ai_agent_inline',
    // Skill
    'skill_input',
    'skill_output',
];
/**
 * Nós que têm a aba Filtros em `data.filters` (spec 2026-09-14 §5.3): os que "fazem algo".
 * Gatilhos guardam os seus em `config.filters` (aplicados no DISPARO); Se/Selecionar/leque/
 * Repetir/Tentar de novo e skill_output já são a condição ou o fim, não filtram.
 */
exports.WORKFLOW_FILTERABLE_NODE_TYPES = exports.WORKFLOW_NODE_TYPES.filter((t) => t.startsWith('action_') || t === 'ai_agent' || t === 'ai_agent_inline' || t === 'control_wait_for' || t === 'skill_input');
function nodeTypeAcceptsFilters(type) {
    return exports.WORKFLOW_FILTERABLE_NODE_TYPES.includes(type);
}
/**
 * Saídas "Sucesso" e "Falha" (2026-09-23, nó Transferir conversa): nó de ação
 * que pode NÃO conseguir fazer o que promete ganha duas saídas, e o desenho
 * decide o que acontece em cada caso. Fonte ÚNICA para a tela (alças do nó),
 * o validador e o compilador.
 *
 * O nó devolve `{ success: boolean }`: `true` segue pela saída `success`,
 * `false` pela `failure`. Sem ligação na saída Falha o nó LANÇA quando não
 * consegue — a execução falha com o motivo, em vez de terminar calada.
 */
exports.WORKFLOW_SUCCESS_HANDLE = 'success';
exports.WORKFLOW_FAILURE_HANDLE = 'failure';
exports.WORKFLOW_SUCCESS_FAILURE_NODE_TYPES = [
    'action_transfer_conversation',
    'action_satisfaction_survey',
    'action_save_form_response',
];
function nodeTypeHasSuccessFailureOutputs(type) {
    return exports.WORKFLOW_SUCCESS_FAILURE_NODE_TYPES.includes(type);
}
/**
 * Workflow Statuses — runtime constant + derived type.
 */
exports.WORKFLOW_STATUSES = ['active', 'inactive', 'draft', 'archived'];
/**
 * Pausa automática (2026-08-22): um workflow ativo vira `inactive` sozinho
 * quando as últimas N execuções terminadas (sem as de teste) falharam, ou
 * quando um canal que ele usa é excluído. `autoPause` guarda o motivo; é
 * limpo ao reativar.
 */
exports.WORKFLOW_AUTO_PAUSE_CONSECUTIVE_FAILURES = 10;
/**
 * Aviso de falha frequente (2026-09-15). A pausa automática ignora falha
 * PARCIAL (galho paralelo quebrado com o irmão entregando) — e foi assim que o
 * workflow "AUTOMAÇÃO PÓS VENDA" falhou 3.790 vezes em 13 dias sem ninguém
 * saber. O aviso tem contagem PRÓPRIA: entre as últimas `WINDOW` execuções
 * finalizadas (fora teste, cancelada e falha por estado do cliente — falha
 * parcial CONTA), `THRESHOLD` ou mais falharam → avisa quem pode editar
 * workflows, no máximo 1 vez a cada `INTERVAL_HOURS` por workflow. Só avisa;
 * pausar pararia também o galho que funciona.
 */
exports.WORKFLOW_FREQUENT_FAILURES_WINDOW = 20;
exports.WORKFLOW_FREQUENT_FAILURES_THRESHOLD = 5;
exports.WORKFLOW_FREQUENT_FAILURES_ALERT_INTERVAL_HOURS = 24;
exports.WORKFLOW_AUTO_PAUSE_REASONS = ['consecutive_failures', 'channel_deleted'];
/**
 * Execution Statuses — runtime constant + derived type.
 */
exports.WORKFLOW_EXECUTION_STATUSES = ['pending', 'running', 'completed', 'failed', 'cancelled', 'suspended'];
/**
 * Status em que a execução ainda está VIVA e pode mudar. Tudo fora daqui
 * (`completed`, `failed`, `cancelled`) é final e NUNCA é sobrescrito — é o que
 * impede o fim normal de um run (ou uma retomada atrasada) de transformar um
 * "cancelado" em "concluído" (spec 2026-09-14, invariante I2).
 */
exports.WORKFLOW_EXECUTION_OPEN_STATUSES = ['pending', 'running', 'suspended'];
// ============================================================
// NODE CONFIGURATION INTERFACES
// ============================================================
/**
 * Catálogo canônico de operadores de condição/filtro do motor de workflows.
 * FONTE ÚNICA — o ConditionEvaluator do backend, o buildMongoFilterConditions
 * (dispatchers + preview) e o FILTER_OPERATORS da UI derivam deste catálogo.
 *
 * 'greater_or_equal' e 'less_or_equal' são ALIASES aceitos em runtime
 * (normalizados para 'greater_than_or_equal'/'less_than_or_equal') porque
 * configs históricos criados pela UI usam essa grafia.
 */
exports.WORKFLOW_CONDITION_OPERATORS = [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'greater_than',
    'less_than',
    'greater_than_or_equal',
    'less_than_or_equal',
    'greater_or_equal', // alias legado (UI) de greater_than_or_equal
    'less_or_equal', // alias legado (UI) de less_than_or_equal
    'is_empty',
    'is_not_empty',
    'is_null',
    'is_not_null',
    'in',
    'not_in',
    'matches_regex',
];
/** Tamanho máximo do `identifier` aceito pelo gatilho de webhook. */
exports.WORKFLOW_EXECUTION_IDENTIFIER_MAX_LENGTH = 200;
/**
 * Node types de saída que suportam `businessHours` (UI + validação backend).
 * `action_send_media` e `action_internal_notification` não têm interface de
 * config canônica neste pacote (fallback `Record<string, unknown>`) mas também
 * aceitam o campo — as interfaces locais vivem nos respectivos step factories.
 */
exports.BUSINESS_HOURS_NODE_TYPES = [
    'action_send_message',
    'action_send_template',
    'action_send_media',
    'action_send_email',
    'action_internal_notification',
    'ai_agent',
    'ai_agent_inline',
];
/**
 * Motivos de encerramento que o nó CSAT oferece: só os que NÃO bloqueiam a
 * pesquisa (spam, duplicada, expirada e sem resposta nunca recebem CSAT —
 * `SATISFACTION_SKIP_CLOSE_REASONS` no backend).
 */
exports.SATISFACTION_SURVEY_CLOSE_REASONS = ['resolved', 'transferred', 'other'];
/**
 * "Pergunta" (2026-09-28)
 *
 * Um nó só pergunta, espera a resposta e confere se ela serve. O laço de
 * tentativas vive DENTRO do nó, porque o desenho não aceita ciclo (`CICLO`):
 * resposta que não serve recebe a mensagem de "não entendi" e a pergunta
 * continua valendo, até acabarem as tentativas. É o molde dos motores de chat
 * de mercado (Twilio "Send & Wait For Reply", ManyChat "Data Collection",
 * Botpress "Capture Information", Typebot, Blip).
 *
 * Saídas — fonte ÚNICA em `askQuestionOutputHandles`:
 * - tipo `options`: uma por opção (`option-<id>`); `number` e `text`: `answered`;
 * - `invalid`: as tentativas acabaram sem resposta que sirva (não existe no tipo `text`,
 *   que aceita qualquer resposta);
 * - `no_reply`: o prazo venceu sem resposta que sirva.
 * Saída sem ligação encerra o caminho ali, sem erro.
 */
exports.ASK_QUESTION_ANSWER_TYPES = ['options', 'number', 'text'];
exports.ASK_QUESTION_ANSWERED_HANDLE = 'answered';
exports.ASK_QUESTION_INVALID_HANDLE = 'invalid';
exports.ASK_QUESTION_NO_REPLY_HANDLE = 'no_reply';
exports.ASK_QUESTION_OPTION_HANDLE_PREFIX = 'option-';
exports.ASK_QUESTION_MAX_OPTIONS = 10;
exports.ASK_QUESTION_MAX_RETRIES_CAP = 5;
exports.ASK_QUESTION_DEFAULT_MAX_RETRIES = 2;
exports.ASK_QUESTION_DEFAULT_TIMEOUT = {
    duration: 24,
    unit: 'hours',
};
function askQuestionOptionHandle(optionId) {
    return `${exports.ASK_QUESTION_OPTION_HANDLE_PREFIX}${optionId}`;
}
/**
 * Saídas do nó "Pergunta", na ordem da tela. Fonte ÚNICA para tela (alças),
 * validador (ligação em saída que não existe) e compilador (um ramo por saída).
 */
function askQuestionOutputHandles(config) {
    const answerType = config?.answerType ?? 'options';
    const handles = [];
    if (answerType === 'options') {
        for (const option of config?.options ?? []) {
            if (typeof option?.id === 'string' && option.id.trim() !== '') {
                handles.push(askQuestionOptionHandle(option.id));
            }
        }
    }
    else {
        handles.push(exports.ASK_QUESTION_ANSWERED_HANDLE);
    }
    if (answerType !== 'text')
        handles.push(exports.ASK_QUESTION_INVALID_HANDLE);
    handles.push(exports.ASK_QUESTION_NO_REPLY_HANDLE);
    return handles;
}
/**
 * Texto padrão da mensagem de "não entendi" quando o nó não traz um: diz ao
 * cliente o que serve como resposta, que é o que tira alguém do laço.
 */
function defaultAskQuestionRetryMessage(config) {
    if (config?.answerType === 'number') {
        const min = config.numberMin ?? 1;
        const max = config.numberMax ?? 5;
        return `Não entendi sua resposta. Responda só com um número de ${min} a ${max}, por favor.`;
    }
    const labels = (config?.options ?? [])
        .map((option) => option.label.trim())
        .filter((label) => label !== '');
    const ultima = labels[labels.length - 1];
    if (ultima === undefined)
        return 'Não entendi sua resposta. Pode responder de novo, por favor?';
    const lista = labels.length === 1 ? ultima : `${labels.slice(0, -1).join(', ')} ou ${ultima}`;
    return `Não entendi sua resposta. Responda com: ${lista}.`;
}
exports.NEXT_NUMBER_DEFAULT_PAD_LENGTH = 4;
exports.NEXT_NUMBER_MAX_PAD_LENGTH = 12;
/** Nome da "sequência" no modo 'lead_coupon' — é o que aparece em `sequence`. */
exports.NEXT_NUMBER_LEAD_COUPON_SEQUENCE = 'Cupons do lead';
function formatSequenceNumber(number, padLength = exports.NEXT_NUMBER_DEFAULT_PAD_LENGTH, prefix = '') {
    return `${prefix}${String(number).padStart(Math.max(0, padLength), '0')}`;
}
/** Tipos de campo que o WhatsApp consegue perguntar e conferir. */
exports.ASK_FORM_ASKABLE_FIELD_TYPES = [
    forms_1.FormFieldType.SHORT_TEXT,
    forms_1.FormFieldType.LONG_TEXT,
    forms_1.FormFieldType.EMAIL,
    forms_1.FormFieldType.PHONE,
    forms_1.FormFieldType.URL,
    forms_1.FormFieldType.CPF,
    forms_1.FormFieldType.CNPJ,
    forms_1.FormFieldType.DATE,
    forms_1.FormFieldType.TIME,
    forms_1.FormFieldType.NUMBER,
    forms_1.FormFieldType.RATING,
    forms_1.FormFieldType.LINEAR_SCALE,
    forms_1.FormFieldType.SELECT,
    forms_1.FormFieldType.RADIO,
    forms_1.FormFieldType.CHECKBOX,
    forms_1.FormFieldType.MULTI_SELECT,
];
/** O campo é perguntado pelo nó? (título, parágrafo, foto e arquivo não são.) */
function isAskFormFieldAskable(field) {
    return exports.ASK_FORM_ASKABLE_FIELD_TYPES.includes(field.type);
}
/** Faixa numérica que o campo aceita (nota: 1 a 5; escala: 0 a 10; número: livre). */
function askFormNumberRange(field) {
    const min = field.validation?.min;
    const max = field.validation?.max;
    if (field.type === forms_1.FormFieldType.RATING)
        return { min: min ?? 1, max: max ?? 5 };
    if (field.type === forms_1.FormFieldType.LINEAR_SCALE)
        return { min: min ?? 0, max: max ?? 10 };
    return { min: min ?? 0, max: max ?? Number.MAX_SAFE_INTEGER };
}
/**
 * Texto padrão da pergunta no WhatsApp: nome em negrito, descrição, e — em
 * campo de escolha — as opções numeradas (o número também vale como
 * resposta). Fonte ÚNICA para a tela (prévia) e o motor.
 */
/**
 * As opções do campo valem pelo NÚMERO da posição na lista? Não quando alguma
 * opção já É um número ("1", "2", "3") — aí "2" seria ambíguo, e a lista sai
 * com marcadores em vez de números.
 */
function askFormOptionsByPosition(field) {
    const numero = /^\s*\d+\s*$/;
    return !(field.options ?? []).some((o) => numero.test(o.label) || numero.test(o.value));
}
function defaultAskFormQuestionText(field) {
    const partes = [`*${field.label.trim()}*`];
    const descricao = field.description?.trim();
    if (descricao)
        partes.push(descricao);
    const multipla = field.type === forms_1.FormFieldType.CHECKBOX || field.type === forms_1.FormFieldType.MULTI_SELECT;
    if (field.type === forms_1.FormFieldType.SELECT || field.type === forms_1.FormFieldType.RADIO || multipla) {
        const numerar = askFormOptionsByPosition(field);
        const opcoes = (field.options ?? []).map((o, i) => (numerar ? `${i + 1}. ${o.label}` : `• ${o.label}`));
        if (opcoes.length > 0)
            partes.push(opcoes.join('\n'));
        if (multipla)
            partes.push('(pode escolher mais de uma, separadas por vírgula)');
    }
    else if (!descricao && (field.type === forms_1.FormFieldType.NUMBER || field.type === forms_1.FormFieldType.RATING || field.type === forms_1.FormFieldType.LINEAR_SCALE)) {
        const { min, max } = askFormNumberRange(field);
        if (max < Number.MAX_SAFE_INTEGER)
            partes.push(`(responda com um número de ${min} a ${max})`);
    }
    return partes.join('\n\n');
}
/**
 * Perguntas que um "Salvar formulário" DEPOIS do "Perguntar formulário"
 * preenche com OUTRO valor (número sequencial, texto fixo, outra Pergunta) —
 * o nó não as faz: a resposta do cliente seria jogada fora (2026-09-28,
 * número da sorte perguntado ao cliente no teste). Fonte ÚNICA para o motor e
 * a tela. Devolve id do campo → nome do "Salvar formulário" que o preenche.
 *
 * Vale só com `saveAs`: sem ele o "Salvar formulário" nem tem como usar as
 * respostas do questionário, e tudo pareceria "preenchido por outro valor".
 * `saves` = os "Salvar formulário" que vêm DEPOIS deste nó no desenho.
 */
function askFormFieldsFilledElsewhere(ask, saves) {
    const saveAs = ask.saveAs?.trim();
    if (!saveAs || !ask.formId)
        return {};
    const proprio = `variables.${saveAs}.`;
    const preenchidas = {};
    for (const save of saves) {
        if (save.config.formId !== ask.formId)
            continue;
        for (const [fieldId, valor] of Object.entries(save.config.answers ?? {})) {
            if (typeof valor !== 'string' || valor.trim() === '' || valor.includes(proprio))
                continue;
            if (!(fieldId in preenchidas))
                preenchidas[fieldId] = save.label;
        }
    }
    return preenchidas;
}
/** Saídas do nó "Perguntar formulário" — "Respondeu" e "Não respondeu". */
function askFormOutputHandles() {
    return [exports.ASK_QUESTION_ANSWERED_HANDLE, exports.ASK_QUESTION_NO_REPLY_HANDLE];
}
/**
 * Nós que perguntam ao cliente e DORMEM esperando a resposta ("Pergunta" e
 * "Perguntar formulário"). Valem para os dois as mesmas regras de desenho:
 * ramificam por saída, não entram em caminhos paralelos nem em repetição, e
 * não convivem com a regra de cancelamento "Mensagem recebida".
 */
exports.WORKFLOW_QUESTION_NODE_TYPES = ['action_ask_question', 'action_ask_form'];
function isWorkflowQuestionNodeType(type) {
    return exports.WORKFLOW_QUESTION_NODE_TYPES.includes(type);
}
/**
 * Saídas de um nó de pergunta — fonte ÚNICA para tela, validador e
 * compilador. `null` quando o tipo não é de pergunta.
 */
function questionNodeOutputHandles(type, config) {
    if (type === 'action_ask_question')
        return askQuestionOutputHandles(config);
    if (type === 'action_ask_form')
        return askFormOutputHandles();
    return null;
}
/**
 * Quem originou um evento observado pelo node "Aguardar".
 *
 * - `user`       — atendente humano
 * - `ai`         — agente de IA
 * - `automation` — workflow / automação do sistema
 * - `api`        — integração externa via API pública
 *
 * `api` já existe no vocabulário porque o catálogo foi desenhado para crescer
 * (ex.: "Lead criado → por API"), mas HOJE nenhum evento do
 * `WAIT_CANCEL_EVENT_ACTORS` o oferece: mensagem é o único evento com a origem
 * gravada no dado (`ConversationMessage.senderType`), e lá não existe API.
 * Ligar um evento novo exige antes gravar o autor na entidade — lead e contato
 * não guardam quem os criou.
 */
exports.WORKFLOW_EVENT_ACTORS = ['user', 'ai', 'automation', 'api'];
/**
 * FONTE ÚNICA dos eventos da aba Cancelamento (spec 2026-09-14 §1.2): UI,
 * validação e motor leem daqui. Só entram eventos que apontam para alguém.
 * `calendar_event.cancelled` entra porque o publisher carrega `eventId` e
 * `contactId` antes de apagar (o vigia casa pelo id, não precisa da entidade).
 */
exports.WORKFLOW_CANCELLATION_EVENTS = {
    'message.received': { entity: 'conversation', idField: 'conversationId', actors: [] },
    'message.sent': { entity: 'conversation', idField: 'conversationId', actors: ['user', 'ai', 'automation'] },
    'conversation.created': { entity: 'conversation', idField: 'conversationId', actors: [] },
    'conversation.updated': { entity: 'conversation', idField: 'conversationId', actors: [] },
    'conversation.closed': { entity: 'conversation', idField: 'conversationId', actors: [] },
    'conversation.assigned': { entity: 'conversation', idField: 'conversationId', actors: [] },
    'contact.created': { entity: 'contact', idField: 'contactId', actors: [] },
    'contact.updated': { entity: 'contact', idField: 'contactId', actors: [] },
    'lead.created': { entity: 'lead', idField: 'leadId', actors: [] },
    'lead.updated': { entity: 'lead', idField: 'leadId', actors: [] },
    'lead.stage_changed': { entity: 'lead', idField: 'leadId', actors: [] },
    'lead.won': { entity: 'lead', idField: 'leadId', actors: [] },
    'lead.lost': { entity: 'lead', idField: 'leadId', actors: [] },
    'ticket.created': { entity: 'ticket', idField: 'ticketId', actors: [] },
    'ticket.updated': { entity: 'ticket', idField: 'ticketId', actors: [] },
    'ticket.status_changed': { entity: 'ticket', idField: 'ticketId', actors: [] },
    'ticket.assigned': { entity: 'ticket', idField: 'ticketId', actors: [] },
    'ticket.resolved': { entity: 'ticket', idField: 'ticketId', actors: [] },
    'ticket.closed': { entity: 'ticket', idField: 'ticketId', actors: [] },
    'calendar_event.created': { entity: 'event', idField: 'eventId', actors: [] },
    'calendar_event.updated': { entity: 'event', idField: 'eventId', actors: [] },
    'calendar_event.cancelled': { entity: 'event', idField: 'eventId', actors: [] },
};
exports.WORKFLOW_CANCELLATION_EVENT_TYPES = Object.keys(exports.WORKFLOW_CANCELLATION_EVENTS);
/**
 * Marca (`sourceHandle`) da saída vermelha "Cancelado" do nó Aguardar
 * (spec 2026-09-20 §7.1, Fase 4b).
 *
 * NÃO pode ser `'event'`: essa era a marca da saída "Cancelado" ANTIGA, e a
 * migração `2026-09-14-001` apaga toda ligação que sai dela — junto com a
 * árvore de nós atrás dela. Também não pode ser `'timeout'`, que é a saída
 * que segue depois da espera.
 */
exports.WORKFLOW_WAIT_CANCELLED_HANDLE = 'cancelled';
/**
 * O Aguardar tem a saída "Cancelado"? Fonte ÚNICA para tela, validação e
 * compilador (spec 2026-09-20 §7.1): a saída existe quando o nó tem regra
 * PRÓPRIA na aba Cancelamento — regra de outro nó (ou do gatilho) não desenha
 * saída aqui, mesmo que também desvie a execução por esta (D13).
 */
function waitHasCancelledOutput(node) {
    if (node.type !== 'control_wait_for')
        return false;
    return (node.data.cancellation?.rules ?? []).length > 0;
}
/**
 * @deprecated recorte do catálogo novo com os 4 eventos que o Aguardar antigo
 * aceitava. Some junto com `WaitCancelEvent`.
 */
exports.WAIT_CANCEL_EVENT_ACTORS = {
    'message.received': exports.WORKFLOW_CANCELLATION_EVENTS['message.received'].actors,
    'message.sent': exports.WORKFLOW_CANCELLATION_EVENTS['message.sent'].actors,
    'lead.updated': exports.WORKFLOW_CANCELLATION_EVENTS['lead.updated'].actors,
    'contact.updated': exports.WORKFLOW_CANCELLATION_EVENTS['contact.updated'].actors,
};
/**
 * Lê a lista de eventos de cancelamento de um `cancelEvent`, aceitando o
 * formato novo (`events`) e o legado (`eventType`). Ponto ÚNICO da compat —
 * motor, validação e UI passam por aqui em vez de cada um reimplementar o
 * fallback e divergir.
 */
function readWaitCancelEvents(cancelEvent) {
    if (!cancelEvent)
        return [];
    if (Array.isArray(cancelEvent.events)) {
        return cancelEvent.events.filter((event) => typeof event?.type === 'string' && event.type.trim().length > 0);
    }
    const legado = cancelEvent.eventType;
    return typeof legado === 'string' && legado.trim().length > 0 ? [{ type: legado }] : [];
}
/** Teto de espera do modo `duration` (72h). Aplicado no save e em runtime. */
exports.WAIT_UNTIL_MAX_DURATION_MS = 72 * 60 * 60 * 1000;
/** Janela, em dias, dos contadores de execução da listagem de workflows. */
exports.WORKFLOW_EXECUTION_STATS_WINDOW_DAYS = 30;
/** Baldes em que a listagem classifica uma execução (a régua da pausa automática). */
exports.WORKFLOW_EXECUTION_STATS_BUCKETS = ['completed', 'failed', 'customerFailed', 'cancelled', 'running', 'interrupted'];
/** Por quantos dias uma execução em status FINAL fica guardada antes de expirar. */
exports.WORKFLOW_EXECUTION_RETENTION_DAYS = 30;
/** Quantas execuções elegíveis o resumo do workflow guarda no anel (`executionSummary.recentOutcomes`). */
exports.WORKFLOW_EXECUTION_SUMMARY_RING_SIZE = 20;
// ============================================================
// WORKFLOW NODE RUN INPUTS — o "Visualizar contexto" do nó (F2)
// ============================================================
/** Teto, em bytes, do que se guarda de entrada de UM nó numa execução. */
exports.WORKFLOW_NODE_INPUT_MAX_BYTES = 32_768;
/** Por quantos dias a entrada de um nó fica guardada. */
exports.WORKFLOW_NODE_INPUT_RETENTION_DAYS = 30;
/**
 * Validação estrutural de workflow (2026-08-27).
 *
 * O backend é a única fonte de verdade das regras estruturais; o editor as
 * consome por `POST /api/workflows/validate`. `nodeIds` é o que permite ao
 * editor pintar de vermelho os nós culpados — o 422 do PATCH não carrega
 * essa informação (o errorHandler só serializa `fieldErrors`).
 */
exports.WORKFLOW_VALIDATION_CODES = [
    'NODE_TYPE_DESCONHECIDO',
    'ARESTA_ORFA',
    'SEM_ENTRADA',
    'MULTIPLAS_ENTRADAS',
    'CICLO',
    'IF_SEM_CAMINHO',
    'IF_HANDLE_INVALIDO',
    'SWITCH_SEM_HANDLE',
    'SPLIT_HANDLE_INVALIDO',
    'LOOP_SAIDAS',
    'WAIT_FOR_SAIDAS',
    'FANOUT_JUNCAO',
    'FANOUT_ESPERA',
    'FANOUT_HORARIO',
    'SWITCH_HANDLE_NAO_COMPILAVEL',
    'CONTROL_FLOW_EM_LOOP',
    // 2026-08-27 (conserto final)
    /** "Tentar novamente" com nenhum/vários trechos a repetir, ou vários "Depois". */
    'RETRY_SAIDAS',
    /** Nó de controle dentro do trecho repetido por "Tentar novamente". */
    'CONTROL_FLOW_EM_RETRY',
    /** Requisição HTTP com "aguardar retorno" dentro de um leque (dorme igual à espera). */
    'FANOUT_HTTP_AGUARDA',
    /** Desenho sem nenhum gatilho (nem `skill_input`). */
    'SEM_GATILHO',
    /**
     * Gatilho que o motor não suporta repetido no mesmo workflow (23/09/2026):
     * dois Agendamentos, ou duas Inatividades da mesma entidade — o relógio é um
     * só por workflow e o segundo nunca dispararia.
     */
    'GATILHO_REPETIDO',
    /** Nó sem nenhuma ligação — nem entrando, nem saindo. */
    'NO_SOLTO',
    /** Campo obrigatório faltando ou fora do formato na configuração de um nó. */
    'CONFIG_INVALIDA',
    'LEGADO',
    /**
     * Regra da aba Cancelamento inválida (spec 2026-09-14, Fase 2): evento fora
     * do catálogo, origem que o evento não distingue/não oferece, "A quem se
     * refere" que não é template nem id, ou regra repetida para o mesmo alvo.
     */
    'CANCELAMENTO_INVALIDO',
    /**
     * Aresta que ainda sai pela saída "Cancelado" (aposentada) do node Aguardar
     * (D2, spec 2026-09-14) — o desenho precisa ser refeito sem essa saída.
     */
    'WAIT_FOR_SAIDA_ANTIGA',
    /**
     * Filtro inválido na aba Filtros de um nó (spec 2026-09-16, Fase 3): condição
     * mal formada, campo/operador incompatível, ou nó que não aceita filtros mas
     * tem `data.filters` preenchido.
     */
    'FILTRO_INVALIDO',
    /**
     * Ligação na saída "Cancelado" de um Aguardar que não tem regra própria na
     * aba Cancelamento (spec 2026-09-20 §7.1, D12) — a saída só existe com regra.
     */
    'WAIT_FOR_CANCELADO_SEM_REGRA',
    /**
     * Ligação presa num ponto de saída que não é "Sucesso" nem "Falha", num nó
     * que tem essas duas saídas (`nodeTypeHasSuccessFailureOutputs`, 2026-09-23).
     */
    'SUCESSO_FALHA_HANDLE_INVALIDO',
    /**
     * Ligação presa numa saída que o nó "Pergunta" não tem (2026-09-28) — em
     * geral a opção foi apagada ou o tipo de resposta mudou
     * (`askQuestionOutputHandles`).
     */
    'PERGUNTA_SAIDA_INVALIDA',
    /**
     * Regra "Mensagem recebida" da aba Cancelamento que continua valendo
     * enquanto um nó "Pergunta" espera a resposta (2026-09-28): a própria
     * resposta do cliente cancelaria o fluxo.
     */
    'PERGUNTA_CANCELADA_PELA_RESPOSTA',
];
