import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { User } from '../models/user';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  redirectUrl;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersFacade: UsersFacade,
    private jwt: JwtHelperService,
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const accessToken = this.authService.getLocalAccessToken();

    if (!accessToken) {
      this.redirectUrl = state.url;
      this.router.navigate(['/']);
      return false;
    }

    try {
      await this.authService.verify().toPromise();
      if (this.redirectUrl) {
        this.router.navigateByUrl(this.redirectUrl);
        this.redirectUrl = undefined;
      }
      return true;
    } catch (e) {
      this.redirectUrl = state.url;
      this.router.navigate(['/']);
      return false;
    }
  }

  async canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const accessToken = this.authService.getLocalAccessToken();

    if (!accessToken) {
      this.redirectUrl = state ? state.url : undefined;
      this.router.navigate(['/']);
      return false;
    }

    try {
      const res = await this.authService.verify().toPromise();
      this.usersFacade.setCurrentUser({
        user: res.body as User,
        token: this.jwt.tokenGetter(),
      });
      if (this.redirectUrl) {
        this.router.navigateByUrl(this.redirectUrl);
        this.redirectUrl = undefined;
      }
      return true;
    } catch (e) {
      this.authService.setLocalAccessToken();
      this.redirectUrl = state.url;
      this.router.navigate(['/']);
      return false;
    }
  }
}
