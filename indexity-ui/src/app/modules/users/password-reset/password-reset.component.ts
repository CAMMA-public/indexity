import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { checkPasswords } from '@app/helpers/user.helpers';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: [
    '../../../core/components/login-form/login-form.component.scss',
    './password-reset.component.scss',
    '../../home/home.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent implements OnInit {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private usersFacade: UsersFacade,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordConfirmation: ['', Validators.required],
      },
      {
        validators: [checkPasswords],
      },
    );
  }

  passwordsDontMatch(): boolean {
    return (
      this.form.controls.password.dirty &&
      this.form.controls.passwordConfirmation.dirty &&
      this.form.hasError('passwordsDontMatch')
    );
  }

  passwordLengthInvalid(): boolean {
    return (
      this.form.controls.password.dirty &&
      this.form.controls.password.hasError('minlength')
    );
  }

  async onPasswordReset(): Promise<void> {
    if (this.form.valid) {
      const payload = {
        password: this.form.controls.password.value,
        confirmation: this.form.controls.passwordConfirmation.value,
        hash: this.route.snapshot.queryParams.hash,
      };

      try {
        const res = await this.auth.resetPassword(payload);
        this.usersFacade.loginSuccess(res.user, res.accessToken);
        this.router.navigate(['/']);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
