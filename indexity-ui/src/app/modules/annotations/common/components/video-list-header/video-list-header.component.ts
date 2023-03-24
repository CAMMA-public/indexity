import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import { VideosFilter } from '@app/annotations/models/videos-filter.model';

@Component({
  selector: 'app-video-list-header',
  templateUrl: './video-list-header.component.html',
  styleUrls: ['./video-list-header.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoListHeaderComponent {
  @Input() canManageVideos = false;
  @Input() inProgress = false;
  @Input() currentFilter: VideosFilter;
  @Input() labels: AnnotationLabel[];

  @Output() filter = new EventEmitter<VideosFilter>();
  @Output() upload = new EventEmitter<FormData>();
  @Output() switchListMode = new EventEmitter();

  onFilesChange(event): void {
    const files = event.target.files;
    const formData: FormData = new FormData();
    Object.keys(files).map((key) => {
      formData.append('files', files[key], files[key].name);
    });
    this.upload.emit(formData);
  }

  onFilter(filter: VideosFilter): void {
    this.filter.emit(filter);
  }
}
