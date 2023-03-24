import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Video,
  VideoStats,
} from '@app/annotations/modules/videos/models/video.model';
import { ConfigurationService } from 'angular-configuration-module';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import {
  VIDEO_ANNOTATION_STATE,
  publicTransitionsFrom,
} from '@app/models/video-annotation-state';

@Component({
  selector: 'app-video-card-item',
  templateUrl: './video-card-item.component.html',
  styleUrls: ['./video-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCardItemComponent {
  protected videoP: Video;
  protected annotationStates = Object.keys(VIDEO_ANNOTATION_STATE);

  @Input() enableGroupManagement = false;
  @Input() groupManagementMode = false;
  @Input() isBookmarked = false;
  @Input() isSelected = false;
  @Input() enableActions = true;
  @Input() enableVideoAccess = true;
  @Input() showStatus = true;
  @Input() showStats = true;
  @Input() displayAdminActions = false;
  @Input() videoStats: VideoStats;
  @Input() videoGroups: VideoGroup[] = [];
  @Input() isVideoOwner = false;

  @ViewChild('noStatsError', { static: true }) noStatsError;

  constructor(private readonly configurationService: ConfigurationService) {}

  @Input()
  set video(val: Video) {
    if (val) {
      this.videoP = {
        ...val,
        thumbnailUrl: val.thumbnailUrl
          ? `${this.configurationService.configuration.apiConfig.baseUrl}/${val.thumbnailUrl}`
          : null,
      };
    }
  }

  get video(): Video {
    return {
      ...this.videoP,
      annotationState:
        !!this.videoP && !!this.videoP.annotationState
          ? this.videoP.annotationState
          : VIDEO_ANNOTATION_STATE.ANNOTATION_NOT_REQUIRED,
    };
  }

  get authorizedStates(): VIDEO_ANNOTATION_STATE[] {
    if (this.isVideoOwner) {
      return [
        VIDEO_ANNOTATION_STATE.ANNOTATION_NOT_REQUIRED,
        VIDEO_ANNOTATION_STATE.ANNOTATION_PENDING,
        VIDEO_ANNOTATION_STATE.ANNOTATING,
        VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED,
      ];
    } else {
      return publicTransitionsFrom[this.video.annotationState];
    }
  }

  @Output() bookmark = new EventEmitter<{
    video: Video;
    bookmarked: boolean;
  }>();
  @Output() rename = new EventEmitter<Video>();
  @Output() remove = new EventEmitter<Video>();
  @Output() removeFromGroup = new EventEmitter<number>();
  @Output() addToGroup = new EventEmitter<number>();
  @Output() annotationStatus = new EventEmitter<{
    videoId: number;
    state: VIDEO_ANNOTATION_STATE;
  }>();
  @Output() retryVideoStats = new EventEmitter<Video>();

  onAnnotationStateChange = ({ state }): void => {
    this.annotationStatus.emit({ videoId: this.videoP.id, state });
  };
}
