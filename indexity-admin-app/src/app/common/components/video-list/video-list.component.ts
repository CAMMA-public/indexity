import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Video } from '../../models/video.model';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoListComponent {
  @Input() videos: Video[] = [];

  trackByFn = (i: number, v: Video): number => v.id;
}
