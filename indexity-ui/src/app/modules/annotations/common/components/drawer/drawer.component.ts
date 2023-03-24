import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  @Input() isSideNavOpen = false;
  @Input() currentUsername = '';
  @Output() sideNavClose = new EventEmitter();
  @Output() openSettings = new EventEmitter<void>();
  @Output() openHelp = new EventEmitter<void>();
  @Output() openAbout = new EventEmitter<void>();
  @Output() logout = new EventEmitter();
}
