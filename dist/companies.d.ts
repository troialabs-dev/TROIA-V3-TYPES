import { FullTenantDocument, ActiveStatus, Address, PaginationQuery, GenericQueryOptions, ListResponse } from "./common";
import type { DistributionConfig } from './distribution';
import type { TenantThemeOverrides } from './theme';
import type { CompanyCard, CompanyCardResponse, CreditBalance, CreditSubscription, CreditAlert, CreditInvoice } from './credits';
import type { UserResponse } from './user';
export type CompanyDocumentType = 'CPF' | 'CNPJ';
/**
 * Faixa de expediente dentro de UM dia, em minutos desde a meia-noite LOCAL
 * (o fuso é `Company.timezone` — NÃO existe fuso dentro do calendário).
 * Nunca texto: o Salesforce usa `"08:00:00 am"` e o Zoho serializa duração
 * como `"01:50 hrs"`, e os dois são dívida permanente de parsing.
 *
 * `startMin` 0..1439; `endMin` 1..1440 (1440 = fim do dia).
 *
 * NA ESCRITA a API aceita `endMin < startMin` como turno que atravessa a
 * meia-noite (22:00 → 06:00). O repositório PARTE esse turno em dois
 * `weekday` antes de persistir: o documento gravado NUNCA tem
 * `endMin <= startMin`, e o código de cálculo nunca conhece o caso.
 */
export interface BusinessDaySlot {
    startMin: number;
    endMin: number;
}
/**
 * Expediente de um dia da semana. `weekday` 0..6 com DOMINGO em zero — mesma
 * convenção de `ShiftSchedule.weekdays`. Dia sem expediente não aparece.
 * O documento persistido tem no máximo UM registro por `weekday`, em ordem
 * crescente, com as faixas já ordenadas e fundidas.
 */
export interface BusinessWeekDay {
    weekday: number;
    slots: BusinessDaySlot[];
}
/**
 * Feriado. Três formas explícitas em vez de um booleano `recurring`, porque
 * `recurring` só funciona para data fixa e Carnaval/Páscoa não são datas
 * fixas.
 *  - `fixed`: 'MM-DD', recorre todo ano;
 *  - `dated`: 'YYYY-MM-DD', vale só naquele ano (é como feriado móvel entra);
 *  - `range`: recesso, com as duas pontas INCLUSIVE.
 */
export type HolidayEntry = {
    kind: 'fixed';
    date: string;
    name: string;
} | {
    kind: 'dated';
    date: string;
    name: string;
} | {
    kind: 'range';
    startDate: string;
    endDate: string;
    name: string;
};
/**
 * Horário de atendimento da empresa. É campo objeto em `Company` e não
 * entidade própria (decisão 3 da spec de SLA): existe UM calendário por
 * empresa e o fuso é `Company.timezone`.
 *
 * `enabled: false` NÃO apaga a semana — significa "não usar tempo útil", e
 * alvos com `useBusinessHours: true` caem em tempo corrido.
 *
 * Feriados nacionais não são persistidos: são gerados em código a cada ano
 * (`nationalHolidaysBR`). A empresa persiste só o que ela mudou — os
 * municipais/próprios em `customHolidays` e o que removeu em
 * `suppressedHolidayKeys`.
 */
export interface BusinessCalendarConfig {
    enabled: boolean;
    week: BusinessWeekDay[];
    nationalHolidays: {
        enabled: boolean;
        country: string;
        state?: string;
    };
    customHolidays: HolidayEntry[];
    /** Chaves de `holidaySuppressionKey(entry.name)` dos nacionais removidos. */
    suppressedHolidayKeys: string[];
}
/**
 * Chave estável de supressão de feriado nacional.
 *
 * Feriados nacionais são GERADOS em código, não persistidos — logo não têm
 * `_id`. A identidade disponível é o `name`, que é constante de código; esta
 * função o normaliza para uma chave sem acento, caixa nem pontuação, igual
 * entre anos (o Carnaval de 2026 e o de 2027 têm a MESMA chave, e uma
 * supressão feita uma vez vale para sempre).
 *
 * Consumidores: a aba "Horário de atendimento" (grava a chave ao remover) e
 * `resolveHolidays` no backend (descarta o nacional cuja chave está na lista).
 */
export declare function holidaySuppressionKey(name: string): string;
export interface Company extends FullTenantDocument {
    name: string;
    email: string;
    phone?: string;
    website?: string;
    logo?: string;
    document?: string;
    documentType?: CompanyDocumentType;
    status: ActiveStatus;
    defaultCountryCode?: string;
    /** IANA timezone (ex.: 'America/Sao_Paulo'). Default de exibição: America/Sao_Paulo. */
    timezone?: string;
    address: Address;
    defaultAssignmentConfig?: DistributionConfig;
    themeOverrides?: TenantThemeOverrides;
    cards: CompanyCard[];
    creditBalance: CreditBalance;
    creditSubscription?: CreditSubscription;
    creditAlerts: CreditAlert[];
    invoices: CreditInvoice[];
    /** Horário de atendimento — base do cálculo de tempo útil do SLA. */
    businessCalendar?: BusinessCalendarConfig;
    /** Estreia do motor de SLA nesta empresa (decisão 10). `undefined` = motor nunca ligado. */
    sla?: CompanySlaActivation;
    /** Configurações de segurança do login dos usuários da empresa. */
    security?: CompanySecuritySettings;
}
/**
 * Segurança do login dos usuários da empresa.
 *
 * Campos AUSENTES valem como o comportamento anterior à existência da opção —
 * empresa que nunca mexeu continua exatamente como estava (dia 0 sem migração).
 * Use sempre os helpers abaixo para ler; nunca compare o campo cru.
 */
