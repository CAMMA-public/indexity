import EmailTemplate from 'email-templates';
import { Provider } from '@nestjs/common';
import { NamedMailModuleOptions } from './mail-module-options.type';
import { MailService } from './mail.service';
import { getServiceToken } from './get-service-token.util';
import { getTemplateToken } from './get-template-token.util';
import { Transporter } from 'nodemailer';
import { getTransportToken } from './get-transport-token.util';

export const createServiceProviders = (
  options: NamedMailModuleOptions[],
): Provider<MailService>[] =>
  options.map(opt => ({
    provide: getServiceToken(opt.name),
    useFactory: (transporter: Transporter, template: EmailTemplate) =>
      new MailService(transporter, template),
    inject: [getTransportToken(opt.name), getTemplateToken(opt.name)],
  }));
