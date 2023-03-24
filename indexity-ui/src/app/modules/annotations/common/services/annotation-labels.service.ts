import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { pluck } from 'rxjs/operators';

@Injectable()
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

  createOne(label: AnnotationLabel): Observable<AnnotationLabel> {
    return this.http.post<AnnotationLabel>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotation-labels`,
      label,
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

  removeLabel(name: string): Observable<AnnotationLabel> {
    return this.http.delete<AnnotationLabel>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/admin/annotation-labels/${name}`,
    );
  }
}
