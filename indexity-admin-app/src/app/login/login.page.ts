import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../common/services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastController,
  ) {}

  async onLogin(): Promise<void> {
    if (this.form.valid) {
      try {
        await this.auth.login(this.form.value).toPromise();
        await this.router.navigate(['/users']);
      } catch (e) {
        const toast = await this.toast.create({
          message: 'Wrong password/email',
          color: 'warning',
          duration: 2000,
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
            },
          ],
        });

        toast.present();
      }
    }
  }
}
