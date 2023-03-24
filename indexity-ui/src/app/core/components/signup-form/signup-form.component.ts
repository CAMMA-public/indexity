import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserSignupDto } from '../../models/user';
import { checkPasswords } from '../../helpers/user.helpers';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['../login-form/login-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('EnterLeave', [
      transition(':enter', [style({ opacity: 0 }), animate('0.3s ease-in')]),
    ]),
  ],
})
export class SignupFormComponent implements OnInit {
  form: FormGroup;

  @Input() locked = false;
  @Input() error: string = null;

  @Output() formSubmit = new EventEmitter<UserSignupDto>();

  constructor(
    @Optional() public dialogRef: MatDialogRef<SignupFormComponent>,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
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

  submitForm(obj: UserSignupDto): void {
    if (obj && obj.email && obj.password && obj.passwordConfirmation) {
      this.formSubmit.emit(obj);
    }
  }
}
