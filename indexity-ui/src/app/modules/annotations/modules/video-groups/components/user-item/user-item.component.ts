import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { User } from '@app/models/user';
import { userIsMod } from '@app/helpers/user.helpers';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserItemComponent {
  @Input() user: User;
  @Input() isInGroup = false;

  userIsMod = userIsMod;

  @Output() addToGroup = new EventEmitter<number>();
  @Output() removeFromGroup = new EventEmitter<number>();
}