export interface CompanySecuritySettings {
    /**
     * Pedir código de confirmação (2FA por e-mail/WhatsApp) quando um usuário
     * entra por um aparelho que ainda não foi confirmado.
     * Ausente = pedir (padrão). `false` = não pedir.
     */
    requireDeviceVerification?: boolean;
}
export interface UpdateCompanySecurityRequest {
    requireDeviceVerification: boolean;
}
/** Resposta enxuta de `GET /companies/me/security` (lida por todo usuário logado). */
export interface CompanySecurityResponse {
    requireDeviceVerification: boolean;
}
/**
 * A empresa exige confirmação de aparelho novo? Ausente = sim.
 * Ponto ÚNICO de leitura da regra — backend e frontend usam este helper.
 */
export declare function isDeviceVerificationRequired(security?: CompanySecuritySettings | null): boolean;
/**
 * Estreia do motor de SLA na empresa (decisão 10 da spec: (c) desligado por
 * padrão → (b) ao ativar). `activatedAt` é IMUTÁVEL — é o âncora da supressão
 * de eco do passado, e reescrevê-lo reabriria a enxurrada retroativa.
 */
export interface CompanySlaActivation {
    /** Instante da estreia (ISO). Gravado UMA vez; nunca reescrito. */
    activatedAt: string;
    /** Quem ligou. Só auditoria. */
    activatedBy?: string;
    /**
     * Escolha da estreia: cancelar o relógio de PRIMEIRA RESPOSTA dos chamados
     * antigos que já teriam estourado esse prazo, em vez de carimbá-los como
     * violados.
     *
     * Gravado JUNTO de `activatedAt` e, como ele, IMUTÁVEL — é o que faz o
     * backfill se comportar do mesmo jeito em toda a cadeia de lotes, inclusive
     * numa retomada meses depois. Ausente/`false` = comportamento anterior
     * (violação histórica registrada, com a notificação suprimida).
     *
     * Só afeta `first_response` NUNCA respondido e já fora do prazo. Respondido
     * dentro do prazo continua `met`, respondido fora continua `breached`
     * (história real), e o que ainda está no prazo continua `running` — ainda dá
     * tempo de responder.
     */
    cancelPreActivationFirstResponse?: boolean;
    /** Progresso do backfill em lotes (telemetria da tela de ativação). */
    backfill?: {
        state: 'running' | 'done' | 'failed';
        /** Quantos CHAMADOS ganharam relógio. Unidade: chamado, nunca relógio. */
        processed: number;
        /**
         * Quantos CHAMADOS nasceram com pelo menos um relógio violado — métrica de
         * risco do §10. Mesma unidade de `processed` (chamado), de propósito: um
         * chamado com dois relógios estourados conta UMA vez, senão a tela da
         * estreia mostraria "6 violados de 5 processados".
         */
        breachedAtActivation: number;
        /**
         * Quantos CHAMADOS não puderam ser reconstruídos integralmente: pulados por
         * erro do motor de tempo útil (chamado antigo demais, fuso corrompido) ou
         * com a trilha truncada por entrada corrompida. `state: 'done'` com
         * `skipped > 0` é conclusão COM ressalva — a tela precisa mostrar os dois.
         */
        skipped?: number;
        /** Keyset: hex do último `_id` processado. */
        lastId?: string;
        finishedAt?: string;
    };
}
export interface CreateCompanyRequest {
    name: string;
    email: string;
    phone?: string;
    website?: string;
    address: Address;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    };
}
export interface UpdateCompanyRequest {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    logo?: string;
    document?: string;
    documentType?: CompanyDocumentType;
    status?: ActiveStatus;
    defaultCountryCode?: string;
    timezone?: string;
    address?: Partial<Address>;
    defaultAssignmentConfig?: DistributionConfig;
    themeOverrides?: TenantThemeOverrides;
    businessCalendar?: BusinessCalendarConfig;
}
export interface UpdateCompanyAssignmentConfigRequest {
    defaultAssignmentConfig: DistributionConfig;
}
export type CompanyStatus = ActiveStatus;
export interface CompanyQuery extends PaginationQuery {
    status?: ActiveStatus;
    name?: string;
    email?: string;
}
export interface CompanyResponse {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    logo?: string;
    document?: string;
    documentType?: CompanyDocumentType;
    appId: string;
    status: ActiveStatus;
    defaultCountryCode?: string;
    timezone?: string;
    address: Address;
    defaultAssignmentConfig?: DistributionConfig;
    themeOverrides?: TenantThemeOverrides;
    businessCalendar?: BusinessCalendarConfig;
    cards: CompanyCardResponse[];
    creditBalance: CreditBalance;
    creditSubscription?: CreditSubscription;
    creditAlerts: CreditAlert[];
    invoices: CreditInvoice[];
    /** Estreia do motor de SLA nesta empresa (decisão 10). `undefined` = motor nunca ligado. */
    sla?: CompanySlaActivation;
    /** Segurança do login. Ler com `isDeviceVerificationRequired` — ausente = 2FA exigido. */
    security?: CompanySecuritySettings;
    createdAt: string;
    updatedAt: string;
}
export interface CompanyListResponse extends ListResponse<CompanyResponse> {
}
export interface CompanyQueryOptions extends GenericQueryOptions<CompanyQuery> {
}
export interface CompanyRegistrationResponse {
    company: CompanyResponse;
    user: UserResponse;
}
