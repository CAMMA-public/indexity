import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/services/auth.service';
import { UserActivateComponent } from './user-activate/user-activate.component';
import { ResetPasswordGuard } from '@app/views/users/guards/reset-password.guard';
import { UsersRoutingModule } from '@app/views/users/users-routing.module';
import { PasswordResetComponent } from '@app/views/users/password-reset/password-reset.component';
import { MaterialCustomModule } from '@app/modules';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialCustomModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule,
  ],
  declarations: [PasswordResetComponent, UserActivateComponent],
  providers: [AuthService, ResetPasswordGuard],
})
export class UsersModule {}
