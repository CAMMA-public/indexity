import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  Optional,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { UserLoginDto, UserSignupDto } from '@app/models/user';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: [
    './auth-dialog.component.scss',
    '../login-form/login-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthDialogComponent {
  formType: 'login' | 'signup' | 'passwordReset' = this.data.type;

  emailControl = new FormControl('', [Validators.email]);

  signupError: string;
  loginError: string;
  formLocked = false;

  @Output() formSubmit = new EventEmitter<UserSignupDto | UserLoginDto>();
  @Output() passwordReset = new EventEmitter<string>();

  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { type: 'login' | 'signup' } = { type: 'login' },
    private cd: ChangeDetectorRef,
  ) {}

  updateSignupError(error: string): void {
    this.signupError = error;
    this.cd.detectChanges();
  }

  updateLoginError(error: string): void {
    this.loginError = error;
    this.cd.detectChanges();
  }

  lockForm(bool: boolean): void {
    this.formLocked = bool;
    this.cd.detectChanges();
  }

  toggleForm(formType?: 'login' | 'signup' | 'passwordReset'): void {
    this.formType = formType
      ? formType
      : this.formType === 'login'
      ? 'signup'
      : 'login';
  }

  async onRequestPasswordReset(): Promise<void> {
    if (this.emailControl.valid) {
      this.passwordReset.emit(this.emailControl.value);
    }
  }
}
