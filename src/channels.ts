import { ObjectId } from 'mongodb';
import { PaginationQuery, ListResponse, GenericQueryOptions, ExtendedStatus } from './common';
import type { ChannelWarmup } from './credits';
import type { DistributionConfig } from './distribution';

// ============================================================================
// EMAIL CHANNEL CONFIG (for email-resend provider)
// ============================================================================

export interface EmailChannelConfig {
  domainId: string;
  emailAddress: string;
  displayName: string;
  signature?: string;
  autoCreateTicket?: boolean;
  /**
   * Modo de criação de ticket a partir de e-mail inbound (Plano B).
   * - 'off': comportamento legado — inbound cria/segue conversation no chat.
   * - 'review': e-mail fica em retenção (`EmailRetention`, status 'pending')
   *   até aprovação manual antes de virar ticket.
   * - 'auto': ticket é criado automaticamente a partir do e-mail.
   * Legado `autoCreateTicket: true` sem este campo ⇒ tratado como 'auto'.
   */
  ticketCreationMode?: 'off' | 'review' | 'auto';
  ticketCategory?: string;
  ticketPriority?: string;
  ticketTeamId?: string;
  autoReplyEnabled?: boolean;
  autoReplyMessage?: string;
}

// ============================================================================
// CHANNEL PROVIDER TYPES (CompanyIntegration defined in company-integrations.ts)
// ============================================================================

