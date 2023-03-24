import { DynamicModule, Module } from '@nestjs/common';
import { NamedMailModuleOptions } from './mail-module-options.type';
import { createOptionsProviders } from './create-options-providers.util';
import { createTransportProviders } from './create-transport-providers.util';
import { createTemplateProviders } from './create-template-providers.util';
import { createServiceProviders } from './create-service-providers.util';
import { NamedMailModuleAsyncOptions } from './mail-module-async-options.interface';
import { createAsyncOptionsProviders } from './create-async-options-providers.util';

@Module({})
export class MailModule {
  static register(
    options: NamedMailModuleOptions | NamedMailModuleOptions[],
  ): DynamicModule {
    const optionsProviders = createOptionsProviders([].concat(options));
    const transportProviders = createTransportProviders([].concat(options));
    const templateProviders = createTemplateProviders([].concat(options));
    const serviceProviders = createServiceProviders([].concat(options));
    return {
      module: MailModule,
      providers: [
        ...optionsProviders,
        ...transportProviders,
        ...templateProviders,
        ...serviceProviders,
      ],
      exports: [...serviceProviders],
    };
  }

  static registerAsync(
    options: NamedMailModuleAsyncOptions | NamedMailModuleAsyncOptions[],
  ): DynamicModule {
    const optionsProviders = createAsyncOptionsProviders([].concat(options));
    const transportProviders = createTransportProviders([].concat(options));
    const templateProviders = createTemplateProviders([].concat(options));
    const serviceProviders = createServiceProviders([].concat(options));
    return {
      module: MailModule,
      providers: [
        ...optionsProviders,
        ...transportProviders,
        ...templateProviders,
        ...serviceProviders,
      ],
      exports: [...serviceProviders],
    };
  }
}
