import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';
import { PaginatedResponse } from '../models/paginated-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  get apiUrl(): string {
    return `${this.configurationService.configuration.apiConfig.baseUrl}`;
  }

  // tslint:disable-next-line:variable-name
  private _isLoggedIn$ = new BehaviorSubject(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  accessToken: string;
  userID: number;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private readonly configurationService: ConfigurationService,
  ) {
    this.getLocalAccessToken().then((res) =>
      res ? this._isLoggedIn$.next(true) : null,
    );
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ user: User; accessToken: string }> {
    return this.http
      .post<{ user: User; accessToken: string }>(
        `${this.apiUrl}/auth/login`,
        credentials,
      )
      .pipe(
        map((res) => {
          if (!res.user.roles.includes('ADMIN')) {
            throw new Error('User is not an admin');
          } else {
            return res;
          }
        }),
        tap(async (res) => {
          await this.setLocalAccessToken(res.accessToken);
          await this.setLocalUserID(res.user.id);
        }),
        tap((res) =>
          res ? this._isLoggedIn$.next(true) : this._isLoggedIn$.next(false),
        ),
      );
  }

  async logout(): Promise<void> {
    await this.setLocalAccessToken();
    await this.setLocalUserID();
    this._isLoggedIn$.next(false);
  }

  users(): Observable<User[]> {
    return this.http
      .get<PaginatedResponse<User>>(`${this.apiUrl}/admin/users`)
      .pipe(map((res) => res.data));
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/admin/users/${id}`);
  }

  signup(user: User): Observable<{ user: User; accessToken: string }> {
    return this.http.post<{ user: User; accessToken: string }>(
      `${this.apiUrl}/users/annotator`,
      user,
    );
  }

  verify(): Observable<HttpResponse<User>> {
    return this.http.get<User>(`${this.apiUrl}/auth/verify`, {
      observe: 'response',
    });
  }

  async getLocalAccessToken(): Promise<string> {
    if (!this.accessToken) {
      this.accessToken = await this.storage.get('accessToken');
    }
    return this.accessToken;
  }

  async setLocalAccessToken(token?: string): Promise<void> {
    if (token && token.length) {
      await this.storage.set('accessToken', token);
      this.accessToken = token;
      this._isLoggedIn$.next(true);
    } else {
      await this.storage.remove('accessToken');
      this.accessToken = null;
      this._isLoggedIn$.next(false);
    }
  }

  async getLocalUserID(): Promise<number> {
    if (!this.userID) {
      this.userID = await this.storage.get('userID');
    }
    return this.userID;
  }

  async setLocalUserID(userID?: number): Promise<void> {
    if (userID) {
      await this.storage.set('userID', userID);
      this.userID = userID;
    } else {
      await this.storage.remove('userID');
      this.userID = null;
    }
  }

  requestReset(email: string): Promise<{ email: string }> {
    return this.http
      .post<{ email: string }>(`${this.apiUrl}/users/reset-password`, { email })
      .toPromise();
  }

  verifyPasswordResetHash(hash: string): Promise<void> {
    return this.http
      .head<void>(`${this.apiUrl}/users/password-reset-hash/${hash}`)
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
        `${this.apiUrl}/users/reset-password?hash=${hash}`,
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
        `${this.apiUrl}/users/activate?hash=${hash}`,
        {},
      )
      .toPromise();
  }
}
