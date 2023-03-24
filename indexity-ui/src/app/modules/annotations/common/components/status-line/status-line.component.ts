import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { videoAnnotationProgressStateToLabel } from '@app/annotations/modules/videos/helpers/video.helpers';

@Component({
  selector: 'status-line',
  templateUrl: './status-line.component.html',
  styleUrls: ['./status-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusLineComponent {
  protected editingAnnotationState = false;

  videoAnnotationProgressToLabel = videoAnnotationProgressStateToLabel;
  VIDEO_ANNOTATION_STATE = VIDEO_ANNOTATION_STATE;

  @Input() annotationStates: VIDEO_ANNOTATION_STATE[];
  @Input() authorizedStates: VIDEO_ANNOTATION_STATE[];
  @Input() currentState: VIDEO_ANNOTATION_STATE;

  @Output() annotationStateChange = new EventEmitter<{
    state: VIDEO_ANNOTATION_STATE;
  }>();

  editAnnotationState = (newState: VIDEO_ANNOTATION_STATE): void => {
    if (
      this.editingAnnotationState &&
      this.currentState !== newState &&
      this.authorizedStates.includes(newState)
    ) {
      this.annotationStateChange.emit({ state: newState });
    }
    this.editingAnnotationState = !this.editingAnnotationState;
  };
}
