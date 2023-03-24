import { getOptionsToken } from './get-options-token.util';
import { Provider } from '@nestjs/common';
import { NamedMailModuleAsyncOptions } from './mail-module-async-options.interface';

export const createAsyncOptionsProviders = (
  options: NamedMailModuleAsyncOptions[],
): Provider[] =>
  options.map(
    (opt): Provider => ({
      inject: opt.inject,
      useClass: opt.useClass,
      useExisting: opt.useExisting,
      useFactory: opt.useFactory,
      useValue: opt.useValue,
      provide: getOptionsToken(opt.name),
    }),
  );
