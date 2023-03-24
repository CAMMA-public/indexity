import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';

@Component({
  selector: 'app-video-group-item',
  templateUrl: './video-group-item.component.html',
  styleUrls: ['./video-group-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGroupItemComponent {
  @Input() videoGroup: VideoGroup;
  @Input() videosCount = 0;
  @Input() usersCount = 0;
  @Input() isSelected = false;
  @Input() displayAdminActions = false;
  @Input() enableGroupPermissions = true;
  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() editUsers = new EventEmitter<number>();
  @Output() labelGroupClick = new EventEmitter<AnnotationLabelGroup>();

  onLabelGroupClick(e: Event, g: AnnotationLabelGroup): void {
    e.preventDefault();
    e.stopPropagation();
    this.labelGroupClick.emit(g);
  }
}
