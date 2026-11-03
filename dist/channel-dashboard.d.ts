import { ObjectId } from 'mongodb';
import type { ChannelAccountInfo } from './channels';
import { FullTenantDocument, PaginationQuery, ListResponse } from './common';
export type ChannelMediaType = 'feed' | 'carousel' | 'reels' | 'story';
export type ChannelMediaStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type ChannelMediaOrigin = 'synced' | 'local';
export interface ChannelMediaAsset {
    mediaUrl: string;
    type: 'image' | 'video';
    thumbnailUrl?: string;
    /** Imagem hospedada por nós (cópia da foto ou da capa do vídeo). */
    storedImageUrl?: string;
    order: number;
}
export interface ChannelMediaInsights {
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    saves?: number;
    shares?: number;
    videoViews?: number;
    retentionPct?: number;
    engagementRate?: number;
}
export interface ChannelMedia extends FullTenantDocument {
    channelId: ObjectId;
    providerId: string;
    mediaType: ChannelMediaType;
    status: ChannelMediaStatus;
    origin: ChannelMediaOrigin;
    caption?: string;
    assets: ChannelMediaAsset[];
    providerMediaId?: string;
    permalink?: string;
    scheduledAt?: Date;
    publishedAt?: Date;
    failReason?: string;
    insights?: ChannelMediaInsights;
}
export interface ChannelMediaResponse extends Omit<ChannelMedia, '_id' | 'channelId' | 'appId' | 'companyId' | 'scheduledAt' | 'publishedAt' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    id: string;
    channelId: string;
    appId: string;
    companyId: string;
    scheduledAt?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ChannelMediaQuery extends PaginationQuery {
    status?: ChannelMediaStatus;
    mediaType?: ChannelMediaType;
    channelId?: string;
}
export interface CreateChannelMediaRequest {
    channelId: string;
    providerId: string;
    mediaType: ChannelMediaType;
    origin: ChannelMediaOrigin;
    status?: ChannelMediaStatus;
    caption?: string;
    assets: ChannelMediaAsset[];
    providerMediaId?: string;
    permalink?: string;
    scheduledAt?: string;
    publishedAt?: string;
    insights?: ChannelMediaInsights;
}
export interface UpdateChannelMediaRequest {
    status?: ChannelMediaStatus;
    caption?: string;
    assets?: ChannelMediaAsset[];
    scheduledAt?: string;
    failReason?: string;
    insights?: ChannelMediaInsights;
}
export interface ChannelMediaListResponse extends ListResponse<ChannelMediaResponse> {
}
export type ChannelCommentStatus = 'visible' | 'hidden' | 'deleted';
export interface ChannelCommentAuthor {
    providerUserId: string;
    username: string;
    profilePicUrl?: string;
}
export interface ChannelComment extends FullTenantDocument {
    channelId: ObjectId;
    mediaId: ObjectId;
    providerCommentId: string;
    parentCommentId?: ObjectId;
    text: string;
    author: ChannelCommentAuthor;
    isFromMe: boolean;
    status: ChannelCommentStatus;
    likeCount?: number;
    occurredAt: Date;
}
export interface ChannelCommentResponse extends Omit<ChannelComment, '_id' | 'channelId' | 'mediaId' | 'parentCommentId' | 'appId' | 'companyId' | 'occurredAt' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    id: string;
    channelId: string;
    mediaId: string;
    parentCommentId?: string;
    appId: string;
    companyId: string;
    occurredAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface ChannelCommentQuery extends PaginationQuery {
    channelId?: string;
    mediaId?: string;
    status?: ChannelCommentStatus;
}
export interface CreateChannelCommentRequest {
    channelId: string;
    mediaId: string;
    providerCommentId: string;
    parentCommentId?: string;
    text: string;
    author: ChannelCommentAuthor;
    isFromMe: boolean;
    status?: ChannelCommentStatus;
    likeCount?: number;
    occurredAt: string;
}
export interface UpdateChannelCommentRequest {
    status?: ChannelCommentStatus;
    likeCount?: number;
}
export interface ChannelAudience {
    byCountry?: Record<string, number>;
    byCity?: Record<string, number>;
    byAge?: Record<string, number>;
    byGender?: Record<string, number>;
}
export interface ChannelMetricsSnapshot extends FullTenantDocument {
    channelId: ObjectId;
    providerId: string;
    date: string;
    reach?: number;
    impressions?: number;
    engagement?: number;
    profileViews?: number;
    followersCount?: number;
    followsCount?: number;
    mediaCount?: number;
    audience?: ChannelAudience;
}
export interface ChannelMetricsResponse extends Omit<ChannelMetricsSnapshot, '_id' | 'channelId' | 'appId' | 'companyId' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    id: string;
    channelId: string;
    appId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}
