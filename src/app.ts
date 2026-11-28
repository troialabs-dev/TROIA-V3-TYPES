import { ObjectId } from 'mongodb';
import { FullBaseDocument, ActiveStatus, PaginationQuery, GenericQueryOptions, ListResponse } from "./common";
import { TenantThemeOverrides, BaseThemeId } from './theme';
import type { CreditCostEntry } from './credits';

export interface PwaIcons {
  icon192: string;
  icon512: string;
  maskable512: string;
}

export interface App extends FullBaseDocument {
  name: string;
  logo: string;
  favicon?: string;
  status: ActiveStatus;
  baseThemeId?: BaseThemeId;
  themeOverrides?: TenantThemeOverrides;
  domains: string[];
  modules: string[];
  backendUrl: string;
  websiteUrl?: string;
  /** Host base do render de websites do tenant — preview vive em {websiteId}.{renderUrl} */
  renderUrl?: string;
  widgetUrl?: string;
  apiUrl?: string;
  mcpUrl?: string;
  support?: AppSupport;
  costs: CreditCostEntry[];
  pwaIcons?: PwaIcons;
  /**
   * Par de chaves VAPID do Web Push do widget, gerado uma única vez por app.
   *
   * **NUNCA regenerar**: a chave pública faz parte de toda subscription já
   * criada no browser dos visitantes — trocá-la invalida todas em silêncio.
   * A privada nunca sai do backend (a rota pública devolve só a pública).
   */
  vapidKeys?: VapidKeys;
  /** Mostra o motor da TroiaChat nas telas de entrada; ausente = não. */
  loginEngine?: boolean;
}

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

export interface AppSupportWidget {
  channelId: string;
  token: string;
}

export interface AppSupport {
  widget?: AppSupportWidget;
}

export interface CreateAppRequest {
  name: string;
  logo: string;
  baseThemeId?: BaseThemeId;
  themeOverrides?: TenantThemeOverrides;
  domains: string[];
  modules: string[];
  backendUrl: string;
  websiteUrl?: string;
  /** Host base do render de websites do tenant — preview vive em {websiteId}.{renderUrl} */
  renderUrl?: string;
  widgetUrl?: string;
  apiUrl?: string;
  mcpUrl?: string;
  support?: AppSupport;
}

export interface UpdateAppRequest {
  name?: string;
  logo?: string;
  favicon?: string;
  status?: ActiveStatus;
  baseThemeId?: BaseThemeId;
  themeOverrides?: TenantThemeOverrides;
  domains?: string[];
  modules?: string[];
  backendUrl?: string;
  websiteUrl?: string;
  /** Host base do render de websites do tenant — preview vive em {websiteId}.{renderUrl} */
  renderUrl?: string;
  widgetUrl?: string;
  apiUrl?: string;
  mcpUrl?: string;
  support?: AppSupport;
  pwaIcons?: PwaIcons;
  /** Mostra o motor da TroiaChat nas telas de entrada; ausente = não. */
  loginEngine?: boolean;
}

export type AppStatus = ActiveStatus;
// ============================================================
// APP SPECIFIC QUERY & RESPONSE TYPES
// ============================================================

// App query with specific filters
export interface AppQuery extends PaginationQuery {
  status?: ActiveStatus;
  name?: string;
  domains?: string[];
}

// App response (same as App for now, but prepared for future changes)
export interface AppResponse {
  id: string;
  name: string;
  logo: string;
  favicon?: string;
  status: ActiveStatus;
  baseThemeId?: BaseThemeId;
  themeOverrides?: TenantThemeOverrides;
  domains: string[];
  modules: string[];
  backendUrl: string;
  websiteUrl?: string;
  /** Host base do render de websites do tenant — preview vive em {websiteId}.{renderUrl} */
  renderUrl?: string;
  widgetUrl?: string;
  apiUrl?: string;
  mcpUrl?: string;
  support?: AppSupport;
  costs: CreditCostEntry[];
  pwaIcons?: PwaIcons;
  /** Mostra o motor da TroiaChat nas telas de entrada; ausente = não. */
  loginEngine: boolean;
  createdAt: string;
  updatedAt: string;
  // Phase A — provider capability flags
  hasEmailProvider: boolean;
  hasWhatsAppProvider: boolean;
}

// App list response using generic
export interface AppListResponse extends ListResponse<AppResponse> {}

// App query options using generic
export interface AppQueryOptions extends GenericQueryOptions<AppQuery> {}
