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

import { UserLoginDto } from '../../models/user';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('EnterLeave', [
      transition(':enter', [style({ opacity: 0 }), animate('0.3s ease-in')]),
    ]),
  ],
})
export class LoginFormComponent implements OnInit {
  form: FormGroup;

  @Input() locked = false;
  @Input() error: string = null;

  @Output() formSubmit = new EventEmitter<UserLoginDto>();

  constructor(
    @Optional() public dialogRef: MatDialogRef<LoginFormComponent>,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submitForm(obj: UserLoginDto): void {
    if (obj && obj.email && obj.password) {
      this.formSubmit.emit(obj);
    }
  }
}
