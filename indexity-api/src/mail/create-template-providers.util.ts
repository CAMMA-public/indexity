import EmailTemplate from 'email-templates';
import { Provider } from '@nestjs/common';
import {
  NamedMailModuleOptions,
  MailModuleOptions,
} from './mail-module-options.type';
import { Transporter } from 'nodemailer';
import { getTransportToken } from './get-transport-token.util';
import { getTemplateToken } from './get-template-token.util';
import { isString, isBoolean } from 'lodash';
import { getOptionsToken } from './get-options-token.util';

export const createTemplateProviders = (
  options: NamedMailModuleOptions[],
): Provider<EmailTemplate>[] =>
  options.map(opt => ({
    provide: getTemplateToken(opt.name),
    useFactory: (injectedOpt: MailModuleOptions, transport: Transporter) => {
      const t = new EmailTemplate({
        message: {},
        views: {
          options: {
            extension: isString(injectedOpt.template.templateExtension)
              ? injectedOpt.template.templateExtension
              : 'pug',
          },
        },
        send: isBoolean(injectedOpt.template.send)
          ? injectedOpt.template.send
          : false,
        preview: isBoolean(injectedOpt.template.preview)
          ? injectedOpt.template.preview
          : true,
        transport,
      });
      return t;
    },
    inject: [getOptionsToken(opt.name), getTransportToken(opt.name)],
  }));
