import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { ConfigurationService } from 'angular-configuration-module';
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class AnnotationLabelGroupsService {
  private apiUrl = `${this.configurationService.configuration.apiConfig.baseUrl}/annotation-label-groups`;

  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  fetchAll(): Observable<any> {
    return this.http
      .get<PaginatedResponse<AnnotationLabelGroup>>(this.apiUrl, {
        params: {
          join: ['labels', 'videoGroups'],
        },
      })
      .pipe(pluck('data'));
  }

  fetchOne(id: number): Observable<AnnotationLabelGroup> {
    return this.http.get<AnnotationLabelGroup>(`${this.apiUrl}/${id}`, {
      params: {
        join: ['labels', 'videoGroups'],
      },
    });
  }

  createOne(group: AnnotationLabelGroup): Observable<AnnotationLabelGroup> {
    return this.http.post<AnnotationLabelGroup>(this.apiUrl, group);
  }

  updateOne(
    group: Partial<AnnotationLabelGroup>,
  ): Observable<AnnotationLabelGroup> {
    return this.http.patch<AnnotationLabelGroup>(
      `${this.apiUrl}/${group.id}`,
      group,
    );
  }

  removeOne(id: number): Observable<AnnotationLabelGroup> {
    return this.http.delete<AnnotationLabelGroup>(`${this.apiUrl}/${id}`);
  }

  addLabels(
    groupId: number,
    labelNames: string[],
  ): Observable<AnnotationLabelGroup> {
    return this.http.post<AnnotationLabelGroup>(
      `${this.apiUrl}/${groupId}/labels`,
      labelNames,
    );
  }

  removeLabels(
    groupId: number,
    labelNames: string[],
  ): Observable<AnnotationLabelGroup> {
    return this.http.request<AnnotationLabelGroup>(
      'delete',
      `${this.apiUrl}/${groupId}/labels`,
      {
        body: labelNames,
      },
    );
  }
}