export interface ChannelProvider {
  name: string;
  categories: string[];
  capabilities: string[];
  status: ExtendedStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CHANNEL EXPIRATION CONFIG
// ============================================================================

/**
 * Configuração de expiração de atendimento para canais.
 * Permite finalizar automaticamente conversas inativas após um período.
 */
export interface ChannelExpirationConfig {
  /** Se a expiração de atendimento está habilitada */
  enabled: boolean;
  /** Tempo em minutos para considerar um atendimento expirado */
  expirationMinutes: number;
  /** Mensagem opcional a ser enviada quando o atendimento expirar */
  expirationMessage?: string;
}

// ============================================================================
// CHANNEL TRANSCRIPTION CONFIG
// ============================================================================

/**
 * Configuração de transcrição automática (STT) de mídias recebidas no canal.
 * Canal SEM este campo = tudo habilitado (comportamento legado, day-0).
 * A partir do primeiro save via UI o campo passa a existir e é respeitado.
 * Afeta apenas a transcrição AUTOMÁTICA no recebimento — a transcrição
 * sob demanda (botão no chat) ignora estas flags.
 */
export interface ChannelTranscriptionConfig {
  /** Transcrever automaticamente áudios recebidos */
  audio: boolean;
  /** Transcrever automaticamente vídeos recebidos */
  video: boolean;
}

// ============================================================================
// CHANNEL SATISFACTION (CSAT) CONFIG
// ============================================================================

/**
 * Opção de resposta da pesquisa CSAT. Escala fixa: menor = melhor
 * (1=Ótimo … 5=Péssimo). O contato pode responder com o número, o emoji
 * ou a legenda.
 */
export interface ChannelSatisfactionOption {
  value: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
}

/**
 * Pesquisa de satisfação (CSAT) enviada ao contato no encerramento do
 * atendimento. Ausente ou enabled !== true = desligado (day-0 off).
 * Só atua quando a conversa não está sob agente IA ativo.
 */
export interface ChannelSatisfactionConfig {
  enabled: boolean;
  /** Texto da pesquisa enviada junto das opções */
  message: string;
  /** 2 a 5 opções com value único */
  options: ChannelSatisfactionOption[];
  /** Janela (minutos) após o encerramento para aceitar a resposta */
  timeoutMinutes: number;
}

/**
 * Pesquisa padrão do sistema — FONTE ÚNICA (2026-09-23). A tela do canal
 * pré-preenche com ela, e o nó "CSAT — Satisfação do Cliente" do workflow a
 * usa quando o canal nunca configurou a própria pesquisa. `enabled: false`:
 * o padrão não liga a pesquisa em canal nenhum (day-0 off continua valendo).
 */
export const DEFAULT_CHANNEL_SATISFACTION_CONFIG: ChannelSatisfactionConfig = {
  enabled: false,
  message: 'Como você avalia o atendimento que acabou de receber? Responda com o número da opção:',
  options: [
    { value: 1, emoji: '😍', label: 'Ótimo' },
    { value: 2, emoji: '🙂', label: 'Bom' },
    { value: 3, emoji: '😐', label: 'Regular' },
    { value: 4, emoji: '🙁', label: 'Ruim' },
    { value: 5, emoji: '😡', label: 'Péssimo' },
  ],
  timeoutMinutes: 60,
};

// ============================================================================
// CHANNEL OUT-OF-HOURS CONFIG
// ============================================================================

/**
 * Auto-resposta para mensagens recebidas fora do horário comercial da
 * empresa (company.businessCalendar). Ausente ou enabled !== true =
 * desligado. Máximo 3 respostas por conversa; só sem agente IA ativo.
 */
export interface ChannelOutOfHoursConfig {
  enabled: boolean;
  message: string;
}

// ============================================================================
// CHANNEL INACTIVITY TRANSFER CONFIG
// ============================================================================

/**
 * Para quem a conversa vai quando o responsável não responde:
 * - `distribution`: o método da Configuração de Distribuição do canal (ou o
 *   rodízio dentro da equipe da conversa, quando ela tem equipe — D13);
 * - `fixed_operator`: uma pessoa fixa (ex.: gerente). A corrente termina nela.
 */
export type InactivityTransferTarget = 'distribution' | 'fixed_operator';

/**
 * Transferência automática por inatividade do operador (spec
 * 2026-09-29-transferencia-por-inatividade). Ausente ou `enabled !== true` =
 * desligado — nada muda no dia do deploy para quem não ligar.
 */
export interface ChannelInactivityTransferConfig {
  enabled: boolean;
  /** Minutos sem resposta humana até transferir (de expediente, se `businessHoursOnly`). 1–1440. */
  timeoutMinutes: number;
  target: InactivityTransferTarget;
  /** Obrigatório com `target: 'fixed_operator'`. Usuário ativo da empresa — não precisa ser atendente do canal (D12). */
  fixedOperatorUserId?: string;
  /** D10 — o tempo só conta dentro do horário comercial da empresa. Sem calendário = relógio corrido. */
  businessHoursOnly: boolean;
  /** D4 — máximo de transferências por espera do cliente. Ao atingir, a conversa fica com o último. 1–10. */
  maxTransfers: number;
  /** D2 — o lead aberto do contato, se era de quem deixou o cliente sem resposta, acompanha a conversa. */
  transferLinkedLead: boolean;
}

export const DEFAULT_CHANNEL_INACTIVITY_TRANSFER_CONFIG: ChannelInactivityTransferConfig = {
  enabled: false,
  timeoutMinutes: 10,
  target: 'distribution',
  businessHoursOnly: true,
  maxTransfers: 3,
  transferLinkedLead: false,
};

// ============================================================================
// CHANNEL USER (operators vinculados a um canal)
// ============================================================================

export type ChannelUserRole = 'viewer' | 'attendant';
export type ChannelUserScope = 'own' | 'team' | 'all';

export interface ChannelUser {
  id: string;
  channelId: string;
  userId: string;
  role: ChannelUserRole;
  scope: ChannelUserScope;
  priority?: number | null;
  capabilities?: string[];
  status: 'active' | 'inactive';
  assignedAt: string;
}

// ============================================================================
// CHANNEL DISCONNECT INFO
// ============================================================================

/**
 * Informações sobre a última desconexão do canal — preenchidas pelo backend
 * ao detectar desconexão via provider oficial, gateway ou health check.
 */
export interface ChannelDisconnectInfo {
  reason: string;       // motivo técnico cru (texto do provider/gateway/health)
  code?: string;        // ex: '190', 'health_check_failed', 'gateway'
  source: 'official_provider' | 'gateway' | 'health_check';
  at: string;           // ISO timestamp
}

// ============================================================================
// CHANNEL ENTITY
// ============================================================================

/**
 * Horário de funcionamento para contas Business.
 * open_time/close_time são minutos desde meia-noite (ex: 480 = 08:00).
 */
export interface ChannelBusinessHours {
  dayOfWeek: string;             // mon, tue, wed, thu, fri, sat, sun
  mode: string;                  // 'open_24h' | 'appointment_only' | 'specific_hours'
  openTime?: number;             // minutos desde meia-noite
  closeTime?: number;
}

/**
 * Informações da conta conectada — preenchidas pelo provider (Baileys/whatsmeow)
 * no momento da conexão e em eventos de atualização. Permite enriquecer a UI do
 * card de canal com foto, nome de exibição, business profile e plataforma reais.
 */
export interface ChannelAccountInfo {
  // Identidade básica
  pushName?: string;             // Nome do perfil (ex: "João Silva")
  verifiedName?: string;         // Nome verificado em contas Business
  businessName?: string;         // Nome comercial (para Business)
  platform?: string;             // ios, android, web, windows, mac

