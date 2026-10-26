import { ObjectId } from 'mongodb';
import { TenantAwareDocument, FullTenantDocument, ActiveStatus, PaginationQuery, GenericQueryOptions, ListResponse } from "./common";
import type { DeviceClientHints, DeviceInfo } from './device';
import type { LevelResponse } from './levels';
export interface User extends FullTenantDocument {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    /** Código do usuário no sistema externo (ex.: código do vendedor no ERP). Texto livre. */
    code?: string;
    /**
     * CPF do usuário, SÓ DÍGITOS (sem máscara) — é assim que o índice único parcial
     * `(appId, companyId, document)` compara. É a chave que liga este usuário ao
     * cadastro de vendedor de uma fonte externa (ERP).
     */
    document?: string;
    status: ActiveStatus;
    levelId?: ObjectId;
    preferences: UserPreferences;
    security: UserSecurity;
    permissions: UserPermissions;
    lastLoginAt?: Date;
    lastActivityAt?: Date;
    devices?: UserDevice[];
    mcpToken?: {
        hash: string;
        prefix: string;
        createdAt: string;
        lastUsedAt?: string;
        lastUsedIp?: string;
        expiresAt?: string;
    };
}
/**
 * Dispositivo de um operador. Estrutura EMBUTIDA em `users.devices[]` — não
 * virou collection porque o fluxo de 2FA por device lê/grava no mesmo documento
 * do usuário.
 *
 * Herda `DeviceInfo` (vocabulário comum com `ContactDevice`) EXCETO `browser`:
 * esse campo é histórico e recebe string livre do cliente (`'Chrome'`, `'Safari'`
 * — ver `detectBrowser` no frontend), enquanto `DeviceInfo.browser` é enum
 * minúsculo. Manter como string evita quebrar login/mobile já em produção; a
 * classificação fina do parse server-side entra em `browserVersion`, `os`,
 * `deviceKind` e `model`.
 */
export interface UserDevice extends Omit<DeviceInfo, 'browser'> {
    deviceId: string;
    token?: string;
    platform: 'web' | 'android' | 'ios';
    browser?: string;
    deviceModel?: string;
    lastActiveAt: string;
    createdAt: string;
    lastNotifiedAt?: string;
    tokenInvalidatedAt?: string;
    authorizedAt?: string;
    authChannel?: 'email' | 'whatsapp';
}
export interface UserMcpTokenMetadata {
    exists: boolean;
    prefix?: string;
    createdAt?: string;
    lastUsedAt?: string;
    lastUsedIp?: string;
    expiresAt?: string;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    notifications: UserNotificationPreferences;
    calendar: UserCalendarPreferences;
}
/**
 * Preferências de notificação per-user.
 *
 * Semântica de `types?: string[]` em cada canal — **REGRA ÚNICA** desde
 * 2026-08-17: só é entregue o que está MARCADO na lista daquele canal.
 *   - `['type1', 'type2']` → apenas os tipos listados são entregues
 *   - `[]` (array vazio) → nada é entregue nesse canal
 *   - `undefined` (campo ausente) → nada é entregue nesse canal
 *
 * Não existe mais semântica dupla por canal nem atalho "sem preferências
 * recebe tudo" — os dois foram removidos junto com o incidente dos avisos de
 * SLA em produção. A única garantia de plataforma fora das listas é o alerta
 * de sistema crítico no sino (ver `determineChannels` no backend).
 *
 * Usuário novo nasce com a lista de fábrica gravada
 * (`buildDefaultNotificationPreferences`), então na prática `undefined` só
 * aparece em documento legado ainda não tocado pela migração `2026-08-17-002`.
 *
 * Envios são sempre imediatos — não há mais `frequency` (era um opt-in que
 * complicava a UX pra pouco benefício).
 */
export interface UserNotificationPreferences {
    email: {
        enabled: boolean;
        types?: string[];
    };
    whatsapp: {
        enabled: boolean;
        types?: string[];
    };
    push: {
        enabled: boolean;
        types?: string[];
    };
    inApp: {
        enabled: boolean;
        types?: string[];
    };
    sound: {
        enabled: boolean;
        types?: string[];
    };
}
/**
 * Preferências de notificação **de fábrica** (2026-08-17).
 *
 * Fonte única do que um usuário novo recebe. Consumida pelo backend na criação
 * do usuário (`UsersRepository.create`) e pela migração `2026-08-17-002`, que
 * grava a mesma lista nos canais sem lista dos usuários já existentes.
 *
 * `types` nasce EXPLÍCITO em todo canal — sino/push/som com a lista de fábrica,
 * e-mail/WhatsApp só com `OPT_IN_FACTORY_NOTIFICATION_TYPES` (hoje, o aviso de
 * créditos acabando).
 *
 * `enabled` é ligado em todos os canais. O WhatsApp nascia desligado até
 * 05/10/2026; passou a nascer ligado porque canal desligado barra TUDO, inclusive
 * o aviso de créditos, e a lista dele continua sendo a que decide o que sai —
 * com um tipo só marcado, só esse tipo é enviado.
 */
