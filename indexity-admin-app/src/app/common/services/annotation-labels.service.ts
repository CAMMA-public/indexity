import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { AnnotationLabel } from '../models/annotation-label.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class AnnotationLabelsService {
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  fetchAll(): Observable<AnnotationLabel[]> {
    return this.http
      .get<PaginatedResponse<AnnotationLabel>>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/annotation-labels`,
      )
      .pipe(pluck('data'));
  }

  fetch(name: string): Observable<AnnotationLabel> {
    return this.http.get<AnnotationLabel>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotation-labels/${name}`,
    );
  }

  search(q: string): Observable<AnnotationLabel[]> {
    return this.http.get<AnnotationLabel[]>(
      `${
        this.configurationService.configuration.apiConfig.baseUrl
      }/annotation-labels/search?${
        q && q.length ? `filter=name||cont||${q.toLowerCase()}&` : ''
      }limit=10`,
    );
  }

  fetchForVideo(videoId: number): Observable<AnnotationLabel[]> {
    return this.http
      .get<PaginatedResponse<AnnotationLabel>>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}/annotation-labels`,
      )
      .pipe(pluck('data'));
  }
}
