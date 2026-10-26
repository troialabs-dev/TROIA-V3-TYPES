/**
 * Communication Types
 * Types for email, messaging, and webhook communications
 */
import { MediaData } from './gateway';
import { Contact } from './contacts';
import { Group } from './groups';
import type { WhatsAppTemplateComponent } from './templates';

export interface EmailData {
  to: string | string[];
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  /** Address(es) that receive the answer when the recipient hits "Reply". */
  replyTo?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  /** Base64 string or binary. Use `content` OR `path`. */
  content?: string | ArrayBuffer;
  /** Public URL of the file — the provider downloads it at send time. */
  path?: string;
  contentType?: string;
  encoding?: string;
  /** Inline attachment: the HTML references it with `src="cid:<contentId>"`. */
  contentId?: string;
}

export interface MessageData {
  // ✅ Full objects for provider to extract identifiers
  contact?: Contact;  // Full contact object - provider extracts identifiers[0]
  group?: Group;      // Full group object - provider uses providerGroupId

  message?: string;
  messageId?: string;  // ✅ MongoDB message ID for correlation
  replyToMessageId?: string;  // ✅ ID of message being replied to (for quoted messages)
  type?: 'text' | 'media' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'contacts' | 'poll' | 'reaction' | 'edit' | 'delete';

  // ✅ Structured media object
  media?: MediaData;

  // Legacy fields for backward compatibility (deprecated - use media object instead)
  /** @deprecated Use media.url instead */
  mediaUrl?: string;
  /** @deprecated Use media.type instead */
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'sticker';
  /** @deprecated Use media.filename instead */
  filename?: string;

  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };

  // ✅ Poll data para CRIAR enquete (gateway-whatsapp; Meta Cloud não suporta)
  poll?: {
    name: string;
    options: string[];
    selectableCount?: number;
  };

  // ✅ Contact data for sending vCard (not the recipient!)
  contactData?: {
    name: string;
    phone?: string;
    email?: string;
    vcard?: string;
  };

  reaction?: {
    emoji: string;
    targetMessageId: string;
    fromMe?: boolean;  // true se a mensagem alvo foi enviada por nós (outbound)
  };

  // ✅ Edit data — para editar uma mensagem já enviada (só outbound, janela de 15min no WhatsApp)
  edit?: {
    targetMessageId: string;  // providerMessageId da mensagem original no WhatsApp
    newText: string;          // Novo conteúdo em texto puro
  };

  // ✅ Revoke data — para deletar/revogar uma mensagem já enviada (WhatsApp "apagar para todos")
  revoke?: {
    targetMessageId: string;  // providerMessageId da mensagem original no WhatsApp
  };

  // Interactive message data (buttons, list, template)
  interactiveData?: Record<string, unknown>;
}

export interface WebhookData {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body: unknown;
  timeout?: number;
}

/**
 * Template Message Data
 * Used for sending template messages in campaigns
 * Supports both WhatsApp Business API (requires approval) and Gateway (no approval needed)
 */
export interface TemplateMessageData {
  // Recipient info (phone number, email address, or other provider-specific identifier)
  recipientIdentifier: string;
  recipientName?: string;

  // Template info
  templateName: string;           // providerTemplateId for WhatsApp Business, template name for Gateway
  language?: string;              // 'pt_BR', 'en_US', etc. (default: 'pt_BR')

  // Variables already resolved (position -> value)
  variables: Record<string, string>;  // { "1": "João", "2": "Empresa XYZ" }

  // Template components (WhatsApp Business API SEND format — built by WhatsAppProvider)
  components?: Array<{
    type: 'header' | 'body' | 'footer' | 'button';
    parameters?: Array<{
      type: 'text' | 'payload' | 'image' | 'video' | 'document' | 'location';
      text?: string;
      payload?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string; filename?: string };
      location?: { latitude: number; longitude: number; name?: string; address?: string };
    }>;
    sub_type?: 'url' | 'quick_reply';
    index?: number | string;
  }>;

  // RAW creation-format components from providerConfig (Meta Management API format).
  // Callers pass these untouched; WhatsAppProvider converts to SEND format internally.
  // When present, takes precedence over `components`.
  providerComponents?: WhatsAppTemplateComponent[];

  // For Gateway: pre-rendered content (variables already replaced)
  renderedContent?: string;

  // Message ID for correlation (campaign message tracking)
  messageId?: string;

  // For media templates (image, video, document, audio)
  headerMedia?: {
    type: 'image' | 'video' | 'document' | 'audio';
    url: string;
    filename?: string;
  };

  // For location templates (Gateway: /send-location, WhatsApp Business: HEADER format=LOCATION)
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };

  // For contact templates (Gateway: /send-contact)
  contactData?: {
    name: string;
    phone?: string;
    email?: string;
  };
}

/**
 * Result of sending a template message
 */
export interface SendTemplateResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  /**
   * Código numérico do erro do provider (ex.: 131047 da Meta), quando houver.
   * O texto de `error` é para humano; a decisão de máquina lê ESTE campo —
   * classificar por substring de mensagem é frágil (NUNCA #103).
   */
  errorCode?: number;
}

