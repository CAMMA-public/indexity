import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { User } from '@app/models/user';

export interface Video {
  id?: number;
  name: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  userId?: number;
  user?: User;
  annotationState?: VIDEO_ANNOTATION_STATE;
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
