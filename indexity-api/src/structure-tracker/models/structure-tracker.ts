import { AnnotationEntity } from '../../annotations/entities/annotation.entity';

export interface StructureTracker {
  annotationId: number;
  annotation: AnnotationEntity;
}
