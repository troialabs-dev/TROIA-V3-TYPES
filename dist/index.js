"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Common types
__exportStar(require("./common"), exports);
// Core modules
__exportStar(require("./app"), exports);
__exportStar(require("./companies"), exports);
__exportStar(require("./device"), exports);
__exportStar(require("./user"), exports);
__exportStar(require("./modules"), exports);
__exportStar(require("./plans"), exports);
__exportStar(require("./levels"), exports);
__exportStar(require("./company-plans"), exports);
__exportStar(require("./mcp"), exports);
// Business modules
__exportStar(require("./teams"), exports);
__exportStar(require("./channels"), exports);
__exportStar(require("./shifts"), exports);
__exportStar(require("./skills"), exports);
__exportStar(require("./company-integrations"), exports);
// Context-users (shared enums for channels-users / funnels-users / ticket-pipelines-users)
__exportStar(require("./context-users"), exports);
// Distribution engine (replaces legacy assignments module — coexists with it until Phase 10)
__exportStar(require("./distribution"), exports);
// Funnels-Users pivot (visibility + scope + attendant pool for funnels)
__exportStar(require("./funnels-users"), exports);
// Ticket-Pipelines-Users pivot (visibility + scope + attendant pool for ticket pipelines)
__exportStar(require("./ticket-pipelines-users"), exports);
__exportStar(require("./app-integrations"), exports);
__exportStar(require("./user-integrations"), exports);
__exportStar(require("./api-keys"), exports);
__exportStar(require("./email-templates"), exports);
// Provider system (shared between app & company integrations)
__exportStar(require("./providers"), exports);
__exportStar(require("./gateway"), exports);
__exportStar(require("./ai"), exports);
// Email domains module (Resend integration)
__exportStar(require("./email-domains"), exports);
// Queue system (shared between Backend & Gateway)
__exportStar(require("./queue-jobs"), exports);
// Validation utilities (shared between Gateway & Backend)
__exportStar(require("./validation"), exports);
// Communication system
__exportStar(require("./communications"), exports);
// Socket.IO Events (shared between Frontend & Backend)
__exportStar(require("./socket-events"), exports);
// Payment system
__exportStar(require("./payments"), exports);
__exportStar(require("./saved-cards"), exports);
// Customer service modules
__exportStar(require("./contacts"), exports);
// CPF e data de nascimento digitados pelo cliente (captura por QR)
__exportStar(require("./personal-data"), exports);
__exportStar(require("./customers"), exports);
__exportStar(require("./leads"), exports);
__exportStar(require("./funnels"), exports);
// Inactivity alerts (config por funil/etapa + resultado computado no card)
__exportStar(require("./alerts"), exports);
// Ticket Pipelines & Stages
__exportStar(require("./ticket-pipelines"), exports);
// Phase 2: Advanced customer service modules
__exportStar(require("./tickets"), exports);
__exportStar(require("./ticket-followers"), exports);
__exportStar(require("./conversations"), exports);
__exportStar(require("./conversation-messages"), exports);
__exportStar(require("./chat-dashboard"), exports);
__exportStar(require("./activities"), exports);
__exportStar(require("./notifications"), exports);
// Calendar & Scheduling
__exportStar(require("./calendar"), exports);
// Group conversation support
__exportStar(require("./groups"), exports);
__exportStar(require("./group-participants"), exports);
// RAG/Vector Search support
__exportStar(require("./message-chunks"), exports);
// Marketing modules
__exportStar(require("./templates"), exports);
__exportStar(require("./template-render"), exports);
__exportStar(require("./campaigns"), exports);
__exportStar(require("./audiences"), exports);
// Quick Messages (canned responses for the chat composer)
__exportStar(require("./quick-messages"), exports);
// Databases module (multi-purpose data segregation)
__exportStar(require("./databases"), exports);
// AI Agents modules (Phase 1)
__exportStar(require("./ai-agents"), exports);
__exportStar(require("./agent-analytics"), exports);
__exportStar(require("./agent-prompt-tags"), exports);
__exportStar(require("./escalation-rules"), exports);
__exportStar(require("./custom-actions"), exports);
__exportStar(require("./custom-action-logs"), exports);
// Agent Webhook Logs — execution log for AI Agent webhook receiver (GET /api/agent-webhook-logs)
__exportStar(require("./agent-webhook-logs"), exports);
__exportStar(require("./agent-golden-cases"), exports);
// Lead Routing Rules (automatic lead assignment by conditions)
__exportStar(require("./leads-routing-rules"), exports);
// Workflows/Automation module
__exportStar(require("./workflows"), exports);
__exportStar(require("./workflow-node-schemas"), exports);
// CRM Reports module
__exportStar(require("./crm-reports"), exports);
// Websites module (website builder)
__exportStar(require("./websites"), exports);
// Voices module (voice cloning for AI agents)
__exportStar(require("./voices"), exports);
// Forms module (public form builder)
__exportStar(require("./forms"), exports);
// Internal Team Chat (user-to-user chat, Redis-backed, 72h TTL)
__exportStar(require("./internal-chat"), exports);
// Kanban system (generic + lead-specific contracts)
__exportStar(require("./kanban"), exports);
// MongoDB Document Models (ObjectId/Date types for repositories)
__exportStar(require("./models"), exports);
// Theme overrides (tenant customization)
__exportStar(require("./theme"), exports);
// Credits system (balance, transactions, subscriptions, cost table)
__exportStar(require("./credits"), exports);
__exportStar(require("./storage-usage"), exports);
// Transfer requests (shared across conversations, tickets, leads transfer endpoints)
__exportStar(require("./transfer"), exports);
// Assignment context (canonical metadata for assignment/transfer audit log)
__exportStar(require("./assignment-context"), exports);
// Channel rate limits (GET/PATCH/DELETE /channels/:id/rate-limits)
__exportStar(require("./channel-rate-limits"), exports);
// Goals module (Phase 3 — commercial dashboard targets for users/teams/company)
__exportStar(require("./goals"), exports);
// Channel Dashboard module (F0 — 5 collections: media, comments, metrics, activities, sync-state)
__exportStar(require("./channel-dashboard"), exports);
// Commercial Dashboard module (Phase 4 — request/response types for /api/dashboards/commercial)
__exportStar(require("./dashboards-commercial"), exports);
// Marketing Dashboard module — request/response types for /api/dashboards/marketing
// (Source/Medium/Channel enums vivem em ./leads — single source of truth canônica)
__exportStar(require("./dashboards-marketing"), exports);
// Agent Evaluators catalog (labels, descriptions, tier, aliases) — single
// source of truth pro sistema interno de qualidade dos agentes IA
__exportStar(require("./agent-evaluators"), exports);
// Widget configuration (chat widget + hosted page)
__exportStar(require("./widget"), exports);
// Conversation semantic search (MCP tool request/response)
__exportStar(require("./conversation-search"), exports);
// History Imports module (Importação de Histórico WhatsApp)
__exportStar(require("./history-imports"), exports);
// Projects module (Gestão de projetos — Gantt de tickets do helpdesk)
__exportStar(require("./projects"), exports);
// Ticket Emails module (Plano B — e-mails de ticket "de e-mail", threading RFC)
__exportStar(require("./ticket-emails"), exports);
// Email Retentions module (Plano B — retenção de e-mails antes de virarem ticket)
__exportStar(require("./email-retentions"), exports);
// Units module (localizações/filiais físicas — dono do pool de checklists)
__exportStar(require("./units"), exports);
// Views — visitas medidas (contador de fluxo físico, GA, tracker próprio).
// `ViewIngestBatch` é o contrato único de ingestão, agnóstico a provider.
__exportStar(require("./views"), exports);
// Dashboard de Analytics — leitura agregada das visitas medidas.
__exportStar(require("./dashboards-analytics"), exports);
// Checklists module (execução de checklists a partir de Form templates type='checklist')
__exportStar(require("./checklists"), exports);
// SLA engine (políticas, relógios e log append-only — spec 2026-07-27)
__exportStar(require("./sla"), exports);
// Lead Capture (QR Code) — sessão Redis, página pública, socket (spec 2026-08-20)
__exportStar(require("./lead-capture"), exports);
// Gamification — regras, níveis, livro-caixa, ranking
__exportStar(require("./gamification"), exports);
// Seller Dashboard — GET /api/leads/seller-dashboard (dentro do módulo CRM)
__exportStar(require("./seller-dashboard"), exports);
// Tags — catálogo de tags do tenant (contatos, tickets, clientes, conversas).
// O vínculo é pela PALAVRA, não por id: ver o cabeçalho de `tags.ts`.
__exportStar(require("./tags"), exports);
// Relatório de CSAT — GET /api/reports/csat (permissão `reports-csat`)
__exportStar(require("./csat-report"), exports);
