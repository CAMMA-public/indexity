import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationModuleOptions } from './configuration-module-options.interface';
import { CONFIGURATION_MODULE_OPTIONS } from './configuration.tokens';
import { Configuration } from './configuration.interface';

@Injectable()
export class ConfigurationService {
  private _configuration: Configuration;

  constructor(
    @Inject(CONFIGURATION_MODULE_OPTIONS)
    private readonly serviceConfiguration: ConfigurationModuleOptions,
    private readonly http: HttpClient,
  ) {}

  get configuration(): Configuration {
    return this._configuration;
  }

  // the return value (Promise) of this method is used as an APP_INITIALIZER,
  // so the application's initialization will not complete until the Promise resolves.
  async initialize(): Promise<void> {
    if (!this._configuration) {
      // path is relative to that for app's index.html
      if (!this.isLocalConfiguration(this.serviceConfiguration)) {
        this._configuration = await this.http
          .get<Configuration>(this.serviceConfiguration.path)
          .toPromise();
      } else {
        this._configuration = this.serviceConfiguration.values;
      }
    }
  }

  private isLocalConfiguration(
    serviceConfiguration: ConfigurationModuleOptions,
  ): boolean {
    return serviceConfiguration.values !== undefined;
  }
}