export interface UpsertChannelMetricsRequest {
    channelId: string;
    providerId: string;
    date: string;
    reach?: number;
    impressions?: number;
    engagement?: number;
    profileViews?: number;
    followersCount?: number;
    followsCount?: number;
    mediaCount?: number;
    audience?: ChannelAudience;
}
export type ChannelActivityType = 'comment' | 'mention' | 'follower_delta' | 'story_reply' | 'dm';
export interface ChannelActivity extends FullTenantDocument {
    channelId: ObjectId;
    activityType: ChannelActivityType;
    occurredAt: Date;
    data: Record<string, unknown>;
    refId?: ObjectId;
}
export interface ChannelActivityResponse extends Omit<ChannelActivity, '_id' | 'channelId' | 'refId' | 'appId' | 'companyId' | 'occurredAt' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
    id: string;
    channelId: string;
    refId?: string;
    appId: string;
    companyId: string;
    occurredAt: string;
    createdAt: string;
}
export interface CreateChannelActivityRequest {
    channelId: string;
    activityType: ChannelActivityType;
    occurredAt: string;
    data: Record<string, unknown>;
    refId?: string;
}
/** Resposta paginada da timeline — cursor/keyset (NÃO estende ListResponse page-based). */
export interface ChannelActivityListResponse {
    items: ChannelActivityResponse[];
    nextCursor: string | null;
}
/** Shape tipado de `data` para atividade de comentário (F5a). Persistido como Record. */
export interface ChannelActivityCommentData {
    mediaId: string;
    text: string;
    authorUsername: string;
}
/** Shape tipado de `data` para atividade de menção (F5a). Persistido como Record. */
export interface ChannelActivityMentionData {
    mediaId: string;
    text: string;
    authorId: string;
    authorUsername?: string;
    commentId?: string;
}
/** Shape tipado de `data` para variação de seguidores (F5a). Persistido como Record. */
export interface ChannelActivityFollowerDeltaData {
    date: string;
    delta: number;
    followersCount: number;
}
export type ChannelSyncStatus = 'idle' | 'syncing' | 'error';
export type ChannelSyncResourceKey = 'profile' | 'media' | 'comments' | 'metrics' | 'activities';
export interface ChannelSyncResourceState {
    lastSyncedAt?: Date;
    cursor?: string;
    lastError?: string;
}
export interface ChannelSyncState extends FullTenantDocument {
    channelId: ObjectId;
    syncStatus: ChannelSyncStatus;
    lastSyncedAt?: Date;
    resources: Partial<Record<ChannelSyncResourceKey, ChannelSyncResourceState>>;
}
export interface ChannelSyncResourceStateResponse {
    lastSyncedAt?: string;
    cursor?: string;
    lastError?: string;
}
export interface ChannelSyncStateResponse {
    id: string;
    channelId: string;
    appId: string;
    companyId: string;
    syncStatus: ChannelSyncStatus;
    lastSyncedAt?: string;
    resources: Partial<Record<ChannelSyncResourceKey, ChannelSyncResourceStateResponse>>;
    createdAt: string;
    updatedAt: string;
}
export type ChannelSyncTriggerType = 'connect' | 'reconnect' | 'manual' | 'scheduled';
export interface ChannelSyncJob {
    channelId: string;
    appId: string;
    companyId: string;
    trigger: ChannelSyncTriggerType;
    resources?: ChannelSyncResourceKey[];
}
export interface ChannelSyncResult {
    channelId: string;
    success: boolean;
    resourcesSynced: ChannelSyncResourceKey[];
    errors?: string[];
}
export interface ChannelAccountInsights {
    reach?: number;
    impressions?: number;
    engagement?: number;
    profileViews?: number;
    followersCount?: number;
    followsCount?: number;
    mediaCount?: number;
}
export interface ChannelDashboardOverview {
    channel: {
        id: string;
        name: string;
        identifier: string;
        providerId?: string;
        accountInfo?: ChannelAccountInfo;
        status: string;
    };
    capabilities: string[];
    syncState: ChannelSyncStateResponse | null;
    latestMetrics: ChannelMetricsResponse | null;
}
export interface ChannelMediaPublishResult {
    mediaId: string;
    providerMediaId?: string;
    permalink?: string;
    success: boolean;
    error?: string;
}
/** Post público de um canal (feed do Instagram exibido em sites). */
export interface PublicChannelPost {
    id: string;
    imageUrl: string;
    mediaType: ChannelMediaType;
    permalink?: string;
    caption?: string;
}
/** Resposta pública do feed do Instagram de um canal. */
export interface PublicInstagramFeedResponse {
    posts: PublicChannelPost[];
    profileUrl?: string;
}
