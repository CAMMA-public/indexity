import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { VideoStats } from '@app/annotations/modules/videos/models/video.model';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { pluck } from 'rxjs/operators';

@Injectable()
export class VideoStatsService {
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  getStatsForVideo(id: number): Observable<VideoStats> {
    return this.http.get<VideoStats>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/stats/videos/${id}`,
    );
  }

  getStats(ids: number[]): Observable<VideoStats[]> {
    return this.http
      .get<PaginatedResponse<VideoStats>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/stats/videos?filter=id||in||[${ids.join(',')}]`,
      )
      .pipe(pluck('data'));
  }
}
