import { AppAwareDocument, ActiveStatus, PaginationQuery, GenericQueryOptions, ListResponse } from './common';
export type ModuleCategory = 'core' | 'business' | 'integration' | 'analytics' | 'automation' | 'marketing' | 'communication' | 'dashboards';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'attend' | 'assign';
export type PermissionScope = 'all' | 'own' | 'team';
/**
 * Valid Module IDs - SINGLE SOURCE OF TRUTH
 *
 * This type defines ALL valid module identifiers used across the system.
 * MUST be kept in sync between:
 * - Frontend: Sidebar permission checks
 * - Backend: requirePermission() middleware
 *
 * Adding a new module? Update this list first!
 */
export type ValidModuleId = 'app' | 'users' | 'companies' | 'levels' | 'plans' | 'channels' | 'integrations' | 'company-integrations' | 'payments' | 'crm' | 'chat' | 'customers' | 'activities' | 'conversations' | 'conversation-messages' | 'tickets' | 'assignments' | 'contacts' | 'groups' | 'group-participants' | 'funnels' | 'funnel-steps' | 'goals' | 'projects' | 'gamification' | 'products' | 'orders' | 'campaigns' | 'audiences' | 'templates' | 'quick-messages' | 'calendar' | 'calls' | 'reports' | 'reports-csat' | 'knowledge' | 'company' | 'teams' | 'skills' | 'shifts' | 'services' | 'email-templates' | 'email-domains' | 'saved-cards' | 'api-keys' | 'agents' | 'tools' | 'databases' | 'workflows' | 'websites' | 'voices' | 'forms' | 'units' | 'tags' | 'checklists' | 'sla-policies' | 'ticket-pipelines' | 'ticket-stages' | 'dashboards-commercial' | 'dashboards-support' | 'dashboards-marketing' | 'dashboards-analytics';
export interface Module extends AppAwareDocument {
    name: string;
    displayName: string;
    description: string;
    icon?: string;
    availableActions: PermissionAction[];
    requiresScope: boolean;
    defaultScope: PermissionScope;
    category: ModuleCategory;
    status: ActiveStatus;
}
export interface ModulePermission {
    actions: PermissionAction[];
    scope?: PermissionScope;
}
export interface ModuleQuery extends PaginationQuery {
    status?: ActiveStatus;
    category?: ModuleCategory;
    name?: string;
    requiresScope?: boolean;
}
export type ModuleResponse = Module;
export interface ModuleListResponse extends ListResponse<ModuleResponse> {
}
export interface ModuleQueryOptions extends GenericQueryOptions<ModuleQuery> {
}
export interface CreateModuleRequest {
    name: string;
    displayName: string;
    description: string;
    icon?: string;
    availableActions: PermissionAction[];
    requiresScope: boolean;
    defaultScope: PermissionScope;
    category: ModuleCategory;
}
export interface UpdateModuleRequest {
    displayName?: string;
    description?: string;
    icon?: string;
    availableActions?: PermissionAction[];
    requiresScope?: boolean;
    defaultScope?: PermissionScope;
    category?: ModuleCategory;
    status?: ActiveStatus;
}
