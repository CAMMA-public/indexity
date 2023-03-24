import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../common/services/auth.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage {
  searchControl = new FormControl();
  users$ = this.users.users();
  constructor(private users: AuthService) {}
}
