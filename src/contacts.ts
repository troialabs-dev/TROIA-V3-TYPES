// Personal Info Types
export interface ContactAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface PersonalInfo {
  birthDate?: string;
  /**
   * Documento do contato (CPF, CNPJ ou outro) — texto livre, gravado como foi
   * digitado. A captura por QR grava o CPF já formatado (`000.000.000-00`).
   */
  document?: string;
  address?: ContactAddress;
}

// Contact Types - Multi-channel identifier support
export interface ContactIdentifiers {
  // Generic identifiers (fallback for all providers)
  email: string[];
  phone: string[];

  // Provider-specific identifiers (arrays of strings)
  // WhatsApp: ["5547991236370@s.whatsapp.net", "213782781983172@lid", "+5547991236370"]
  whatsapp: string[];

  // Instagram: ["username", "17841401234567890"]
  instagram: string[];

  // Facebook: ["username", "fb_id_123456"]
  // ✅ CANÔNICO `string[]` — o Zod do backend normaliza o payload legado
  // `{ id, username }` para a string do id (nunca grava objeto), igual ao que
  // já é feito em whatsapp e instagram.
  facebook: string[];

  // Telegram: ["@username", "123456789"]
  // ✅ CANÔNICO `string[]` — mesma normalização do facebook acima.
  telegram: string[];
}

/**
 * Carrega o carimbo de autoria (`createdBy` + `createdByType`) desde
 * 2026-08-30. Os dois são opcionais: registro anterior a essa data não tem a
 * informação, e ausente é a verdade. Ver `CreatorStamp` em `common.ts`.
 */
export interface Contact extends CreatorStamp {
  id: string;
  appId: string;
  companyId: string;

  // Basic identification
  name: string;
  picture?: string;
  tags: string[];

  // Multi-channel identifiers
  identifiers: ContactIdentifiers;

  // Relationships
  customerId?: string;

  // Personal information
  personalInfo?: PersonalInfo;

  // Free-text notes about the contact (the "Notas" field in the contact form)
  notes?: string;

  // Assignment system integration
  assigneeId?: string;
  teamId?: string;

  // Interaction tracking
  lastInteractionAt?: string;  // Updated when client SENDS a message

  // Mute preference per-user — lista de userIds que silenciaram notificações
  // deste contato. Persiste entre lifecycles de conversation (quando conv fecha
  // e novo atendimento é aberto, o mute segue o contato, não a conv).
  // Toggle via POST /conversations/:id/mute|unmute (backend roteia pro Contact
  // quando conv é individual).
  mutedBy?: string[];

  // E-mail→Ticket (Plano B, D5) — autorização do contato para que e-mails
  // dele virem tickets automaticamente/em retenção. Ausente = pendente
  // (primeiro e-mail sempre passa por retenção manual até decisão).
  emailTicketAuthorization?: 'approved' | 'blocked';

  // Bloqueio do contato nesta empresa (2026-09-01). Ligado: mensagem recebida
  // dele é DESCARTADA e nada é enviado a ele, em todos os canais. Não vale em
  // conversa de grupo. Ausente = não bloqueado.
  // NÃO confundir com `emailTicketAuthorization: 'blocked'`, que é outra coisa
  // (autorização de e-mail virar ticket) e continua existindo em paralelo.
  // Ver DOCS/superpowers/specs/2026-09-01-bloqueio-de-contato-design.md
  blocked?: boolean;
  blockedAt?: string;
  blockedBy?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  name: string;
  picture?: string;
  tags?: string[];
  identifiers: Partial<ContactIdentifiers>;
  personalInfo?: PersonalInfo;
  notes?: string;
  customerId?: string;
  assigneeId?: string;
  teamId?: string;
}

export interface UpdateContactRequest {
  name?: string;
  picture?: string;
  tags?: string[];
  identifiers?: Partial<ContactIdentifiers>;
  personalInfo?: PersonalInfo;
  notes?: string;
  customerId?: string;
  assigneeId?: string;
  teamId?: string;
}

export type ContactResponse = Contact;

export interface ContactQuery extends PaginationQuery {
  filters?: {
    name?: string;
    email?: string;
    phone?: string;
    whatsappLid?: string;
    instagramId?: string;
    facebookId?: string;
    telegramId?: string;
    customerId?: string;
    tags?: string[];
    assigneeId?: string;
    teamId?: string;
    // `true` = só bloqueados, `false` = só não bloqueados, ausente = todos.
    blocked?: boolean;
  };
}

export interface ContactListResponse extends ListResponse<ContactResponse> {}

// Import types
import { CreatorStamp, ListResponse, PaginationQuery } from './common';