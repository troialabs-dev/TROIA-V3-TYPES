// Common types
export * from './common';

// Core modules
export * from './app';
export * from './companies';
export * from './device';
export * from './user';
export * from './modules';
export * from './plans';
export * from './levels';
export * from './company-plans';
export * from './mcp';

// Business modules
export * from './teams';
export * from './channels';
export * from './shifts';
export * from './skills';
export * from './company-integrations';
// Context-users (shared enums for channels-users / funnels-users / ticket-pipelines-users)
export * from './context-users';
// Distribution engine (replaces legacy assignments module — coexists with it until Phase 10)
export * from './distribution';
// Funnels-Users pivot (visibility + scope + attendant pool for funnels)
export * from './funnels-users';
// Ticket-Pipelines-Users pivot (visibility + scope + attendant pool for ticket pipelines)
export * from './ticket-pipelines-users';
export * from './app-integrations';
export * from './user-integrations';
export * from './api-keys';
export * from './email-templates';

// Provider system (shared between app & company integrations)
export * from './providers';
export * from './gateway';
export * from './ai';

// Email domains module (Resend integration)
export * from './email-domains';

// Queue system (shared between Backend & Gateway)
export * from './queue-jobs';

// Validation utilities (shared between Gateway & Backend)
export * from './validation';

// Communication system
export * from './communications';

// Socket.IO Events (shared between Frontend & Backend)
export * from './socket-events';

// Payment system
export * from './payments';
export * from './saved-cards';

// Customer service modules
export * from './contacts';
// CPF e data de nascimento digitados pelo cliente (captura por QR)
export * from './personal-data';
export * from './customers';
export * from './leads';
export * from './funnels';

// Inactivity alerts (config por funil/etapa + resultado computado no card)
export * from './alerts';

// Ticket Pipelines & Stages
export * from './ticket-pipelines';

// Phase 2: Advanced customer service modules
export * from './tickets';
export * from './ticket-followers';
export * from './conversations';
export * from './conversation-messages';
export * from './chat-dashboard';
export * from './activities';
export * from './notifications';

// Calendar & Scheduling
export * from './calendar';

// Group conversation support
export * from './groups';
export * from './group-participants';

// RAG/Vector Search support
export * from './message-chunks';

// Marketing modules
export * from './templates';
export * from './template-render';
export * from './campaigns';
export * from './audiences';

// Quick Messages (canned responses for the chat composer)
export * from './quick-messages';

// Databases module (multi-purpose data segregation)
export * from './databases';

// AI Agents modules (Phase 1)
export * from './ai-agents';
export * from './agent-analytics';
export * from './agent-prompt-tags';
export * from './escalation-rules';
export * from './custom-actions';
export * from './custom-action-logs';
// Agent Webhook Logs — execution log for AI Agent webhook receiver (GET /api/agent-webhook-logs)
export * from './agent-webhook-logs';
export * from './agent-golden-cases';

// Lead Routing Rules (automatic lead assignment by conditions)
export * from './leads-routing-rules';

// Workflows/Automation module
export * from './workflows';
export * from './workflow-node-schemas';

// CRM Reports module
export * from './crm-reports';

// Websites module (website builder)
export * from './websites';

// Voices module (voice cloning for AI agents)
export * from './voices';

// Forms module (public form builder)
export * from './forms';

// Internal Team Chat (user-to-user chat, Redis-backed, 72h TTL)
export * from './internal-chat';

// Kanban system (generic + lead-specific contracts)
export * from './kanban';

// MongoDB Document Models (ObjectId/Date types for repositories)
export * from './models';

// Theme overrides (tenant customization)
export * from './theme';

// Credits system (balance, transactions, subscriptions, cost table)
export * from './credits';
export * from './storage-usage';

// Transfer requests (shared across conversations, tickets, leads transfer endpoints)
export * from './transfer';

// Assignment context (canonical metadata for assignment/transfer audit log)
export * from './assignment-context';

// Channel rate limits (GET/PATCH/DELETE /channels/:id/rate-limits)
export * from './channel-rate-limits';

// Goals module (Phase 3 — commercial dashboard targets for users/teams/company)
export * from './goals';

// Channel Dashboard module (F0 — 5 collections: media, comments, metrics, activities, sync-state)
export * from './channel-dashboard';

// Commercial Dashboard module (Phase 4 — request/response types for /api/dashboards/commercial)
export * from './dashboards-commercial';

// Marketing Dashboard module — request/response types for /api/dashboards/marketing
// (Source/Medium/Channel enums vivem em ./leads — single source of truth canônica)
export * from './dashboards-marketing';

// Agent Evaluators catalog (labels, descriptions, tier, aliases) — single
// source of truth pro sistema interno de qualidade dos agentes IA
export * from './agent-evaluators';

// Widget configuration (chat widget + hosted page)
export * from './widget';

// Conversation semantic search (MCP tool request/response)
export * from './conversation-search';

// History Imports module (Importação de Histórico WhatsApp)
export * from './history-imports';

// Projects module (Gestão de projetos — Gantt de tickets do helpdesk)
export * from './projects';

// Ticket Emails module (Plano B — e-mails de ticket "de e-mail", threading RFC)
export * from './ticket-emails';

// Email Retentions module (Plano B — retenção de e-mails antes de virarem ticket)
export * from './email-retentions';

// Units module (localizações/filiais físicas — dono do pool de checklists)
export * from './units';

// Views — visitas medidas (contador de fluxo físico, GA, tracker próprio).
// `ViewIngestBatch` é o contrato único de ingestão, agnóstico a provider.
export * from './views';

// Dashboard de Analytics — leitura agregada das visitas medidas.
export * from './dashboards-analytics';

// Checklists module (execução de checklists a partir de Form templates type='checklist')
export * from './checklists';

// SLA engine (políticas, relógios e log append-only — spec 2026-07-27)
export * from './sla';

// Lead Capture (QR Code) — sessão Redis, página pública, socket (spec 2026-08-20)
export * from './lead-capture';

// Gamification — regras, níveis, livro-caixa, ranking
export * from './gamification';

// Seller Dashboard — GET /api/leads/seller-dashboard (dentro do módulo CRM)
export * from './seller-dashboard';

// Tags — catálogo de tags do tenant (contatos, tickets, clientes, conversas).
// O vínculo é pela PALAVRA, não por id: ver o cabeçalho de `tags.ts`.
export * from './tags';

// Relatório de CSAT — GET /api/reports/csat (permissão `reports-csat`)
export * from './csat-report';
