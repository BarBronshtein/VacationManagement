export interface MailAttachment {
  filename: string;
  /** Absolute path OR Buffer */
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  /** Plain-text body */
  text?: string;
  /** HTML body (takes priority over text when both are present) */
  html?: string;
  /** Handlebars template name (e.g. 'welcome' → templates/welcome.hbs) */
  template?: string;
  /** Context object passed to the Handlebars template */
  context?: Record<string, unknown>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: MailAttachment[];
  priority?: 'high' | 'normal' | 'low';
}
