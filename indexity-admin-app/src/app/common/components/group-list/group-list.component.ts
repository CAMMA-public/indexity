import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { VideoGroup } from '../../models/video-groups.model';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupListComponent {
  @Input() groups: VideoGroup[] = [];

  trackByFn = (i, g: VideoGroup): number => g.id;
}
