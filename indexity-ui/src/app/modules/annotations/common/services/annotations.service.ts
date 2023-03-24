import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { pluck } from 'rxjs/operators';

/**
 * Service to access the database and the socket
 */
@Injectable()
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

  track(annotationId: number): Observable<any> {
    return this.http.post(
      `${this.configurationService.configuration.apiConfig.baseUrl}/structure-tracker/track/${annotationId}`,
      {},
    );
  }

  /**
   * Update a specific annotation. Used with svg annotations
   */
  update(
    updatedAnnotation: Partial<Annotation>,
    withInterpolation?: boolean,
    step?: number,
  ): Observable<Annotation> {
    const stepQuery =
      withInterpolation && step ? `&interpolationStep=${step}` : '';

    return this.http.patch<Annotation>(
      `${
        this.configurationService.configuration.apiConfig.baseUrl
      }/annotations/${updatedAnnotation.id}?withInterpolation=${
        withInterpolation + stepQuery
      }`,
      updatedAnnotation,
    );
  }

  /**
   * Remove a specific annotation using the socket.io service
   */
  remove(annotationId: number): Observable<Annotation> {
    return this.http.delete<Annotation>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/annotations/${annotationId}`,
    );
  }

  /**
   * Get the annotations
   */
  listAnnotations(
    videoId: number,
    withInterpolation = false,
    step: number = null,
  ): Observable<Annotation[]> {
    const stepQuery =
      withInterpolation && step ? `&interpolationStep=${step}` : '';

    return this.http
      .get<PaginatedResponse<Annotation>>(
        `${
          this.configurationService.configuration.apiConfig.baseUrl
        }/videos/${videoId}/annotations?join=user&withInterpolation=${
          withInterpolation + stepQuery
        }`,
      )
      .pipe(pluck('data'));
  }

  /**
   * Get one annotation
   */
  loadAnnotation(
    annotationId: number,
    withInterpolation = false,
    step: number = null,
  ): Observable<Annotation> {
    const stepQuery =
      withInterpolation && step ? `&interpolationStep=${step}` : '';

    return this.http.get<Annotation>(
      `${
        this.configurationService.configuration.apiConfig.baseUrl
      }/annotations/${annotationId}?join=user&withInterpolation=${
        withInterpolation + stepQuery
      }`,
    );
  }
}