export declare function buildDefaultNotificationPreferences(): UserNotificationPreferences;
/**
 * User Calendar Preferences
 *
 * Configurações personalizadas de disponibilidade de agenda para cada usuário.
 * Permite definir horários de trabalho, pausas, datas bloqueadas, feriados, etc.
 */
export interface UserCalendarPreferences {
    workingHours: {
        monday: WorkingHoursConfig;
        tuesday: WorkingHoursConfig;
        wednesday: WorkingHoursConfig;
        thursday: WorkingHoursConfig;
        friday: WorkingHoursConfig;
        saturday: WorkingHoursConfig;
        sunday: WorkingHoursConfig;
    };
    breaks: BreakConfig[];
    blockedDates: BlockedDateConfig[];
    holidays: HolidaysConfig;
    meetingBuffer: MeetingBufferConfig;
    defaultMeetingDuration: number;
    dailyMeetingLimit?: DailyMeetingLimitConfig;
    notifications?: CalendarNotificationPreferences;
}
/**
 * Preferências de notificação da Agenda (aba "Geral" das Configurações).
 *
 * - `reminderDefault`: lembrete PADRÃO aplicado a eventos que NÃO têm lembrete
 *   próprio (`event.reminders.useDefault`). O disparo real por evento vem de
 *   `event.reminders.overrides` (configurado na criação/edição do evento);
 *   este toggle é apenas o fallback quando o evento não escolheu nenhum.
 * - `emailInvite`: ao criar um evento COM participantes, enviar convite por
 *   e-mail a cada participante.
 * - `dailySummary`: receber a agenda do dia às 08:00 (fuso do usuário).
 *
 * Campo opcional: preferências legadas (sem este bloco) assumem os defaults do
 * front (lembrete 15min ligado, convite ligado, resumo desligado).
 */
export interface CalendarNotificationPreferences {
    reminderDefault: {
        enabled: boolean;
        minutes: number;
    };
    emailInvite: {
        enabled: boolean;
    };
    dailySummary: {
        enabled: boolean;
    };
}
/**
 * Working Hours Configuration
 *
 * Define horário de trabalho para um dia específico
 */
export interface WorkingHoursConfig {
    enabled: boolean;
    start: string;
    end: string;
}
/**
 * Break Configuration
 *
 * Pausas durante o dia (almoço, café, etc.)
 */
export interface BreakConfig {
    name: string;
    start: string;
    end: string;
    daysOfWeek: number[];
    enabled: boolean;
}
/**
 * Blocked Date Configuration
 *
 * Datas específicas bloqueadas (férias, eventos pessoais)
 */
export interface BlockedDateConfig {
    startDate: string;
    endDate: string;
    reason?: string;
    allDay: boolean;
    startTime?: string;
    endTime?: string;
}
/**
 * Holidays Configuration
 *
 * Configuração de feriados nacionais/regionais
 */
export interface HolidaysConfig {
    enabled: boolean;
    country: string;
    region?: string;
    customHolidays: CustomHoliday[];
}
/**
 * Custom Holiday
 *
 * Feriado customizado pelo usuário
 */
export interface CustomHoliday {
    date: string;
    name: string;
    recurring: boolean;
}
/**
 * Meeting Buffer Configuration
 *
 * Tempo de buffer entre reuniões (para preparação/deslocamento)
 */
export interface MeetingBufferConfig {
    enabled: boolean;
    minutes: number;
}
/**
 * Daily Meeting Limit Configuration
 *
 * Limite máximo de reuniões por dia
 */
