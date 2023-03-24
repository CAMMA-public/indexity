import { VIDEO_ANNOTATION_STATE } from './video-annotation-state';

export interface UserVideoAnnotationState {
  userId?: number;
  videoId: number;
  state: VIDEO_ANNOTATION_STATE;
  id?: number;
}
