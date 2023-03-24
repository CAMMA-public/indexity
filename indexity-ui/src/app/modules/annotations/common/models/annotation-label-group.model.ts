import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';
import { GenericGroup } from '@app/annotations/models/generic-group.model';
import { VideoGroup } from '@app/annotations/models/video-group.model';

export interface AnnotationLabelGroup extends GenericGroup {
  labelIds: string[];
  labels?: AnnotationLabel[];
  videoGroupIds?: number[];
  videoGroups?: VideoGroup[];
}
