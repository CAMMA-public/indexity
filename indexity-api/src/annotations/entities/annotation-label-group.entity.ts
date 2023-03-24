import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { AnnotationLabelEntity } from './annotation-label.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoGroupEntity } from '../../videos/entities/video-group.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CleanUserDto } from '../../users/dtos/clean-user.dto';

@Entity()
export class AnnotationLabelGroupEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Index({
    unique: true,
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    type: () => [AnnotationLabelEntity],
  })
  @ManyToMany(
    () => AnnotationLabelEntity,
    label => label.groups,
  )
  labels: AnnotationLabelEntity[];

  @ApiProperty()
  @Column()
  @RelationId('user')
  userId: number;

  @ApiProperty()
  @RelationId('labels')
  labelIds: number[];

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, { eager: true })
  @Transform(user => new CleanUserDto(user.id, user.name))
  user: UserEntity;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    type: () => [VideoGroupEntity],
  })
  @OneToMany(
    () => VideoGroupEntity,
    videoGroup => videoGroup.annotationLabelGroup,
  )
  videoGroups: VideoGroupEntity[];

  @ApiProperty({
    type: () => [Number],
  })
  @RelationId('videoGroups')
  videoGroupIds: number[];
}
