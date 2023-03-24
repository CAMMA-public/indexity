import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, USER_ROLE, UserStats } from '../../common/models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { UsersService } from '../../common/services/users.service';
import { UserStatsService } from '../../common/services/user-stats.service';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
})
export class UserViewComponent implements OnInit {
  reloader$ = new BehaviorSubject(null);
  user$: Observable<User>;
  userStats$: Observable<UserStats>;

  user: User;
  currentUserId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private usersService: UsersService,
    private userStats: UserStatsService,
    public alertController: AlertController,
  ) {}

  ngOnInit(): void {
    this.user$ = this.reloader$.asObservable().pipe(
      startWith(null),
      switchMap(() => this.route.params),
      map((params) => +params.id),
      switchMap((id) => this.auth.getUser(id)),
      tap((u) => (this.user = u)),
    );

    this.userStats$ = this.user$.pipe(
      switchMap((user) => this.userStats.getUserStats(user.id)),
    );

    this.auth.getLocalUserID().then((userID) => {
      this.currentUserId = userID;
    });
  }

  async activateUser(user: User, isActivated: boolean): Promise<void> {
    await this.usersService.activateUser(user.id, isActivated);
    this.reloader$.next(null);
  }

  async promoteUser(user: User, isPromoted: boolean): Promise<void> {
    if (isPromoted) {
      await this.usersService.promoteToAdmin(user);
    } else {
      await this.usersService.demoteUser(user);
    }
    this.reloader$.next(null);
  }

  async editUser(user: User): Promise<void> {
    try {
      this.user = await this.usersService.updateUser(user);
      this.reloader$.next(null);
    } catch (err) {
      this.showDialog(
        false,
        `Could not update user information (${err.status})`,
      );
    }
  }

  async editRole(user: User, role: USER_ROLE): Promise<void> {
    try {
      if (user.roles.includes(role)) {
        await this.usersService.updateUser({
          id: user.id,
          roles: user.roles.filter((r) => r !== role),
        });
      } else {
        await this.usersService.updateUser({
          id: user.id,
          roles: [...user.roles, role],
        });
      }

      this.reloader$.next(null);
    } catch (err) {
      this.showDialog(false, `Could not update user roles (${err.status})`);
    }
  }

  sendActivationEmail(userId: number): void {
    try {
      this.usersService.sendActivationEmail(userId);
      this.showDialog(true, `Activation email sent`);
    } catch (err) {
      this.showDialog(false, `Could not send activation email (${err.status})`);
    }
  }

  sendPasswordResetEmail(userId: number): void {
    try {
      this.usersService.sendPasswordResetEmail(userId);
      this.showDialog(true, 'Password reset email sent');
    } catch (err) {
      this.showDialog(
        false,
        `Could not send password reset email (${err.status})`,
      );
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await this.usersService.deleteUser(userId);
      await this.router.navigate(['/users']);
    } catch (err) {
      this.showDialog(false, `Could not delete user (${err.status})`);
    }
  }

  async updatePassword({
    user,
    password,
    passwordConfirmation,
  }): Promise<void> {
    if (password === passwordConfirmation) {
      try {
        await this.usersService.updatePassword(user, password);
      } catch (err) {
        this.showDialog(false, `Could not update password (${err.status})`);
      }
    } else {
      this.showDialog(false, "Password don't match");
    }
  }

  async showDialog(success: boolean, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: success ? 'Success' : 'Error',
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
