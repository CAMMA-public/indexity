import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { Annotation } from '../models/annotation.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { ConfigurationService } from '../../configuration/configuration.service';

/**
 * Service to access the database and the socket
 */
@Injectable({
  providedIn: 'root',
})
export class AnnotationsService {
  /**
   * @ignore
   */
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  create(annotationData: Annotation): Observable<Annotation> {
    return this.http.post<Annotation>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotations`,
      annotationData,
    );
  }

  createMultiple(annotations: Array<Annotation>): Observable<Annotation[]> {
    return this.http.post<Annotation[]>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotations/bulk`,
      {
        bulk: annotations,
      },
    );
  }

  /**
   * Update a specific annotation. Used with svg annotations
   */
  update(updatedAnnotation: Partial<Annotation>): Observable<Annotation> {
    return this.http.patch<Annotation>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotations/${updatedAnnotation.id}`,
      updatedAnnotation,
    );
  }

  /**
   * Remove a specific annotation using the socket.io service
   */
  remove(annotationId: number): Observable<{ id: number }> {
    return this.http.delete<{ id: number }>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotations/${annotationId}`,
    );
  }

  /**
   * Get the annotations
   */
  listAnnotations(videoId: number): Observable<Annotation[]> {
    return this.http
      .get<PaginatedResponse<Annotation>>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${videoId}/annotations?join=user`,
      )
      .pipe(pluck('data'));
  }
}
