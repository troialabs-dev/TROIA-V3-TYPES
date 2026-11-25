import { ObjectId } from 'mongodb';
export interface BaseDocument {
    _id?: ObjectId;
    createdAt: Date;
    updatedAt?: Date;
}
export interface AppAwareDocument extends BaseDocument {
    appId: ObjectId;
}
export interface TenantAwareDocument extends BaseDocument {
    appId: ObjectId;
    companyId: ObjectId;
}
export interface FullBaseDocument extends BaseDocument, SoftDeletable {
}
export interface FullTenantDocument extends TenantAwareDocument, SoftDeletable {
}
export interface SoftDeletable {
    deletedAt?: Date;
}
export interface Auditable {
    createdAt: Date;
    updatedAt?: Date;
}
/**
 * Quem realizou uma ação no sistema.
 *
 * Nasceu em `activities.ts` e foi promovido para cá em 2026-08-30, quando o
 * carimbo de autoria (`CreatorStamp`) passou a valer para várias entidades.
 * `activities.ts` re-exporta para não quebrar quem já importava de lá.
 *
 * ⚠️ Nem todo valor é escrito. `cron` e `integration` estão declarados desde a
 * versão original e NENHUM caminho os grava. A lista do que é realmente
 * gravado é `WRITTEN_ACTOR_TYPES`, e existe um teste que trava a diferença —
 * a doença "declarado mas nunca escrito" já custou caro aqui.
 */
export type ActorType = 'user' | 'mcp' | 'api' | 'bot' | 'automation' | 'webhook' | 'cron' | 'integration' | 'system';
/** Os valores que algum caminho REALMENTE grava hoje. Travado por teste. */
export declare const WRITTEN_ACTOR_TYPES: readonly ActorType[];
/**
 * Carimbo de autoria de um registro.
 *
 * `createdBy` guarda o id do ATOR, seja ele quem for — pessoa, agente,
 * workflow ou chave de API —, e `createdByType` diz de que coleção esse id é.
 * Mesmo desenho que `ConversationMessage` já usa com `senderId`/`senderType`
 * (quando é IA, o `senderId` é o id do agente).
 *
 * ⚠️ NUNCA fazer `$lookup` de `createdBy` contra `users` sem antes filtrar
 * `createdByType` em `'user' | 'mcp' | 'api'`. Nos demais tipos o id é de
 * outra coleção e o join volta vazio em silêncio.
 *
 * Os dois são OPCIONAIS de propósito: registro anterior a 2026-08-30 não tem
 * a informação, e ausente é a verdade. Carimbar `system` no passado seria
 * inventar um fato.
 */
export interface CreatorStamp {
    createdByType?: ActorType;
    createdBy?: string;
    /**
     * Agentes internos E2 (24/11/2026, plano 2026-11-24-agentes-internos-e2.md E2-11): pessoa (id em
     * `users`) em nome de quem o agente agiu, quando ele usa o nível de quem pede. Só com
     * `createdByType === 'bot'`; com o nível próprio do agente fica ausente.
     */
    onBehalfOf?: string;
}
export interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: unknown[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiError {
    message: string;
    status: number;
    errors?: unknown[];
}
export interface PaginationOptions {
    page: number;
    limit: number;
}
export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}
export interface FilterOptions {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: unknown;
}
export interface QueryOptions {
    filters?: FilterOptions;
    sort?: SortOptions;
    pagination?: PaginationOptions;
}
export interface PaginationQuery {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
}
export interface SearchQuery extends PaginationQuery {
    filters?: Record<string, unknown>;
}
export interface FormFieldError {
    message: string;
}
export interface FormErrors {
    [key: string]: FormFieldError | undefined;
}
export interface FormState {
    isSubmitting: boolean;
    isDirty: boolean;
    errors: FormErrors;
}
export interface Notification {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        handler: () => void;
    };
}
export type EntityStatus = 'active' | 'inactive' | 'blocked';
export type ActiveStatus = 'active' | 'inactive';
export type ExtendedStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'error';
export interface EntityParams {
}
export interface RequestContext {
    appId: ObjectId;
    companyId?: ObjectId;
    userId?: ObjectId;
}
export interface GenericQueryOptions<T> extends PaginationQuery {
    filters?: Partial<T>;
}
export interface ListResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
export type MongoFilter<T = Record<string, any>> = Record<string, any>;
export interface MongoSortConfig {
    [key: string]: 1 | -1;
}
export interface MongoQueryOptions {
    filter: MongoFilter;
    sort?: MongoSortConfig;
    skip?: number;
    limit?: number;
    projection?: Record<string, 0 | 1>;
}
