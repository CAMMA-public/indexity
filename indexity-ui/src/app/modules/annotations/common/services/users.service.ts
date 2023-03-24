import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { Observable } from 'rxjs';

import { User } from '@app/models/user';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { pluck } from 'rxjs/operators';

@Injectable()
export class UsersService {
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  getMany(
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    excludedIds?: number[],
  ): Observable<User[]> {
    const parsedOptions = {
      offset: options.offset.toString(),
      limit: options.limit ? options.limit.toString() : '15',
    };

    return this.http
      .get<PaginatedResponse<User>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/users?order=name,ASC${
          typeof excludedIds !== 'undefined' && excludedIds.length > 0
            ? `&filter=id||notin||[${excludedIds}]`
            : ''
        }`,
        {
          params: parsedOptions,
        },
      )
      .pipe(pluck('data'));
  }

  searchUsersByName(
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    name: string,
    excludedIds: number[],
  ): Observable<User[]> {
    const parsedOptions = options
      ? {
          offset: options.offset.toString(),
          limit: options.limit ? options.limit.toString() : '15',
        }
      : {};

    return this.http
      .get<PaginatedResponse<User>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/users?order=name,ASC${
          name ? '&filter=name||cont||' + name.toLowerCase() : ''
        }${
          typeof excludedIds !== 'undefined' && excludedIds.length > 0
            ? `&filter=id||notin||[${excludedIds}]`
            : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(pluck('data'));
  }
}
