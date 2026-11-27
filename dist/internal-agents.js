"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_VOICE_LIVE_LIMITS = exports.AGENT_STEP_DETAIL_LIMITS = exports.AGENT_PAGE_CONTEXT_LIMITS = exports.AGENT_TABLE_LIMITS = exports.AGENT_EXPORT_LIMITS = exports.AGENT_TASK_LIMITS = exports.AGENT_SESSION_LIMITS = void 0;
/** Limites do chat interno — usados pelo Zod do backend e pela tela. */
exports.AGENT_SESSION_LIMITS = {
    textMaxChars: 20_000,
    /** E4: gravação de voz — teto de duração (NUNCA #46) e de arquivo (limite do transcritor). */
    voiceMaxSeconds: 300,
    voiceMaxBytes: 24 * 1024 * 1024,
    attachmentsPerMessage: 5,
    titleMaxChars: 120,
    searchMaxChars: 100,
    conversationStartersMax: 6,
    conversationStarterMaxChars: 120,
    messagesPageMax: 100,
    /** Arquivo de texto (txt/csv/md/json) até este tamanho tem o conteúdo lido pelo agente. */
    inlineTextAttachmentMaxBytes: 200 * 1024,
};
// ── E6 (25/11/2026): tarefas agendadas — plano 2026-11-25-agentes-internos-e6.md §5 ──
/** Tetos das tarefas agendadas (decisões do dono Q3: 20 ativas por pessoa, no mínimo a cada 15 min). */
exports.AGENT_TASK_LIMITS = {
    maxActivePerUser: 20,
    minIntervalMinutes: 15,
    titleMaxChars: 120,
    instructionMaxChars: 4_000,
    maxConsecutiveFailures: 3,
    /** Prazo do cartão de confirmação numa execução agendada (ninguém está olhando). */
    confirmationHours: 24,
};
// ── E5 (25/11/2026): arquivo gerado, gráfico e "Vendo agora" — plano 2026-11-25-agentes-internos-e5.md §5 ──
/** Tetos da E5. `maxRows`: exportação direto do sistema (decisão do dono: 30 mil). */
exports.AGENT_EXPORT_LIMITS = {
    maxRows: 30_000,
    /** Linhas que o próprio agente escreve num documento (`generate_document`). */
    documentMaxRows: 2_000,
    chartMaxSeries: 8,
    chartMaxPoints: 200,
    /** Linhas da prévia guardada no bloco do arquivo (modo exibição). */
    previewRows: 50,
};
/** Tetos da tabela completa na tela (`show_list`, decisão do dono Q-B de 25/11/2026). */
exports.AGENT_TABLE_LIMITS = {
    /** Linhas guardadas por tabela (o mesmo teto da exportação). */
    maxRows: 30_000,
    /** Linhas que vêm dentro do cartão. */
    previewRows: 10,
    /** Linhas por página na tela. */
    pageSize: 100,
    /** Linhas por documento guardado no servidor. */
    chunkRows: 500,
    /** Colunas no máximo. */
    maxColumns: 40,
};
exports.AGENT_PAGE_CONTEXT_LIMITS = {
    routeMaxChars: 300,
    screenMaxChars: 120,
    entitiesMax: 10,
    filtersMax: 12,
    valueMaxChars: 120,
};
/** Passo de ferramenta mostrado na resposta ("Consultou a base Imóveis"). Sem args nem resultado. */
/** Tetos do detalhe de cada passo (plano de qualidade Q1/Q3, 25/11/2026). */
exports.AGENT_STEP_DETAIL_LIMITS = {
    /** Campos que o agente mandou, em JSON. */
    inputChars: 1_000,
    /** O que voltou, em JSON compacto. */
    outputChars: 4_000,
    /** Resumo de uma frase. */
    summaryChars: 200,
    /** O que entra no histórico do modelo por resposta anterior ("o que já consultei"). */
    historyCharsPerMessage: 600,
};
// ── E7: voz em tempo real (DOCS/superpowers/plans/2026-11-26-agentes-internos-e7-voz-tempo-real.md) ──
/** Limites da conversa de voz em tempo real (decisões V2 e V3 do dono, 26/11/2026). */
exports.AGENT_VOICE_LIVE_LIMITS = {
    /** Uma conversa de voz dura no máximo 10 minutos; a pessoa pode começar outra na hora. */
    sessionMaxMs: 600_000,
    /** Sem ninguém falar (nem a pessoa, nem o agente) por 1 minuto, encerra. */
    silenceMs: 60_000,
    /** Uma fala (segurar o botão) solta sozinha depois disso. */
    utteranceMaxMs: 120_000,
    /** Fala mais curta que isso é ignorada (toque sem querer). */
    utteranceMinMs: 300,
    /** Áudio enviado: PCM 16 bits, mono, nesta taxa. */
    sampleRate: 24_000,
    /** Tamanho de cada pedaço enviado pelo socket. */
    chunkMs: 100,
};
