import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PasswordResetComponent } from '@app/views/users/password-reset/password-reset.component';
import { ResetPasswordGuard } from '@app/views/users/guards/reset-password.guard';
import { UserActivateComponent } from '@app/views/users/user-activate/user-activate.component';

const ROUTES: Route[] = [
  {
    path: 'password-reset',
    component: PasswordResetComponent,
    canActivate: [ResetPasswordGuard],
  },
  {
    path: 'activate',
    component: UserActivateComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
