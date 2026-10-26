import { ActorType, ListResponse, PaginationQuery, TenantAwareDocument } from './common';

// ============================================================
// FORM FIELD TYPES
// ============================================================

/**
 * FormFieldType - Tipos de campo suportados no builder
 */
export enum FormFieldType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  URL = 'url',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  TIME = 'time',
  FILE_UPLOAD = 'file_upload',
  RATING = 'rating',
  LINEAR_SCALE = 'linear_scale',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  CPF = 'cpf',
  CNPJ = 'cnpj',
  PHOTO = 'photo',
  CONFORMITY = 'conformity'
}

/**
 * FormFieldOption - Opcao para campos de escolha (select, radio, checkbox)
 */
export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

/**
 * FormFieldValidation - Regras de validacao por campo
 */
export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}

/**
 * ConditionalLogic - Logica condicional para exibicao de campos
 */
export interface FormConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value: string;
}

/**
 * FormType - Diferencia formularios genericos de checklists (modulo Checklists+Units).
 * 'checklist' habilita ChecklistSettings no Form e os campos FormFieldType.PHOTO/CONFORMITY.
 */
export type FormType = 'form' | 'checklist';

/**
 * ChecklistSettings - Configuracoes especificas de um Form do tipo 'checklist'.
 */
export interface ChecklistSettings {
  requiresApproval: boolean;
  /** Prazo padrão das aplicações deste modelo, em MINUTOS. */
  defaultDueMinutes?: number;
  scoreEnabled: boolean;
  captureGps: boolean;
}

/**
 * CONFORMITY_VALUES - Valores aceitos pelo campo FormFieldType.CONFORMITY.
 */
export const CONFORMITY_VALUES = ['conforme', 'nao_conforme', 'na'] as const;
export type ConformityValue = (typeof CONFORMITY_VALUES)[number];

/**
 * PhotoFieldConfig - Configuracao do campo FormFieldType.PHOTO.
 */
export interface PhotoFieldConfig {
  source: 'any' | 'camera_only';
  maxPhotos?: number;
}

/**
 * FormField - Campo individual do formulario
 */
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  conditionalLogic?: FormConditionalLogic;
  /** Configuracao do campo quando type === FormFieldType.PHOTO. */
  photoConfig?: PhotoFieldConfig;
}

// ============================================================
// FORM SETTINGS & STYLING
// ============================================================

/**
 * Dados de contato no formulário público (2026-09-29). Ligado, a página pede
 * nome, WhatsApp e e-mail (cada um obrigatório ou não) e a resposta fica com o
 * contato (`FormSubmission.contactId`) — achado pelo telefone ou criado.
 * Desligado, a resposta é anônima. Ligado exige WhatsApp OU e-mail
 * obrigatório: sem nenhum dos dois não há como garantir o contato.
 */
export interface FormContactDataSettings {
  enabled: boolean;
  requireName: boolean;
  requirePhone: boolean;
  requireEmail: boolean;
}

/** Formulário novo nasce pedindo nome e WhatsApp; e-mail opcional. */
export const DEFAULT_FORM_CONTACT_DATA: FormContactDataSettings = {
  enabled: true,
  requireName: true,
  requirePhone: true,
  requireEmail: false,
};

/**
 * E-mail de confirmação para quem respondeu no link público (2026-09-30). Sai
 * pelo canal de e-mail da empresa (`channelId`, provider `email-resend`) para o
 * e-mail digitado no bloco "Seus dados" — sem e-mail, não sai. Assunto e texto
 * aceitam as variáveis de `FORM_CONFIRMATION_EMAIL_VARIABLES`.
 */
export interface FormConfirmationEmailSettings {
  enabled: boolean;
  channelId?: string;
  subject?: string;
  body?: string;
}

/** Variáveis do e-mail de confirmação — `{{nome}}` etc.; `respostas` vira a lista pergunta/resposta. */
export const FORM_CONFIRMATION_EMAIL_VARIABLES = ['nome', 'email', 'telefone', 'formulario', 'respostas'] as const;

/**
 * Aviso às pessoas escolhidas quando chega resposta (2026-09-30), de qualquer
 * origem (link público, automação, captura, aba do lead). Chega no sino e no
 * celular mesmo sem a pessoa ter ligado o tipo nas preferências (decisão do dono).
 */
export interface FormResponseNotificationSettings {
  enabled: boolean;
  userIds: string[];
}

/**
 * FormSettings - Configuracoes de comportamento do formulario
 */
