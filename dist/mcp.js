"use strict";
// MCP Server types
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_MODULE_GROUP_LABELS = exports.MCP_MODULE_GROUP_ORDER = exports.MCP_ACCOUNT_MODULE = void 0;
/**
 * Módulo de tela que só existe para o MCP: as ferramentas de "Minha conta"
 * (perfil, preferências do próprio usuário), que não pertencem a nenhum módulo
 * do catálogo de permissões.
 */
exports.MCP_ACCOUNT_MODULE = 'account';
/** Ordem das áreas na tela de autorização. */
exports.MCP_MODULE_GROUP_ORDER = [
    'account',
    'service',
    'sales',
    'marketing',
    'automation',
    'team',
    'reports',
    'settings',
];
exports.MCP_MODULE_GROUP_LABELS = {
    account: 'Sua conta',
    service: 'Atendimento',
    sales: 'Vendas e contatos',
    marketing: 'Marketing',
    automation: 'IA e automação',
    team: 'Equipe e operação',
    reports: 'Relatórios',
    settings: 'Empresa e configurações',
};
