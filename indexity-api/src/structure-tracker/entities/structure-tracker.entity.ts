import {
  BaseEntity,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { StructureTracker } from '../models/structure-tracker';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'structure-trackers' })
export class StructureTrackerEntity extends BaseEntity
  implements StructureTracker {
  @ApiProperty()
  @PrimaryColumn()
  annotationId: AnnotationEntity['id'];

  @OneToOne(() => AnnotationEntity, { primary: true })
  @JoinColumn()
  annotation: AnnotationEntity;
}
