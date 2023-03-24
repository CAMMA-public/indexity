import { VIDEO_ANNOTATION_STATE } from './video-annotation-state';

export interface VideoAnnotationState {
  videoId: number;
  state: VIDEO_ANNOTATION_STATE;
  id?: number;
}
