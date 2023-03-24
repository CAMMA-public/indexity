import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { GenericEntity } from '../../common/entities/generic.entity';
import { VideoEntity } from './video.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AnnotationLabelGroupEntity } from '../../annotations/entities/annotation-label-group.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CleanUserDto } from '../../users/dtos/clean-user.dto';

@Entity({ name: 'video-groups' })
export class VideoGroupEntity extends GenericEntity {
  @ApiProperty()
  @Index()
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column({ default: '' })
  description: string;

  @ApiProperty({
    type: () => [Number],
  })
  @RelationId('videos')
  videoIds: number[];

  @ApiProperty({
    type: () => [VideoEntity],
  })
  @ManyToMany(
    () => VideoEntity,
    video => video.groups,
  )
  @JoinTable({
    name: 'video-group-joins',
    joinColumn: { referencedColumnName: 'id', name: 'groupId' },
    inverseJoinColumn: { referencedColumnName: 'id', name: 'videoId' },
  })
  videos: VideoEntity[];

  @ApiProperty()
  @Column()
  @RelationId('user')
  userId: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, { eager: true })
  @Transform(user => new CleanUserDto(user.id, user.name))
  user: UserEntity;

  @ApiProperty({
    type: () => AnnotationLabelGroupEntity,
  })
  @ManyToOne(
    () => AnnotationLabelGroupEntity,
    labelGroup => labelGroup.videoGroups,
    { eager: true },
  )
  annotationLabelGroup: AnnotationLabelGroupEntity;

  @ApiProperty()
  @Column({ nullable: true })
  @RelationId('annotationLabelGroup')
  annotationLabelGroupId: number;

  // users with access to the video group
  @ApiProperty({
    type: () => [Number],
  })
  @RelationId('allowedUsers')
  allowedUserIds?: number[];

  @ApiProperty({
    type: () => [UserEntity],
  })
  @ManyToMany(
    () => UserEntity,
    user => user.accessibleVideoGroups,
  )
  @JoinTable({
    name: 'user_video-group',
    joinColumn: { referencedColumnName: 'id', name: 'videoGroupId' },
    inverseJoinColumn: { referencedColumnName: 'id', name: 'userId' },
  })
  allowedUsers?: UserEntity[];
}
