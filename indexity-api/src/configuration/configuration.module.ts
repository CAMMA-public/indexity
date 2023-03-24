import { DynamicModule, Global, Module } from '@nestjs/common';

export const CONFIGURATION = Symbol();

@Global()
@Module({})
export class ConfigurationModule {
  static forRoot<T>(configuration: T): DynamicModule {
    return {
      module: ConfigurationModule,
      providers: [{ provide: CONFIGURATION, useValue: configuration }],
      exports: [CONFIGURATION],
    };
  }
}
