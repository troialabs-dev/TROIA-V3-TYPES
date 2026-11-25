"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_SESSION_LIMITS = void 0;
/** Limites do chat interno — usados pelo Zod do backend e pela tela. */
exports.AGENT_SESSION_LIMITS = {
    textMaxChars: 20_000,
    attachmentsPerMessage: 5,
    titleMaxChars: 120,
    searchMaxChars: 100,
    conversationStartersMax: 6,
    conversationStarterMaxChars: 120,
    messagesPageMax: 100,
    /** Arquivo de texto (txt/csv/md/json) até este tamanho tem o conteúdo lido pelo agente. */
    inlineTextAttachmentMaxBytes: 200 * 1024,
};
