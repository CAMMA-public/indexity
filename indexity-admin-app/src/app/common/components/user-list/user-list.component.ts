import { Component, Input } from '@angular/core';
import { User } from '../../models/user';
import { FilterListComponent } from '../../models/list-component';
import { byEmailOrName } from '../../helpers';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements FilterListComponent<User> {
  @Input() collection: User[] = [];
  filteredCollection: User[] = [];
  isFiltering = false;
  currentUserID = 0;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    this.authService.getLocalUserID().then((userID) => {
      this.currentUserID = userID;
    });
  }

  trackByFn = (i, u: User): number => u.id;

  filterCollection(q?: string): void {
    if (q && q.length) {
      this.isFiltering = true;
      this.filteredCollection = this.collection.filter(byEmailOrName(q));
    } else {
      this.isFiltering = false;
    }
  }

  async toggleActivateUser(user: User): Promise<void> {
    await this.usersService.activateUser(user.id, !user.isActivated);
    // TODO: improve update of the component in a cleaner way
    location.reload();
  }
}
