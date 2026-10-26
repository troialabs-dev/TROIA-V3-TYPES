import type { FormField, FormAnswer, FormType, ChecklistSettings } from './forms';
import type { ActorType } from './common';
import type { AssignmentContext } from './assignment-context';

export type ChecklistStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected'
  | 'expired';

export type ChecklistLinkedEntityType = 'lead' | 'ticket';

export interface ChecklistLinkedEntity {
  type: ChecklistLinkedEntityType;
  id: string;
}

export interface ChecklistTemplateSnapshot {
  name: string;
  fields: FormField[];
  checklistSettings?: ChecklistSettings;
}

export interface ChecklistReview {
  reviewerId: string;
  decision: 'approved' | 'rejected';
  comment?: string;
  reviewedAt: string;
}

export interface ChecklistSubmissionMeta {
  gps?: { latitude: number; longitude: number; accuracy: number };
  distanceFromUnitMeters?: number;
  serverTimeAt: string;
  userAgent?: string;
}

export interface Checklist {
  _id?: string;
  appId: string;
  companyId: string;
  templateId: string;
  templateType: FormType;
  templateSnapshot: ChecklistTemplateSnapshot;
  answers: FormAnswer[];
  status: ChecklistStatus;
  assigneeId: string;
  createdBy: string;
  /**
   * De que coleção é o id em `createdBy`. Ver `CreatorStamp` em `common.ts`.
   * Ausente = registro anterior a 2026-08-30 (a informação não existia).
   */
  createdByType?: ActorType;
  followerIds: string[];
  /**
   * Contato de quem respondeu (2026-09-29) — o contato do lead, quando a
   * aplicação é ligada a um lead. Ausente = sem lead, ou anterior a 29/09/2026.
   */
  contactId?: string;
  unitId?: string;
  /**
   * Fencing de idempotência do sorteio diário ('YYYY-MM-DD' no fuso do
   * schedule) — só o fluxo `draw_units` da action `action_create_checklist`
   * grava este campo. Ele participa do índice único parcial
   * (appId, companyId, templateId, unitId, drawDayBucket), o que torna
   * IMPOSSÍVEL criar dois checklists para a mesma unidade/modelo no mesmo dia
   * de sorteio, mesmo com dois runs concorrentes. Criações manuais (drawer,
   * API) não gravam o campo e ficam fora do índice.
   */
  drawDayBucket?: string;
  linkedEntity?: ChecklistLinkedEntity;
  expiresAt?: string;
  /**
   * Janela de prazo ORIGINAL em MINUTOS (`dueMinutes` da criação ??
   * `defaultDueMinutes` do modelo). Persistida na criação porque o `reopen`
   * recria a MESMA janela ("novo `expiresAt` = agora + a janela original") e
   * derivá-la de `expiresAt − createdAt` infla o prazo a cada reabertura.
   * Ausente = checklist sem prazo.
   */
  dueMinutes?: number;
  dueSoonAlertSentFor?: string;
  creditDebitedAt?: string;
  startedAt?: string;
  completedAt?: string;
  review?: ChecklistReview;
  score?: number;
  submissionMeta?: ChecklistSubmissionMeta;
  assignmentContext?: AssignmentContext;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ChecklistResponse extends Omit<Checklist, '_id'> {
  id: string;
  /** Two-Phase Fetch */
  assigneeName?: string;
  unitName?: string;
  templateName?: string;
}

export interface CreateChecklistRequest {
  templateId: string;
  assigneeId: string;
  unitId?: string;
  linkedEntity?: ChecklistLinkedEntity;
  dueMinutes?: number;
  followerIds?: string[];
}

/** Whitelist do PUT de gestão — NUNCA answers/status/score/review (spec §5.3) */
export interface UpdateChecklistRequest {
  assigneeId?: string;
  followerIds?: string[];
  expiresAt?: string | null;
  unitId?: string | null;
  linkedEntity?: ChecklistLinkedEntity | null;
}

export interface SubmitChecklistRequest {
  answers: FormAnswer[];
  gps?: { latitude: number; longitude: number; accuracy: number };
}

export interface ReviewChecklistRequest {
  decision: 'approved' | 'rejected';
  comment?: string; // Zod exige quando decision==='rejected'
}

/**
 * Campos aceitos em `sortBy` — o backend rejeita qualquer outro e mapeia cada
 * um para o caminho real do documento (ex.: `template` → `templateSnapshot.name`).
 */
export type ChecklistSortField = 'template' | 'status' | 'due' | 'score' | 'createdAt';

export interface ChecklistQuery {
  page?: number;
  limit?: number;
  search?: string;
  /**
   * Ordenação no SERVIDOR. Sem ela a tabela ordenava só os itens da página, em
   * cima de um `createdAt desc` — a coluna "Prazo" prometia urgência e entregava
   * recência (o mais atrasado do tenant podia estar na página 3).
   */
  sortBy?: ChecklistSortField;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    status?: ChecklistStatus | ChecklistStatus[];
    assigneeId?: string;
    unitId?: string;
    templateId?: string;
    templateType?: FormType;
    dateFrom?: string;
    dateTo?: string;
  };
}
