import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'angular-configuration-module';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { pluck } from 'rxjs/operators';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { User } from '@app/models/user';

@Injectable()
export class VideoGroupsService {
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  addOne(group: VideoGroup): Observable<VideoGroup> {
    return this.http.post<VideoGroup>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups`,
      group,
    );
  }

  updateOne(group: Partial<VideoGroup>): Observable<VideoGroup> {
    return this.http.patch<VideoGroup>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${group.id}`,
      group,
    );
  }

  getMany(
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
  ): Observable<VideoGroup[]> {
    const parsedOptions = {
      offset: options.offset.toString(),
      limit: options.limit ? options.limit.toString() : '15',
    };

    return this.http
      .get<PaginatedResponse<VideoGroup>>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups`,
        {
          params: parsedOptions,
        },
      )
      .pipe(pluck('data'));
  }

  getOne(VideoGroupId: number): Observable<VideoGroup> {
    return this.http.get<VideoGroup>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${VideoGroupId}`,
    );
  }

  loadByIds(ids: number[]): Observable<VideoGroup[]> {
    return this.http
      .get<PaginatedResponse<VideoGroup>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/video-groups?filter=id||in||[${ids.join(',')}]`,
      )
      .pipe(pluck('data'));
  }

  search(q: string): Observable<VideoGroup[]> {
    return this.http
      .get<PaginatedResponse<VideoGroup>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/video-groups${
          q
            ? `?filter=name||cont||${q}&filter=description||cont||${q.toLowerCase()}`
            : ''
        }`,
      )
      .pipe(pluck('data'));
  }

  getVideos(
    groupId: number,
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    filter?: string,
  ): Observable<Video[]> {
    const parsedOptions = options
      ? {
          offset: options.offset.toString(),
          limit: options.limit ? options.limit.toString() : '15',
        }
      : {};

    return this.http
      .get<PaginatedResponse<Video>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/video-groups/${groupId}/videos${filter ? '?filter=' + filter : ''}`,
        { params: parsedOptions },
      )
      .pipe(pluck('data'));
  }

  searchVideosByName(
    groupId: number,
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    name?: string,
  ): Observable<Video[]> {
    const parsedOptions = options
      ? {
          offset: options.offset.toString(),
          limit: options.limit ? options.limit.toString() : '15',
        }
      : {};

    return this.http
      .get<PaginatedResponse<Video>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/video-groups/${groupId}/videos${
          name ? '?filter=name||cont||' + name.toLowerCase() : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(pluck('data'));
  }

  addVideos(groupId: number, videoIds: number[]): Observable<VideoGroup> {
    return this.http.post<VideoGroup>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${groupId}/videos`,
      videoIds,
    );
  }

  removeVideos(groupId: number, videoIds: number[]): Observable<VideoGroup> {
    return this.http.request<VideoGroup>(
      'delete',
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${groupId}/videos`,
      {
        body: videoIds,
      },
    );
  }

  patchVideos(groupId: number, videoIds: number[]): Observable<VideoGroup> {
    return this.http.request<VideoGroup>(
      'patch',
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${groupId}/videos`,
      {
        body: videoIds,
      },
    );
  }

  removeOne(groupId: number): Observable<VideoGroup> {
    return this.http.delete<VideoGroup>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${groupId}`,
    );
  }

  //// USERS /////////////////////////////

  getUsers(
    groupId: number,
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    filter?: string,
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
        }/video-groups/${groupId}/users?order=name,ASC${
          filter ? '&filter=' + filter : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(pluck('data'));
  }

  addUser(groupId: number, userId: number): Observable<void> {
    return this.http.request<void>(
      'patch',
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users/${userId}`,
    );
  }

  removeUser(groupId: number, userId: number): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users/${userId}`,
    );
  }

  searchUsersByName(
    groupId: number,
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    name?: string,
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
        }/video-groups/${groupId}/users?order=name,ASC${
          name ? '&filter=name||cont||' + name.toLowerCase() : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(pluck('data'));
  }
}