  // Imagens
  profilePictureUrl?: string;    // URL da foto de perfil (WhatsApp CDN — pode expirar)
  hasProfilePicture?: boolean;   // true quando a conta tem foto mas o servidor bloqueou URL (anti-scraping)
  coverPhotoUrl?: string;        // URL da foto de capa (apenas contas Business)

  // Recado/status do perfil
  status?: string;

  // Business profile (só preenchido em contas Business)
  description?: string;          // Descrição do negócio
  email?: string;
  address?: string;
  websites?: string[];
  category?: string;             // Categoria principal
  categories?: string[];         // Todas as categorias (Go expõe lista)
  businessHours?: ChannelBusinessHours[];
  timezone?: string;             // IANA TZ (ex: "America/Sao_Paulo")

  updatedAt?: string;            // ISO timestamp da última atualização
}

export interface Channel {
  name: string;
  integrationId: ObjectId;    // Reference to the automatically created integration
  identifier: string;         // ✅ Apenas dígitos (ex: "5511999887766") — normalizado
  providerId?: string;        // Provider ID for conditional UI rendering
  instanceKey?: string;       // For Gateway providers
  instanceToken?: string;     // For Gateway providers
  identifyUser?: boolean;     // If true, operator name is added to outgoing messages
  accountInfo?: ChannelAccountInfo; // ✅ Dados vindos do provider ao conectar
  /** Informações sobre a última desconexão — preenchidas ao detectar status 'error'/'pending' */
  disconnectInfo?: ChannelDisconnectInfo;
  /** Configuração de expiração automática de atendimentos */
  expirationConfig?: ChannelExpirationConfig;
  /** Transcrição automática de áudios/vídeos recebidos — ausente = tudo habilitado */
  transcriptionConfig?: ChannelTranscriptionConfig;
  /** Pesquisa CSAT no encerramento — ausente = desligado */
  satisfactionConfig?: ChannelSatisfactionConfig;
  /** Auto-resposta fora do horário comercial — ausente = desligado */
  outOfHoursConfig?: ChannelOutOfHoursConfig;
  /** Transferência automática por inatividade do operador — ausente = desligado */
  inactivityTransferConfig?: ChannelInactivityTransferConfig;
  /**
   * Distribuição automática de conversas — config unificada (D8, D9).
   * Mesmo shape que `Funnel.assignmentConfig` e `TicketPipeline.assignmentConfig`.
   */
  assignmentConfig: DistributionConfig;
  companyId: ObjectId;
  appId: ObjectId;
  status: ExtendedStatus;     // 'active' | 'inactive' | 'pending' | 'suspended' | 'error'
  /**
   * Contador monotônico de rotação usado por `DistributionService`.
   * Incrementado atomicamente via `$inc` a cada atribuição. O userId
   * selecionado é `pool[lastAssignedUserId % pool.length]`. Ver decisão D4.
   */
  lastAssignedUserId?: number;
  warmup?: ChannelWarmup;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

// Generic Query Types - CompanyIntegrationQuery defined in company-integrations.ts

export interface ChannelQuery extends PaginationQuery {
  integrationId?: string;
  identifier?: string;
  status?: ExtendedStatus;
}

// Response Types
export type ChannelProviderResponse = Omit<ChannelProvider, never>;
export type ChannelResponse = Omit<Channel, '_id' | 'createdAt' | 'updatedAt' | 'integrationId' | 'companyId' | 'appId'> & {
  id: string;
  integrationId: string;     // ObjectId → string
  companyId: string;          // ObjectId → string
  appId: string;              // ObjectId → string
  createdAt: string;          // Date → ISO string
  updatedAt: string;          // Date → ISO string
  capabilities?: string[];    // Provider capabilities from aggregation
  members?: Array<{ id: string; name: string; avatar?: string }>;
  config?: Record<string, unknown>;  // Widget configuration (optional, for website-widget provider)
  qrCode?: string;            // QR Code for gateway providers
  qrCodeExpires?: number;     // QR Code expiration timestamp (Unix timestamp in seconds)
  integration?: {             // Integration credentials from company-integrations
    instanceKey: string | null;
    instanceToken: string | null;
    /** WhatsApp Business — modo de conexão (intent do usuário). */
    mode?: 'standalone' | 'coexistence';
    /** WhatsApp Business — accountMode confirmado pela Meta. */
    accountMode?: 'STANDALONE' | 'COEXISTENCE';
    /** WhatsApp Business — webhook assinado na WABA (setup automático pós Embedded Signup). */
    webhookSubscribed?: boolean;
    /** WhatsApp Business — número registrado na Cloud API (apto a enviar). */
    phoneRegistered?: boolean;
    /** WhatsApp Business — última falha do setup automático (webhook/register). */
    setupError?: string;
  };
  /**
   * Métricas agregadas do canal — populadas no list/getById.
   * `messagesLast7Days`: contagem de mensagens (inbound + outbound) dos últimos 7 dias.
   * `conversations`: conversas ativas/waiting no canal.
   */
  stats?: {
    messagesLast7Days?: number;
    conversations?: number;
  };
};


// List Response Types
export interface ChannelProviderListResponse extends ListResponse<ChannelProviderResponse> {}
export interface ChannelListResponse extends ListResponse<ChannelResponse> {}

// Query Options Types
export interface ChannelQueryOptions extends GenericQueryOptions<ChannelQuery> {}

// ============================================================================
// SPECIFIC REQUEST TYPES
// ============================================================================

export interface CreateChannelRequest {
  name: string;
  identifier: string;
  assignmentConfig: DistributionConfig;
  providerId: string;
  config: Record<string, unknown>;
  credentials: Record<string, unknown>;
  integrationName?: string;
  integrationDescription?: string;
}

export interface CreateChannelRepositoryRequest {
  name: string;
  identifier: string;
  assignmentConfig: DistributionConfig;
  integrationId: string;
}
export interface UpdateChannelRequest {
  name?: string;
  identifier?: string;
  assignmentConfig?: DistributionConfig;
  identifyUser?: boolean;
  /** Configuração de expiração automática de atendimentos */
  expirationConfig?: ChannelExpirationConfig;
  /** Transcrição automática de áudios/vídeos recebidos — ausente = tudo habilitado */
  transcriptionConfig?: ChannelTranscriptionConfig;
  /** Pesquisa CSAT no encerramento — ausente = desligado */
  satisfactionConfig?: ChannelSatisfactionConfig;
  /** Auto-resposta fora do horário comercial — ausente = desligado */
  outOfHoursConfig?: ChannelOutOfHoursConfig;
  /** Transferência automática por inatividade do operador — ausente = desligado */
  inactivityTransferConfig?: ChannelInactivityTransferConfig;
  status?: ExtendedStatus;
}

// ============================================================================
// RECONNECT — provider oficial (whatsapp-business / facebook-messenger / instagram-messaging)
// ============================================================================

/**
 * Reconexão de canal — body opcional do POST /channels/:id/reconnect.
 * Sem credentials = comportamento legado (gateway QR / teste de conexão).
 * Com credentials.accessToken = renovação de token de provider oficial.
 */
export interface ReconnectChannelRequest {
  credentials?: {
    accessToken: string;
  };
}

/** Resultado do POST /channels/:id/reconnect. */
export interface ReconnectChannelResult {
  success: boolean;
  qrCode?: string;
  qrCodeExpires?: number;
  instanceKey?: string;
  message?: string;
  /** Token salvo, mas a reassinatura do webhook falhou (aviso não-bloqueante). */
  webhookWarning?: string;
}

/**
 * Detalhes de conexão para pré-preencher o form de reconexão de provider oficial.
 * GET /channels/:id/connection-details. Expõe o token atual — endpoint dedicado,
 * permissão channels:update.
 */
export interface ChannelConnectionDetails {
  providerId: string;
  /** Token atual completo (editável no front). */
  accessToken: string;
  /** URL do webhook, derivada no servidor (read-only no front). */
  webhookUrl: string;
  /** Identificadores read-only — só os relevantes ao provider vêm preenchidos. */
  whatsappBusinessAccountId?: string;
  phoneNumberId?: string;
  pageId?: string;
  instagramBusinessAccountId?: string;
}
