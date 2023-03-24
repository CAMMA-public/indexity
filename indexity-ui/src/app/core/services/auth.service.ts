import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'angular-configuration-module';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  accessToken: string;

  constructor(
    private readonly configurationService: ConfigurationService,
    private http: HttpClient,
  ) {}

  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ user: User; accessToken: string }> {
    return this.http.post<{ user: User; accessToken: string }>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/auth/login`,
      credentials,
    );
  }

  signup(user: User): Observable<{ user: User; accessToken: string }> {
    return this.http.post<{ user: User; accessToken: string }>(
      `${this.configurationService.configuration.apiConfig.baseUrl}/users/annotator`,
      user,
    );
  }

  verify(): Observable<HttpResponse<any>> {
    return this.http.get(
      `${this.configurationService.configuration.apiConfig.baseUrl}/auth/verify`,
      {
        observe: 'response',
      },
    );
  }

  getLocalAccessToken(): string {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  setLocalAccessToken(token?: string): void {
    if (token && token.length) {
      localStorage.setItem('accessToken', token);
      this.accessToken = token;
    } else {
      localStorage.removeItem('accessToken');
      this.accessToken = null;
    }
  }

  requestReset(email: string): Promise<{ email: string }> {
    return this.http
      .post<{ email: string }>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/users/reset-password`,
        { email },
      )
      .toPromise();
  }

  verifyPasswordResetHash(hash: string): Promise<any> {
    return this.http
      .head(
        `${this.configurationService.configuration.apiConfig.baseUrl}/users/password-reset-hash/${hash}`,
      )
      .toPromise();
  }

  resetPassword({
    password,
    confirmation,
    hash,
  }: {
    password: string;
    confirmation: string;
    hash: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    return this.http
      .patch<{ accessToken: string; refreshToken: string; user: User }>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/users/reset-password?hash=${hash}`,
        {
          password,
          confirmation,
        },
      )
      .toPromise();
  }

  activateAccount(
    hash: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return this.http
      .post<{ user: User; accessToken: string; refreshToken: string }>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/users/activate?hash=${hash}`,
        {},
      )
      .toPromise();
  }
}
