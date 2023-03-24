import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { VideoGroup } from '@app/annotations/models/video-group.model';

@Component({
  selector: 'app-video-group-toolbar',
  templateUrl: './video-group-toolbar.component.html',
  styleUrls: ['./video-group-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGroupToolbarComponent {
  @Input() videoGroup: VideoGroup;
  @Input() uploading = false;
  @Input() canManageGroup: boolean;

  @Output() edit = new EventEmitter<VideoGroup>();
  @Output() uploadToGroup = new EventEmitter<FormData>();
  @Output() back = new EventEmitter<void>();
}
