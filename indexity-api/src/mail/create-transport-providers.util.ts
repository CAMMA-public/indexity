import { getTransportToken } from './get-transport-token.util';
import { createTransport } from 'nodemailer';
import { getOptionsToken } from './get-options-token.util';
import { Provider } from '@nestjs/common';
import {
  NamedMailModuleOptions,
  MailModuleOptions,
} from './mail-module-options.type';

export const createTransportProviders = (
  options: NamedMailModuleOptions[],
): Provider[] =>
  options.map(opt => ({
    provide: getTransportToken(opt.name),
    useFactory: (options: MailModuleOptions) =>
      createTransport(options.transport.transport, options.transport.defaults),
    inject: [getOptionsToken(opt.name)],
  }));
