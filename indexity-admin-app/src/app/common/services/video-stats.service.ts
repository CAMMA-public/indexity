import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { VideoStats } from '../models/video.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class VideoStatsService {
  get apiUrl(): string {
    return `${this.configurationService.configuration.apiConfig.baseUrl}/stats/videos`;
  }

  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  getStatsForVideo(id: number): Observable<VideoStats> {
    return this.http.get<VideoStats>(`${this.apiUrl}/${id}`);
  }

  getStats(ids: number[]): Observable<VideoStats[]> {
    return this.http
      .get<PaginatedResponse<VideoStats>>(
        `${this.apiUrl}?filter=id||in||[${ids.join(',')}]`,
      )
      .pipe(pluck('data'));
  }
}
