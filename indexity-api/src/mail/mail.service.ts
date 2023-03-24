import { Injectable, Logger, Optional } from '@nestjs/common';
import EmailTemplate from 'email-templates';
import { SendTemplateOptions } from './send-template-options.interface';
import { SendMailOptions, SentMessageInfo, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    private readonly transporter: Transporter,
    private readonly template?: EmailTemplate,
    @Optional()
    private readonly logger: Logger = new Logger('MailService'),
  ) {
    // verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        this.logger.error(
          `Failed to connect to the mail server: ${error.message}`,
        );
      } else {
        this.logger.log('Server is ready to take our messages');
      }
    });
  }

  sendTemplate(options: SendTemplateOptions): Promise<SentMessageInfo> {
    return this.template.send(options);
  }

  send(options: SendMailOptions): Promise<SentMessageInfo> {
    return this.transporter.sendMail(options);
  }
}
