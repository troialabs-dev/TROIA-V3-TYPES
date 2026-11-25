// MCP Server types

/**
 * @deprecated A tela não gera mais token (24/11/2026). A rota
 * `POST /users/me/mcp-token` continua no servidor para quem ainda depende dela;
 * conexões novas são feitas pelo login (OAuth) no endereço do MCP.
 */
export interface CreateMcpTokenResponse {
  fullToken: string;
  mcpUrl: string;
  configJson: string;
  prefix: string;
  createdAt: string;
}

// ============================================================================
// CONEXÕES POR LOGIN (OAuth) — 24/11/2026
// ============================================================================

/** O que uma conexão pode fazer num módulo: só ler, ou ler e alterar. */
export type McpModuleAccess = 'read' | 'write';

/**
 * Módulo de tela que só existe para o MCP: as ferramentas de "Minha conta"
 * (perfil, preferências do próprio usuário), que não pertencem a nenhum módulo
 * do catálogo de permissões.
 */
export const MCP_ACCOUNT_MODULE = 'account';

/** Liberação de uma conexão: módulo → acesso. Módulo ausente = sem acesso. */
export type McpModuleGrant = Record<string, McpModuleAccess>;

/**
 * Área em que a tela de autorização agrupa os módulos. É só apresentação:
 * a liberação continua módulo por módulo.
 */
export type McpModuleGroup =
  | 'account'
  | 'service'
  | 'sales'
  | 'marketing'
  | 'automation'
  | 'team'
  | 'reports'
  | 'settings';

/** Ordem das áreas na tela de autorização. */
export const MCP_MODULE_GROUP_ORDER: readonly McpModuleGroup[] = [
  'account',
  'service',
  'sales',
  'marketing',
  'automation',
  'team',
  'reports',
  'settings',
];

export const MCP_MODULE_GROUP_LABELS: Readonly<Record<McpModuleGroup, string>> = {
  account: 'Sua conta',
  service: 'Atendimento',
  sales: 'Vendas e contatos',
  marketing: 'Marketing',
  automation: 'IA e automação',
  team: 'Equipe e operação',
  reports: 'Relatórios',
  settings: 'Empresa e configurações',
};

/** Um módulo que o usuário pode liberar na tela de autorização. */
export interface McpGrantableModule {
  /** Nome do módulo no catálogo (`crm`, `chat`…) ou `account`. */
  module: string;
  displayName: string;
  /** `true` quando há alguma ferramenta de alteração que o nível do usuário permite neste módulo. */
  canWrite: boolean;
  /** Área em que a tela agrupa o módulo. */
  group: McpModuleGroup;
}

/** Pedido de autorização mostrado na tela `/mcp/autorizar/:requestId`. */
export interface McpAuthorizationRequestInfo {
  requestId: string;
  /** Nome que o app de IA declarou ao se registrar ("Claude", "ChatGPT"…). */
  clientName: string;
  /** Host do endereço de retorno do app (ex.: `claude.ai`, `localhost`, `cursor`). */
  redirectHost: string;
  /** O app de IA roda no computador do usuário (retorno para `localhost`). */
  isLoopback: boolean;
  /** Endereço do MCP (ex.: `https://mcp.troiachat.com`). */
  mcpUrl: string;
  /** Quando o pedido expira (ISO). */
  expiresAt: string;
  modules: McpGrantableModule[];
}

export interface ApproveMcpAuthorizationRequest {
  modules: McpModuleGrant;
}

/** Resposta de aprovar/recusar: o navegador segue para o app de IA. */
export interface McpAuthorizationDecisionResponse {
  redirectTo: string;
}

/** Uma conexão feita pelo login, como aparece em Minha Conta. */
export interface McpConnectionResponse {
  id: string;
  clientName: string;
  redirectHost: string;
  isLoopback: boolean;
  /** Começo da chave, só para reconhecer (`mcp_c_ab12…`). */
  tokenPrefix: string;
  modules: McpModuleGrant;
  /** A mesma liberação, com o nome de cada módulo para mostrar na tela (ordem alfabética). */
  grantedModules: Array<{ module: string; displayName: string; access: McpModuleAccess }>;
  createdAt: string;
  lastUsedAt?: string;
}

export interface McpConnectionsListResponse {
  /** Endereço que o usuário adiciona no app de IA (ex.: `https://mcp.troiachat.com`). Vazio quando o app não tem MCP configurado. */
  mcpUrl: string;
  connections: McpConnectionResponse[];
}
