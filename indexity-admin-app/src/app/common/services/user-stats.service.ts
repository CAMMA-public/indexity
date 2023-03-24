import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserStats } from '../models/user';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class UserStatsService {
  apiUrl = (userId: number): string =>
    `${this.configurationService.configuration.apiConfig.baseUrl}/admin/users/${userId}/stats`;

  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  getUserStats(userId: number): Promise<any> {
    return this.http.get<UserStats>(`${this.apiUrl(userId)}`).toPromise();
  }
}