export interface DailyMeetingLimitConfig {
    enabled: boolean;
    maxMeetings: number;
}
export interface UserSecurity {
    password: UserPassword;
    twoFactor: UserTwoFactor;
    sessions: UserSession[];
    loginAttempts: UserLoginAttempt[];
    passwordResets: UserPasswordReset[];
}
export interface UserPassword {
    hashedPassword: string;
    lastChangedAt: Date;
    expiresAt?: Date;
    requiresChange: boolean;
    history: string[];
}
export interface UserTwoFactor {
    enabled: boolean;
    method?: 'totp' | 'sms' | 'email';
    secret?: string;
    backupCodes?: string[];
    lastUsedAt?: Date;
}
export interface UserSession {
    token: string;
    userAgent: string;
    ipAddress: string;
    location?: string;
    device?: string;
    createdAt: Date;
    lastAccessAt: Date;
    expiresAt: Date;
    isActive: boolean;
}
export interface UserLoginAttempt {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    failureReason?: string;
    location?: string;
}
export interface UserPasswordReset {
    token: string;
    requestedAt: Date;
    expiresAt: Date;
    usedAt?: Date;
    ipAddress: string;
    userAgent: string;
}
export interface UserPermissions {
    system: string[];
    company: string[];
    custom: Record<string, string[]>;
}
export interface UserInvitation extends TenantAwareDocument {
    email: string;
    firstName: string;
    lastName: string;
    levelId?: ObjectId;
    invitedBy: ObjectId;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    token: string;
    expiresAt: Date;
    acceptedAt?: Date;
    message?: string;
}
export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    phone?: string;
    code?: string;
    /** CPF. Aceita com ou sem máscara — o backend normaliza para dígitos. */
    document?: string;
    levelId?: string;
    preferences?: Partial<UserPreferences>;
    sendInvite?: boolean;
}
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    /** `null` = LIMPAR o campo (o backend traduz para `$unset`). */
    code?: string | null;
    /** `null` = LIMPAR o campo. Aceita com ou sem máscara — o backend normaliza. */
    document?: string | null;
    avatar?: string;
    status?: ActiveStatus;
    levelId?: string;
    preferences?: Partial<UserPreferences>;
    password?: string;
}
export interface CreateUserInvitationRequest {
    email: string;
    firstName: string;
    lastName: string;
    levelId?: string;
    message?: string;
    expiresIn?: number;
}
export interface AcceptInvitationRequest {
    token: string;
    password: string;
    firstName?: string;
    lastName?: string;
    preferences?: Partial<UserPreferences>;
}
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    twoFactorCode?: string;
    device?: {
        deviceId: string;
        platform: 'web' | 'android' | 'ios';
        browser?: string;
        deviceModel?: string;
        /**
         * Client Hints de alta entropia (web). O servidor já parseia o User-Agent,
         * mas o Chrome congelou versão de SO e modelo — só os hints recuperam.
         * Ausente em Safari/Firefox e no app mobile (que manda `deviceModel`).
         */
        clientHints?: DeviceClientHints;
    };
}
export interface LoginResponse {
    user: UserResponse;
    token: string;
    refreshToken?: string;
    expiresAt: Date;
    requiresTwoFactor?: boolean;
    companyName: string;
    masterLogin?: boolean;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface ResetPasswordRequest {
    email: string;
}
export interface SetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}
export interface Enable2FARequest {
    method: 'totp' | 'sms' | 'email';
    code: string;
}
export interface Verify2FARequest {
    code: string;
}
export interface CreateApiKeyRequest {
    name: string;
    permissions: string[];
    expiresAt?: Date;
}
export interface UserActivity extends TenantAwareDocument {
    userId: ObjectId;
    action: string;
    resource?: string;
    resourceId?: ObjectId;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}
export interface UserMetrics {
    totalLogins: number;
    lastLogin?: Date;
    activeDevices: number;
    totalSessions: number;
    failedLoginAttempts: number;
    passwordAge: number;
    twoFactorEnabled: boolean;
    apiKeysCount: number;
    lastActivity?: Date;
}
export interface UserAnalytics {
    period: 'day' | 'week' | 'month' | 'year';
    data: {
        date: string;
        logins: number;
        sessions: number;
        activity: number;
        devices: number;
    }[];
}
export type UserStatus = ActiveStatus;
export interface UserQuery extends PaginationQuery {
    status?: ActiveStatus;
    levelId?: string;
    teamId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    companyId?: string;
}
export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    code?: string;
    /** CPF, só dígitos. */
    document?: string;
    companyId: string;
    appId: string;
    status: ActiveStatus;
    levelId?: string;
    level?: LevelResponse | null;
    levelName?: string | null;
    teams?: Array<{
        id: string;
        name: string;
    }>;
    preferences: UserPreferences;
    permissions: UserPermissions;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    lastLoginAt?: string;
    lastActivityAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserListResponse extends ListResponse<UserResponse> {
}
export interface UserQueryOptions extends GenericQueryOptions<UserQuery> {
}
