import { getOptionsToken } from './get-options-token.util';
import { Provider } from '@nestjs/common';
import { NamedMailModuleOptions } from './mail-module-options.type';

export const createOptionsProviders = (
  options: NamedMailModuleOptions[],
): Provider[] =>
  options.map(opt => ({
    provide: getOptionsToken(opt.name),
    useValue: opt,
  }));
