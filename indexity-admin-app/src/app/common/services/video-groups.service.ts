import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { VideoGroup } from '../models/video-groups.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { Video } from '../models/video.model';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class VideoGroupsService {
  get apiUrl(): string {
    return `${this.configurationService.configuration.apiConfig.baseUrl}/video-groups`;
  }

  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  addOne(group: VideoGroup): Observable<VideoGroup> {
    return this.http.post<VideoGroup>(`${this.apiUrl}`, group);
  }

  updateOne(group: Partial<VideoGroup>): Observable<VideoGroup> {
    return this.http.patch<VideoGroup>(`${this.apiUrl}/${group.id}`, group);
  }

  getMany(
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
  ): Observable<VideoGroup[]> {
    const parsedOptions = {
      offset: options.offset.toString(),
      limit: options.limit ? options.limit.toString() : '15',
    };

    return this.http
      .get<PaginatedResponse<VideoGroup>>(`${this.apiUrl}`, {
        params: parsedOptions,
      })
      .pipe(pluck('data'));
  }

  getOne(VideoGroupId: number): Observable<VideoGroup> {
    return this.http.get<VideoGroup>(`${this.apiUrl}/${VideoGroupId}`);
  }

  loadByIds(ids: number[]): Observable<VideoGroup[]> {
    return this.http
      .get<PaginatedResponse<VideoGroup>>(
        `${this.apiUrl}?filter=id||in||[${ids.join(',')}]`,
      )
      .pipe(pluck('data'));
  }

  search(q: string): Observable<VideoGroup[]> {
    return this.http
      .get<PaginatedResponse<VideoGroup>>(
        `${this.apiUrl}${
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
        `${this.apiUrl}/${groupId}/videos${filter ? '?filter=' + filter : ''}`,
        { params: parsedOptions },
      )
      .pipe(pluck('data'));
  }

  addVideos(groupId: number, videoIds: number[]): Observable<VideoGroup> {
    return this.http.post<VideoGroup>(
      `${this.apiUrl}/${groupId}/videos`,
      videoIds,
    );
  }

  removeVideos(groupId: number, videoIds: number[]): Observable<VideoGroup> {
    return this.http.request<VideoGroup>(
      'delete',
      `${this.apiUrl}/${groupId}/videos`,
      {
        body: videoIds,
      },
    );
  }

  patchVideos(groupId: number, videoIds: number[]): Observable<VideoGroup> {
    return this.http.request<VideoGroup>(
      'patch',
      `${this.apiUrl}/${groupId}/videos`,
      {
        body: videoIds,
      },
    );
  }

  removeOne(groupId: number): Observable<VideoGroup> {
    return this.http.delete<VideoGroup>(`${this.apiUrl}/${groupId}`);
  }
}
