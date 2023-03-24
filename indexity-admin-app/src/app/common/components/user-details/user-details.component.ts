import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { User, USER_ROLE, UserStats } from '../../models/user';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { userIsAdmin, userIsAnnotator, userIsMod } from '../../helpers';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  @Input() user: User;
  @Input() userStats: UserStats;
  @Input() canEdit = false;

  @Output() activate = new EventEmitter<{ user: User; isActivated: boolean }>();
  @Output() editRole = new EventEmitter<{ user: User; role: USER_ROLE }>();
  @Output() edit = new EventEmitter<User>();
  @Output() updatePassword = new EventEmitter<{
    user: User;
    password: string;
    passwordConfirmation: string;
  }>();
  @Output() sendActivationEmail = new EventEmitter<number>();
  @Output() sendPasswordResetEmail = new EventEmitter<number>();
  @Output() deleteUser = new EventEmitter<number>();

  actionSheet;

  USER_ROLE = USER_ROLE;
  userIsAdmin = userIsAdmin;
  userIsMod = userIsMod;
  userIsAnnotator = userIsAnnotator;

  constructor(
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
  ) {}

  async onMoreOptions(): Promise<void> {
    if (this.user) {
      this.actionSheet = await this.actionSheetController.create({
        header: 'Dangerous user actions',
        buttons: [
          {
            text: this.user.isActivated
              ? 'Deactivate account'
              : 'Activate account',
            icon: 'checkmark-circle-outline',
            handler: () => {
              this.activate.emit({
                user: this.user,
                isActivated: !this.user.isActivated,
              });
            },
          },
          {
            text: 'Delete',
            icon: 'trash',
            handler: () => {
              this.deleteConfirmationDialog();
            },
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
          },
        ],
      });
      this.actionSheet.present();
    }
  }

  async deleteConfirmationDialog(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Do you really want to delete this user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteUser.emit(this.user.id);
          },
        },
      ],
    });

    await alert.present();
  }

  async presentUpdatePasswordDialog(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Set new user password',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'New password...',
        },
        {
          name: 'passwordConfirmation',
          type: 'password',
          placeholder: 'Confirm password...',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Update',
          cssClass: 'danger',
          handler: (e) => {
            this.updatePassword.emit({ user: this.user, ...e });
          },
        },
      ],
    });

    await alert.present();
  }

  async presentUpdateUserDialog(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Update user information',
      inputs: [
        {
          name: 'name',
          value: this.user.name,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Update',
          cssClass: 'danger',
          handler: (e) => {
            this.edit.emit({ ...this.user, ...e });
          },
        },
      ],
    });

    await alert.present();
  }
}
