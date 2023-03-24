import { SendMailOptions } from 'nodemailer';

export interface SendTemplateOptions {
  template: string;
  message: SendMailOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locals: Record<string, any>;
}
