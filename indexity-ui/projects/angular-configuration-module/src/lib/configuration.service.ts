import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationModuleOptions } from './configuration-module-options.interface';
import { CONFIGURATION_MODULE_OPTIONS } from './configuration.token';

@Injectable()
export class ConfigurationService {
  constructor(
    @Inject(CONFIGURATION_MODULE_OPTIONS)
    private readonly serviceConfiguration: ConfigurationModuleOptions,
    private readonly http: HttpClient,
  ) {}

  private config: any;

  get configuration(): any {
    return this.config;
  }

  loadConfig(): Observable<any> {
    return forkJoin([this.getConfiguration()]);
  }

  getConfiguration(): Observable<any> {
    return this.http
      .get(this.serviceConfiguration.path)
      .pipe(map((config) => (this.config = config)));
  }
}
