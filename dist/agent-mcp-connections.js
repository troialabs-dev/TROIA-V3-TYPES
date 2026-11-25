"use strict";
/**
 * Conexões MCP externas dos agentes de IA (E3, 24/11/2026).
 *
 * Um agente (interno ou de atendimento) usa ferramentas de servidores MCP REMOTOS.
 * A conta conectada é da empresa e fica no agente (D5). Plano:
 * DOCS/superpowers/plans/2026-11-24-agentes-internos-e3.md
 *
 * Decisões do dono (24/11): segredos sem cifra, nunca devolvidos (Q1); qualquer contato
 * alcança as ferramentas liberadas (Q3); ferramenta que muda no servidor é aceita sozinha,
 * com histórico (Q4).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_MCP_LIMITS = void 0;
exports.AGENT_MCP_LIMITS = {
    connectionsPerAgent: 10,
    allowedToolsPerAgent: 40,
    toolsReadPerConnection: 200,
    nameMinChars: 2,
    nameMaxChars: 40,
    urlMaxChars: 2048,
    headersMax: 10,
    secretMaxChars: 4096,
    descriptionMaxChars: 1000,
    schemaMaxBytes: 16_384,
    resultMaxChars: 12_000,
    responseMaxBytes: 1_048_576,
    connectTimeoutMs: 10_000,
    defaultCallTimeoutMs: 30_000,
    minCallTimeoutMs: 5_000,
    maxCallTimeoutMs: 60_000,
    oauthStateTtlMinutes: 10,
    /** Tamanho máximo do histórico de mudanças por conexão. */
    changeLogMax: 50,
    /** Retrato mais velho que isso é relido depois da 1ª chamada da conexão no turno. */
    snapshotRefreshAfterHours: 24,
};
