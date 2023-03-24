import { Video } from '@app/annotations/modules/videos/models/video.model';
import { GenericGroup } from '@app/annotations/models/generic-group.model';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';

export interface VideoGroup extends GenericGroup {
  videoIds?: number[];
  videos?: Video[];
  annotationLabelGroupId?: number;
  annotationLabelGroup?: AnnotationLabelGroup;
  allowedUserIds?: number[];
}
