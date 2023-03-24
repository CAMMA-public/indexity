import { HttpService, Injectable } from '@nestjs/common';
import { config } from '../config';

@Injectable()
export class UserService {
  private _token: string = null;

  constructor(private readonly http: HttpService) {}

  async getToken(): Promise<string> {
    return this._token || (await this.authUser());
  }

  private async authUser(): Promise<string> {
    this._token = await this.http
      .post(`${config.indexityApiUrl}/auth/login`, {
        email: config.annotatorEmail,
        password: config.annotatorPassword,
      })
      .toPromise()
      .then(res => res.data.accessToken)
      .catch(err => {
        throw new Error(`Impossible to retrieve token: ${err}`);
      });

    return this._token;
  }
}
