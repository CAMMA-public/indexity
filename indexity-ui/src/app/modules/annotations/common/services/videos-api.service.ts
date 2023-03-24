import { Injectable } from '@angular/core';
import { ConfigurationService } from 'angular-configuration-module';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { filter, map, pluck } from 'rxjs/operators';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';

@Injectable()
export class VideosApiService {
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  /**
   * Get a list of the videos from the REST API
   * @returns Returns an array of the SurgAnnotationStreams conforming to the request
   */
  // tslint:disable-next-line:variable-name
  getVideos(
    options: { offset: number; limit?: number } = { offset: 0, limit: 15 },
    filter_?: string,
  ): Observable<Video[]> {
    const parsedOptions = options
      ? {
          offset: options.offset ? options.offset.toString() : '0',
          limit: options.limit ? options.limit.toString() : '15',
        }
      : {};

    return this.http
      .get<PaginatedResponse<Video>>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos${
          filter_ ? '?filter=' + filter_ : ''
        }`,
        {
          params: parsedOptions,
        },
      )
      .pipe(
        pluck('data'),
        filter((videos) => !!videos),
        map((videos: Video[]) =>
          videos.map((video) => ({
            ...video,
            url: `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${video.id}/media`,
          })),
        ),
      );
  }

  // tslint:disable-next-line:variable-name
  searchByName(
    name: string,
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
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos${
          name ? '?filter=name||cont||' + name.toLowerCase() : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(
        pluck('data'),
        map((videos) =>
          videos.map((video) => ({
            ...video,
            url: `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${video.id}/media`,
          })),
        ),
      );
  }

  searchByAnnotationState(
    annotationState: string,
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
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos${
          annotationState
            ? '?filter=annotationState||cont||' + annotationState.toUpperCase()
            : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(
        pluck('data'),
        map((videos) =>
          videos.map((video) => ({
            ...video,
            url: `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${video.id}/media`,
          })),
        ),
      );
  }

  loadVideosByIds(ids: number[]): Observable<Video[]> {
    return this.http
      .get<PaginatedResponse<Video>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/videos?filter=id||in||[${ids.join(',')}]`,
      )
      .pipe(pluck('data'));
  }

  searchByLabelName(labelName: string): Observable<Video[]> {
    return this.http.get<Video[]>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/relatedToLabel/${labelName}`,
    );
  }

  show(videoId: number): Observable<Video> {
    return this.http
      .get<Video>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}`,
      )
      .pipe(
        map((video) => ({
          ...video,
          url: `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}/media`,
        })),
      );
  }

  uploadVideos(formData: FormData): Promise<any> {
    return this.http
      .post(
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos/upload`,
        formData,
      )
      .toPromise();
  }

  updateVideo(video: Partial<Video>): Observable<Video> {
    return this.http.patch<Video>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${video.id}`,
      video,
    );
  }

  deleteVideo(videoId: number): Observable<Video> {
    return this.http.delete<Video>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}`,
    );
  }

  setAnnotationState(
    videoId: number,
    state: VIDEO_ANNOTATION_STATE,
  ): Observable<Video> {
    return this.http.patch<Video>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}/annotation-state`,
      { state },
    );
  }
}
