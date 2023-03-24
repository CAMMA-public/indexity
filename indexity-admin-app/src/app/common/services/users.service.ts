import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  get apiUrl(): string {
    return `${this.configurationService.configuration.apiConfig.baseUrl}/admin/users`;
  }

  constructor(
    private http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {}

  activateUser(id: number, isActivated = true): Promise<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/${id}`, { isActivated })
      .toPromise();
  }

  deleteUser(userId: number): Promise<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}`).toPromise();
  }

  sendActivationEmail(userId: number): Promise<void> {
    return this.http
      .post<void>(`${this.apiUrl}/${userId}/send-activation-email`, {})
      .toPromise();
  }

  sendPasswordResetEmail(userId: number): Promise<void> {
    return this.http
      .post<void>(`${this.apiUrl}/${userId}/send-password-reset-email`, {})
      .toPromise();
  }

  updateUser(user: Partial<User>): Promise<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/${user.id}`, { ...user })
      .toPromise();
  }

  promoteToMod(user: Partial<User>): Promise<User> {
    return this.http
      .post<User>(`${this.apiUrl}/promote`, {
        email: user.email,
        role: 'MODERATOR',
      })
      .toPromise();
  }

  promoteToAdmin(user: Partial<User>): Promise<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/${user.id}/promote`, { role: 'ADMIN' })
      .toPromise();
  }

  demoteUser(user: Partial<User>): Promise<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/${user.id}/demote`, {})
      .toPromise();
  }

  updatePassword(user: User, password: string): Promise<User> {
    return this.http
      .post<User>(`${this.apiUrl}/reset-password`, {
        email: user.email,
        password,
      })
      .toPromise();
  }
}
