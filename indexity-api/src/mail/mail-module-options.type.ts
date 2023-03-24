import SMTPTransport from 'nodemailer/lib/smtp-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { Transport, TransportOptions } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import JSONTransport from 'nodemailer/lib/json-transport';
import StreamTransport from 'nodemailer/lib/stream-transport';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';

interface MailModuleSMTPTransportOptions {
  transport?: SMTPTransport | SMTPTransport.Options | string;
  defaults?: SMTPTransport.Options;
}

interface MailModuleSMTPPoolTransportOptions {
  transport: SMTPPool | SMTPPool.Options;
  defaults?: SMTPPool.Options;
}

interface MailModuleSendMailTransportOptions {
  transport: SendmailTransport | SendmailTransport.Options;
  defaults?: SendmailTransport.Options;
}

interface MailModuleStreamTransportOptions {
  transport: StreamTransport | StreamTransport.Options;
  defaults?: StreamTransport.Options;
}

interface MailModuleJSONTransportOptions {
  transport: JSONTransport | JSONTransport.Options;
  defaults?: JSONTransport.Options;
}

interface MailModuleSESTransportOptions {
  transport: SESTransport | SESTransport.Options;
  defaults?: SESTransport.Options;
}

interface MailModuleTransportOptions {
  transport: Transport | TransportOptions;
  defaults?: TransportOptions;
}

export interface MailModuleOptions {
  template?: {
    templateExtension?: string;
    send?: boolean;
    preview?: boolean;
  };
  transport:
    | MailModuleSMTPTransportOptions
    | MailModuleSMTPPoolTransportOptions
    | MailModuleSendMailTransportOptions
    | MailModuleStreamTransportOptions
    | MailModuleJSONTransportOptions
    | MailModuleSESTransportOptions
    | MailModuleTransportOptions;
}

export interface NamedMailModuleOptions extends MailModuleOptions {
  name?: string;
}
