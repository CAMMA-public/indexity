import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@app/services/auth.service';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<UrlTree | boolean> {
    const hash = next.queryParams.hash;

    if (!hash) {
      return this.router.createUrlTree(['/home']);
    } else {
      return this.authService
        .verifyPasswordResetHash(hash)
        .then(() => true)
        .catch(() => this.router.createUrlTree(['/home']));
    }
  }
}