export interface FormSettings {
  /** Ausente = formulário anterior a 2026-09-29, anônimo. */
  contactData?: FormContactDataSettings;
  /**
   * Falso = a mesma pessoa (mesmo contato) não envia de novo pelo link
   * público. Só vale com os dados de contato ligados (é por eles que ela é
   * reconhecida). Padrão: true.
   */
  allowMultipleResponses: boolean;
  /** Barra "3 de 7 respondidas" no topo da página pública. */
  showProgressBar: boolean;
  confirmationEmail?: FormConfirmationEmailSettings;
  notifications?: FormResponseNotificationSettings;
}

/**
 * FormStyling - Personalizacao visual do formulario publico
 */
export interface FormStyling {
  logoUrl?: string;
  coverUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

// ============================================================
// FORM STATUS
// ============================================================

/**
 * FormStatus - Status do formulario
 */
export enum FormStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// ============================================================
// FORM DOCUMENT
// ============================================================

/**
 * Form - Documento principal do formulario
 */
export interface Form extends TenantAwareDocument {
  name: string;
  description?: string;
  slug: string;
  type: FormType;
  status: FormStatus;
  fields: FormField[];
  settings: FormSettings;
  styling: FormStyling;
  checklistSettings?: ChecklistSettings;
  thankYouMessage?: string;
  thankYouRedirectUrl?: string;
  maxResponses?: number;
  expiresAt?: Date;
  responsesCount: number;
  viewsCount: number;
  /**
   * Quem criou o formulário. OPCIONAL desde 2026-08-30.
   *
   * Era declarado obrigatório e NENHUM caminho gravava; o mapper usava
   * `toIdRequired`, que devolve `''` quando o campo não existe — a API
   * respondia string vazia como se fosse um id. Mentir no tipo foi o que
   * produziu o `""`.
   */
  createdBy?: string;
  /**
   * De que coleção é o id em `createdBy`. Ver `CreatorStamp` em `common.ts`.
   * Ausente = registro anterior a 2026-08-30 (a informação não existia).
   */
  createdByType?: ActorType;
}

/**
 * FormResponse - Response type sem _id
 */
export interface FormResponse extends Omit<Form, '_id'> {
  id: string;
}

/**
 * FormListResponse
 */
export interface FormListResponse extends ListResponse<FormResponse> {}

// ============================================================
// FORM REQUESTS
// ============================================================

/**
 * CreateFormRequest
 */
export interface CreateFormRequest {
  name: string;
  description?: string;
  slug?: string;
  type?: FormType;
  fields: FormField[];
  settings?: Partial<FormSettings>;
  styling?: Partial<FormStyling>;
  checklistSettings?: ChecklistSettings;
  thankYouMessage?: string;
  thankYouRedirectUrl?: string;
  maxResponses?: number;
  expiresAt?: string;
}

/**
 * UpdateFormRequest
 */
export interface UpdateFormRequest {
  name?: string;
  description?: string;
  slug?: string;
  type?: FormType;
  status?: FormStatus;
  fields?: FormField[];
  settings?: Partial<FormSettings>;
  styling?: Partial<FormStyling>;
  checklistSettings?: ChecklistSettings;
  thankYouMessage?: string;
  thankYouRedirectUrl?: string;
  maxResponses?: number | null;
  expiresAt?: string | null;
}

/**
 * FormQuery
 */
export interface FormQuery extends PaginationQuery {
  status?: FormStatus;
  search?: string;
  /**
   * Separa as duas listagens que compartilham a collection: Formulários
   * (`'form'`) e Modelos de checklist (`'checklist'`). O backend já aceitava o
   * filtro; sem o campo tipado aqui, o frontend precisava de um workaround
   * local para mandá-lo.
   */
  type?: FormType;
}

// ============================================================
// FORM SUBMISSION (Respostas)
// ============================================================

/**
 * FormAnswer - Resposta individual de um campo
 */
export interface FormAnswer {
  fieldId: string;
  fieldType: FormFieldType;
  fieldLabel: string;
  value: string | string[] | number | boolean | null;
}

/**
 * FormSubmissionMetadata - Metadados da submissao
 */
export interface FormSubmissionMetadata {
  ip?: string;
  userAgent?: string;
  referrer?: string;
  completionTimeSeconds?: number;
}

/**
 * FormSubmission - Documento de resposta individual
 */
/**
 * De onde veio a resposta (2026-09-28). O relatório do formulário junta as
 * respostas do link público (`form-submissions`) com as gravadas num lead
 * (`checklists`): captura por QR, automação ("Salvar formulário") e a aba
 * Formulários do lead. Ausente = link público (respostas antigas).
 */
export type FormSubmissionSource = 'public_link' | 'automation' | 'lead_capture' | 'lead';

export interface FormSubmission extends TenantAwareDocument {
  formId: string;
  answers: FormAnswer[];
  metadata: FormSubmissionMetadata;
  submittedAt: Date;
  contactId?: string;
  source?: FormSubmissionSource;
  /** Lead da resposta, quando ela foi gravada num lead. */
  leadId?: string;
}

/**
 * Quem respondeu (2026-09-29) — montado na LEITURA a partir do `contactId` da
 * resposta. Sem contato (link público anônimo, resposta anterior a
 * 29/09/2026) não há `respondent`.
 */
export interface FormRespondent {
  name?: string;
  /** Só dígitos, com DDI (ex.: 554791236370). Nunca o LID. */
  phone?: string;
  email?: string;
}

/**
 * FormSubmissionResponse - Response type sem _id
 */
export interface FormSubmissionResponse extends Omit<FormSubmission, '_id'> {
  id: string;
  respondent?: FormRespondent;
}

/**
 * FormSubmissionListResponse
 */
export interface FormSubmissionListResponse extends ListResponse<FormSubmissionResponse> {}

// ============================================================
// FORM SUBMISSION REQUESTS
// ============================================================

/**
 * SubmitFormRequest - Request publica para enviar resposta
 */
export interface SubmitFormRequest {
  answers: { fieldId: string; value: string | string[] | number | boolean | null }[];
  metadata?: Partial<FormSubmissionMetadata>;
  /** Dados de contato — só quando o formulário pede (`settings.contactData`). */
  contact?: FormSubmissionContact;
}

/** O que a pessoa digitou no bloco de contato da página pública. */
export interface FormSubmissionContact {
  name?: string;
  /** Com DDI (ex.: +5547991236370). */
  phone?: string;
  email?: string;
}

/**
 * FormSubmissionQuery
 */
export interface FormSubmissionQuery extends PaginationQuery {
  formId: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================
// FORM STATS (Relatorio)
// ============================================================

/**
 * FormFieldOptionStats - Estatistica de uma opcao de campo de escolha
 */
export interface FormFieldOptionStats {
  option: string;
  count: number;
  percentage: number;
}

/**
 * FormFieldStats - Estatisticas por campo
 */
export interface FormFieldStats {
  fieldId: string;
  fieldLabel: string;
  fieldType: FormFieldType;
  totalAnswered: number;
  skipped: number;
  optionCounts?: FormFieldOptionStats[];
  average?: number;
  min?: number;
  max?: number;
}

/**
 * FormResponsesByDate - Respostas agrupadas por dia
 */
export interface FormResponsesByDate {
  date: string;
  count: number;
}

/**
 * FormStats - Estatisticas completas do formulario
 *
 * Com período (`FormStatsQuery.startDate`, 2026-09-30): total, hoje, tempo
 * médio, estatística por campo e respostas por dia valem só para o período, e
 * `responsesByDate` traz TODOS os dias corridos dele (zero nos dias sem
 * resposta). `completionRate` e `viewsCount` são sempre desde o início — as
 * visualizações não têm data.
 */
export interface FormStats {
  totalResponses: number;
  todayResponses: number;
  averageCompletionTime: number;
  completionRate: number;
  viewsCount: number;
  fieldStats: FormFieldStats[];
  responsesByDate: FormResponsesByDate[];
}

/** Filtro de período do relatório do formulário (`GET /forms/:id/stats`). */
export interface FormStatsQuery {
  /** Início do período (ISO). Sem ele: tudo, e o gráfico mostra os últimos 30 dias com resposta. */
  startDate?: string;
  /** Fim do período (ISO). Padrão: agora. */
  endDate?: string;
  /** Fuso para contar os dias (IANA, ex.: America/Sao_Paulo). Padrão: UTC. */
  timezone?: string;
}

// ============================================================
// FORM PUBLIC (Dados para renderizacao publica)
// ============================================================

/**
 * FormPublicData - Dados retornados na rota publica (sem dados sensiveis)
 */
export interface FormPublicData {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: {
    showProgressBar: boolean;
    /** Presente só quando o formulário pede os dados de contato. */
    contactData?: FormContactDataSettings;
  };
  styling: FormStyling;
  thankYouMessage?: string;
  thankYouRedirectUrl?: string;
  isExpired: boolean;
  isMaxResponsesReached: boolean;
  isAcceptingResponses: boolean;
}
