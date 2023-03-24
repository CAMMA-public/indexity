import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { Observable } from 'rxjs';
import { StartedStructureTracker } from '@app/annotations/models/structure-tracker.model';

/**
 * Service to access the database and the socket
 */
@Injectable()
export class StructureTrackerService {
  /**
   * @ignore
   */
  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  getVideoStructureTrackers(
    videoId: number,
  ): Observable<StartedStructureTracker[]> {
    return this.http.get<StartedStructureTracker[]>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/structure-tracker/video/${videoId}`,
      {},
    );
  }
}
