import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { GuardsCheckEnd, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogComponent } from '../../core/components/auth-dialog/auth-dialog.component';
import { isSignupPayload } from '@app/helpers/user.helpers';
import { combineLatest, Subscription } from 'rxjs';
import { UserLoginDto, UserSignupDto } from '@app/models/user';
import { InfoMessageService } from '@app/services/info-message.service';
import { InfoDialogComponent } from '../../core/components/info-dialog/info-dialog.component';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  formType: 'login' | 'signup' = 'login';
  isLoading$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationStart || e instanceof GuardsCheckEnd),
    map((e) => e instanceof NavigationStart),
  );

  subscriptions: Subscription[] = [];
  dialogRef = null;

  constructor(
    private usersFacade: UsersFacade,
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthService,
    private infoMessageService: InfoMessageService,
  ) {}

  ngOnInit(): void {
    const signupSub = combineLatest([
      this.usersFacade.signupError$,
      this.usersFacade.getSignupAttempts$,
    ]).subscribe(([error, _]) => {
      if (this.dialogRef !== null) {
        if (error === null) {
          this.dialogRef.close();
        } else {
          this.disableSubmit();
          this.dialogRef.componentInstance.updateSignupError(error);
        }
      }
    });
    const loginSub = combineLatest([
      this.usersFacade.loginError$,
      this.usersFacade.getLoginAttempts$,
    ]).subscribe(([error]) => {
      if (this.dialogRef !== null) {
        if (error === null) {
          this.dialogRef.close();
        } else {
          this.disableSubmit();
          this.dialogRef.componentInstance.updateLoginError(error);
        }
      }
    });
    const dialogSub = this.infoMessageService.dialogMessage$.subscribe(
      ({ title, message }) => {
        this.dialog.open(InfoDialogComponent, { data: { title, message } });
      },
    );
    this.subscriptions.push(signupSub, loginSub, dialogSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.map((sub) => sub.unsubscribe());
  }

  disableSubmit(): void {
    this.dialogRef.componentInstance.lockForm(true);
    setTimeout(() => {
      this.dialogRef.componentInstance.lockForm(false);
    }, 500);
  }

  onLoginDialog(type: 'login' | 'signup' = 'login'): void {
    this.dialogRef = this.dialog.open(AuthDialogComponent, {
      width: '600px',
      panelClass: 'br-20',
      data: {
        type,
      },
    });

    const formSubmitSub = this.dialogRef.componentInstance.formSubmit.subscribe(
      (res) => this.signupOrLogin(res),
    );

    const passwordResetSub = this.dialogRef.componentInstance.passwordReset.subscribe(
      async (email) => {
        await this.auth.requestReset(email);
        this.dialogRef.close();
        this.infoMessageService.setDialog(
          'Password reset email sent',
          "You'll receive instructions to reset your password on your email.",
        );
      },
    );

    this.subscriptions.push(formSubmitSub, passwordResetSub);
  }

  signupOrLogin(formData: UserSignupDto | UserLoginDto): void {
    if (isSignupPayload(formData)) {
      this.usersFacade.signup(formData);
    } else {
      this.usersFacade.login(formData);
    }
  }

  // onImageClick(src: string) {
  //
  //   this.lightBox.open([{src, caption: '', thumb: src}], 0);
  //
  // }

  toggleForm(): void {
    this.formType = this.formType === 'login' ? 'signup' : 'login';
  }
}
