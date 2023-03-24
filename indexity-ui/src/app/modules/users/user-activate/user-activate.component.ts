import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersFacade } from '@app/main-store/user/users.facade';

@Component({
  selector: 'app-user-activate',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActivateComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usersFacade: UsersFacade,
  ) {}

  async ngOnInit(): Promise<void> {
    const hash = this.route.snapshot.queryParams.hash;
    if (hash) {
      try {
        const { user, accessToken } = await this.auth.activateAccount(hash);
        this.usersFacade.loginSuccess(user, accessToken);
      } catch (e) {
        console.error(e);
        await this.router.navigate(['/']);
      }
    } else {
      await this.router.navigate(['/']);
    }
  }
}
