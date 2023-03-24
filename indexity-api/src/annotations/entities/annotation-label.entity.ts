import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import {
  IsHexColor,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ValidationGroups } from '../../common/enums/validation-groups.enum';
import { AnnotationLabelGroupEntity } from './annotation-label-group.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'annotation-labels' })
export class AnnotationLabelEntity {
  @ApiProperty()
  @IsString({ always: true })
  @Matches(/[a-z0-9]+(_[a-z0-9]+)*/) // Snake case
  @IsNotEmpty({ always: true })
  @PrimaryColumn()
  name: string;

  @ApiProperty()
  @IsOptional({ groups: [ValidationGroups.UPDATE] })
  @IsHexColor({ always: true })
  @Column()
  color: string;

  @ApiProperty({
    type: () => [AnnotationLabelGroupEntity],
  })
  @ManyToMany(
    () => AnnotationLabelGroupEntity,
    group => group.labels,
  )
  @JoinTable()
  groups: AnnotationLabelGroupEntity[];

  @ApiProperty({
    enum: ['action', 'event', 'phase', 'structure'],
  })
  @Column({
    nullable: true,
    default: 'structure',
  })
  @Index()
  @IsIn(['action', 'event', 'phase', 'structure'], {
    message: 'Invalid label type',
    always: true,
  })
  type: 'action' | 'event' | 'phase' | 'structure';
}
