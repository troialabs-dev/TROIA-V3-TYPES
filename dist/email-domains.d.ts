import { ObjectId } from 'mongodb';
import { PaginationQuery, ListResponse } from './common';
/**
 * `TRACKING` / `TRACKING_CAA`: registros do subdomínio de rastreio (ex.:
 * `links.exemplo.com`). Sem ele verificado o provedor não registra abertura
 * nem clique. Não entram na conta do `status` do domínio — domínio com envio
 * verificado continua `verified` enquanto o rastreio espera o DNS.
 */
export type DnsRecordKind = 'SPF' | 'DKIM' | 'DMARC' | 'MX' | 'TRACKING' | 'TRACKING_CAA';
export interface DnsRecord {
    record: DnsRecordKind;
    type: 'MX' | 'TXT' | 'CNAME' | 'CAA';
    name: string;
    value: string;
    priority?: number;
    ttl: string;
    status: 'not_started' | 'pending' | 'verified' | 'failed';
}
export interface EmailDomain {
    _id?: ObjectId;
    domain: string;
    providerId: string;
    providerDomainId?: string;
    region?: string;
    dnsRecords: DnsRecord[];
    status: 'not_started' | 'pending' | 'verified' | 'partially_verified' | 'failed';
    sendingVerified: boolean;
    receivingVerified: boolean;
    verifiedAt?: Date;
    lastVerificationAt?: Date;
    sendingEnabled: boolean;
    receivingEnabled: boolean;
    openTracking: boolean;
    clickTracking: boolean;
    tls: 'opportunistic' | 'enforced';
    returnPath?: string;
    companyId: ObjectId;
    appId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export interface EmailDomainResponse {
    id: string;
    domain: string;
    providerId: string;
    providerDomainId?: string;
    region?: string;
    dnsRecords: DnsRecord[];
    status: 'not_started' | 'pending' | 'verified' | 'partially_verified' | 'failed';
    sendingVerified: boolean;
    receivingVerified: boolean;
    verifiedAt?: string;
    lastVerificationAt?: string;
    sendingEnabled: boolean;
    receivingEnabled: boolean;
    openTracking: boolean;
    clickTracking: boolean;
    tls: 'opportunistic' | 'enforced';
    returnPath?: string;
    appId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}
export interface EmailDomainDropdownItem {
    id: string;
    domain: string;
    status: string;
}
export interface EmailDomainListResponse extends ListResponse<EmailDomainResponse> {
}
export interface CreateEmailDomainRequest {
    domain: string;
    sendingEnabled?: boolean;
    receivingEnabled?: boolean;
    region?: string;
}
export interface UpdateEmailDomainRequest {
    openTracking?: boolean;
    clickTracking?: boolean;
    tls?: 'opportunistic' | 'enforced';
    sendingEnabled?: boolean;
    receivingEnabled?: boolean;
}
export interface EmailDomainQuery extends PaginationQuery {
    status?: string;
    domain?: string;
}
