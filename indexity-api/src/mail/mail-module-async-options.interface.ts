import {
  ModuleMetadata,
  ExistingProvider,
  ClassProvider,
  FactoryProvider,
  ValueProvider,
} from '@nestjs/common/interfaces';
import { MailModuleOptions } from './mail-module-options.type';

export interface MailModuleOptionsFactory {
  createMailModuleOptions(): Promise<MailModuleOptions> | MailModuleOptions;
}

export interface MailModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: ExistingProvider<MailModuleOptionsFactory>['useExisting'];
  useClass?: ClassProvider<MailModuleOptionsFactory>['useClass'];
  useFactory?: FactoryProvider<MailModuleOptions>['useFactory'];
  useValue?: ValueProvider<MailModuleOptions>['useValue'];
  inject?: FactoryProvider<MailModuleOptions>['inject'];
}

export interface NamedMailModuleAsyncOptions extends MailModuleAsyncOptions {
  name?: string;
}
