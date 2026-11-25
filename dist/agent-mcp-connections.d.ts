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
export type AgentMcpAuthType = 'none' | 'bearer' | 'headers' | 'oauth';
export type AgentMcpConnectionStatus = 'active' | 'needs_auth' | 'error';
export type AgentMcpTransport = 'streamable-http' | 'sse';
export type AgentMcpToolAccess = 'read' | 'write';
/** Tipos de mudança registrados no histórico da conexão (Q4). */
export type AgentMcpToolChangeKind = 'added' | 'removed' | 'description' | 'schema' | 'became_incompatible';
export interface AgentMcpToolChange {
    /** ISO. */
    at: string;
    /** Nome real no servidor. */
    toolName: string;
    kind: AgentMcpToolChangeKind;
    /** Resumo curto: descrição cortada em 300, ou lista de parâmetros "a, b*, c" (* = obrigatório). */
    before?: string;
    after?: string;
    /** Onde foi percebida: no "Testar conexão" ou numa releitura automática. */
    source: 'test' | 'auto_refresh';
}
export declare const AGENT_MCP_LIMITS: {
    readonly connectionsPerAgent: 10;
    readonly allowedToolsPerAgent: 40;
    readonly toolsReadPerConnection: 200;
    readonly nameMinChars: 2;
    readonly nameMaxChars: 40;
    readonly urlMaxChars: 2048;
    readonly headersMax: 10;
    readonly secretMaxChars: 4096;
    readonly descriptionMaxChars: 1000;
    readonly schemaMaxBytes: 16384;
    readonly resultMaxChars: 12000;
    readonly responseMaxBytes: 1048576;
    readonly connectTimeoutMs: 10000;
    readonly defaultCallTimeoutMs: 30000;
    readonly minCallTimeoutMs: 5000;
    readonly maxCallTimeoutMs: 60000;
    readonly oauthStateTtlMinutes: 10;
    /** Tamanho máximo do histórico de mudanças por conexão. */
    readonly changeLogMax: 50;
    /** Retrato mais velho que isso é relido depois da 1ª chamada da conexão no turno. */
    readonly snapshotRefreshAfterHours: 24;
};
export interface AgentMcpToolSnapshot {
    /** Nome REAL no servidor. */
    name: string;
    /** Nome para o modelo: mcp_<slug>_<ferramenta>. */
    toolId: string;
    title?: string;
    /** Já cortada em descriptionMaxChars. */
    description: string;
    /** Nomes dos parâmetros (para o editor); o esquema completo não sai na API. */
    params: Array<{
        name: string;
        required: boolean;
        label: string;
    }>;
    access: AgentMcpToolAccess;
    accessSource: 'annotation' | 'default' | 'admin';
    allowed: boolean;
    compatible: boolean;
    /** pt-BR curto. */
    incompatibleReason?: string;
    /** Última vez que a descrição ou os parâmetros mudaram no servidor (ISO). */
    lastChangedAt?: string;
}
export interface AgentMcpConnectionResponse {
    id: string;
    agentId: string;
    name: string;
    slug: string;
    url: string;
    authType: AgentMcpAuthType;
    /** Nunca o segredo. */
    hasSecret: boolean;
    /** Últimos 4 caracteres do token (bearer) — nunca mais que isso. */
    secretHint?: string;
    /** Só os NOMES dos cabeçalhos guardados. */
    headerNames?: string[];
    transport?: AgentMcpTransport;
    status: AgentMcpConnectionStatus;
    /** ISO. */
    lastCheckedAt?: string;
    /** pt-BR, sem segredo. */
    lastError?: string;
    serverName?: string;
    serverVersion?: string;
    callTimeoutMs: number;
    tools: AgentMcpToolSnapshot[];
    allowedCount: number;
    /** Histórico de mudanças das ferramentas, a mais nova primeiro (até changeLogMax). */
    changes: AgentMcpToolChange[];
    createdAt: string;
    updatedAt: string;
}
export interface CreateAgentMcpConnectionRequest {
    name: string;
    url: string;
    authType: AgentMcpAuthType;
    /** authType 'bearer'. */
    bearerToken?: string;
    /** authType 'headers'. */
    headers?: Array<{
        name: string;
        value: string;
    }>;
    /** oauth: client_id pré-cadastrado, quando o servidor não aceita registro dinâmico. */
    oauthClientId?: string;
    callTimeoutMs?: number;
}
export interface UpdateAgentMcpConnectionRequest {
    name?: string;
    url?: string;
    authType?: AgentMcpAuthType;
    /** Ausente = mantém o guardado; '' = apaga. */
    bearerToken?: string;
    /** Ausente = mantém; lista = substitui (value '' mantém o valor daquele nome). */
    headers?: Array<{
        name: string;
        value: string;
    }>;
    oauthClientId?: string;
    callTimeoutMs?: number;
    /** Liberar/bloquear e trocar consulta/altera. */
    tools?: Array<{
        name: string;
        allowed?: boolean;
        access?: AgentMcpToolAccess;
    }>;
}
export interface AgentMcpConnectionTestResponse {
    connection: AgentMcpConnectionResponse;
    /** `changed` = mudou e foi aceita sozinha; `incompatible` = saiu do conjunto por formato. */
    diff: {
        added: string[];
        removed: string[];
        changed: string[];
        incompatible: string[];
    };
}
export interface StartAgentMcpOAuthResponse {
    authorizationUrl: string;
}
