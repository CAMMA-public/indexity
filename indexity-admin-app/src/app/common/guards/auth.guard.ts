import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const accessToken = await this.authService.getLocalAccessToken();

    if (!accessToken) {
      return this.router.createUrlTree(['/login']);
    }

    try {
      await this.authService.verify().toPromise();
      return true;
    } catch (e) {
      return this.router.createUrlTree(['/login']);
    }
  }

  async canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const accessToken = this.authService.getLocalAccessToken();

    if (!accessToken) {
      return this.router.createUrlTree(['/login']);
    }

    try {
      await this.authService.verify().toPromise();
      return true;
    } catch (e) {
      await this.authService.setLocalAccessToken();
      return this.router.createUrlTree(['/login']);
    }
  }
}
