import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Video } from '../models/video.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { filter, map, pluck } from 'rxjs/operators';
import { VIDEO_ANNOTATION_STATE } from '../models/video-annotation-state';
import { UserVideoAnnotationState } from '../models/user-video-annotation-state';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class VideosApiService {
  get apiUrl(): string {
    return `${this.configurationService.configuration.apiConfig.baseUrl}/videos`;
  }

  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  /**
   * Get a list of the videos from the REST API
   * @returns Returns an array of the SurgAnnotationStreams conforming to the request
   */
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
        `${this.apiUrl}${filter_ ? '?filter=' + filter_ : ''}`,
        {
          params: parsedOptions,
        },
      )
      .pipe(
        pluck('data'),
        filter(Boolean),
        map((videos: Video[]) =>
          videos.map((video) => ({
            ...video,
            url: `${this.apiUrl}/${video.id}/media`,
          })),
        ),
      );
  }

  // tslint:disable-next-line:variable-name
  search(
    filter_: string,
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
        `${this.apiUrl}${
          filter_ ? '?filter=name||cont||' + filter_.toLowerCase() : ''
        }`,
        { params: parsedOptions },
      )
      .pipe(
        pluck('data'),
        map((videos) =>
          videos.map((video) => ({
            ...video,
            url: `${this.apiUrl}/${video.id}/media`,
          })),
        ),
      );
  }

  loadVideosByIds(ids: number[]): Observable<Video[]> {
    return this.http
      .get<PaginatedResponse<Video>>(
        `${this.apiUrl}?filter=id||in||[${ids.join(',')}]`,
      )
      .pipe(pluck('data'));
  }

  searchByLabelName(labelName: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/relatedToLabel/${labelName}`);
  }

  show(videoId: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/${videoId}`).pipe(
      map((video) => ({
        ...video,
        url: `${this.apiUrl}/${videoId}/media`,
      })),
    );
  }

  uploadVideos(formData: FormData): Promise<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData).toPromise();
  }

  deleteVideo(videoId: number): Observable<Video> {
    return this.http.delete<Video>(`${this.apiUrl}/${videoId}`);
  }

  setAnnotationState(
    videoId: number,
    state: VIDEO_ANNOTATION_STATE,
  ): Observable<UserVideoAnnotationState> {
    const endpoint =
      state === VIDEO_ANNOTATION_STATE.ANNOTATION_PENDING
        ? 'setAnnotationPending'
        : 'setAnnotationFinished';

    return this.http.post<UserVideoAnnotationState>(
      `${this.apiUrl}/${videoId}/${endpoint}`,
      {},
    );
  }
}
