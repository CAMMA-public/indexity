import { User } from './user';
import { VIDEO_ANNOTATION_STATE } from './video-annotation-state';
import { AnnotationLabel } from './annotation-label.model';

export interface Video {
  id?: number;
  name: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  userId?: number;
  user?: User;
  videoAnnotationState?: VIDEO_ANNOTATION_STATE;
  stats?: VideoStats;
  createdAt?: string;
  updatedAt?: string;
  groupIds?: number[];
}

export interface VideoStats {
  videoId: number;
  groupIds: number[];
  annotationLabels: AnnotationLabel[];
  annotationsCount: number;
  users: User[];
}
