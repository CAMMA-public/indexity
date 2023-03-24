import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { Observable } from 'rxjs';
import { filter, map, pluck } from 'rxjs/operators';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { Video } from '@app/videos/models/video.model';

@Injectable()
export class VideoBookmarksService {
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  getBookmarkIds(): Observable<number[]> {
    return this.http.get<number[]>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/bookmarks-ids`,
    );
  }

  index(
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
  ): Observable<Video[]> {
    const parsedOptions = options
      ? {
          offset: options.offset ? options.offset.toString() : '0',
          limit: options.limit ? options.limit.toString() : '15',
        }
      : {};

    return this.http
      .get<PaginatedResponse<Video>>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos/bookmarks`,
        {
          params: parsedOptions,
        },
      )
      .pipe(
        filter((response: PaginatedResponse<Video>) => !!response),
        pluck('data'),
        map((videos: Video[]) =>
          videos.map((video) => ({
            ...video,
            url: `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${video.id}/media`,
          })),
        ),
      );
  }

  create(videoId: number): Observable<{ videoId: number }> {
    return this.http.post<{ videoId: number }>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}/bookmark`,
      {},
    );
  }

  remove(videoId: number): Observable<{ videoId: number }> {
    return this.http.delete<{ videoId: number }>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}/bookmark`,
      {},
    );
  }
}
