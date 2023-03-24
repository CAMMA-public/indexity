import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
  TableInheritance,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { GenericEntity } from '../../common/entities/generic.entity';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { VideoGroupEntity } from './video-group.entity';
import { MediaResolution } from '../interfaces/media-resolution.interface';
import { STANDARD_RESOLUTIONS } from '../constants';
import { Expose, Transform } from 'class-transformer';
import { basename, extname } from 'path';
import { ApiProperty } from '@nestjs/swagger';
import { VideoChunkEntity } from './chunked-video.entity';
import { AnnotationStates } from '../annotation-states';
import { CleanUserDto } from '../../users/dtos/clean-user.dto';

@Entity({ name: 'videos' })
@TableInheritance({
  column: {
    type: 'boolean',
    name: 'isOriginal',
  },
})
export class VideoEntity extends GenericEntity implements MediaResolution {
  @ApiProperty()
  @Column({
    default: '',
  })
  url: string;

  @ApiProperty()
  @Column({
    default: '',
    nullable: true,
  })
  description?: string;

  @ApiProperty()
  @Index()
  @Column({
    default: 'unknown',
  })
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  fileName: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  thumbnailUrl: string;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(
    () => UserEntity,
    user => user.videos,
  )
  @Transform(user => new CleanUserDto(user.id, user.name))
  user?: UserEntity;

  @ApiProperty()
  @RelationId((v: VideoEntity) => v.user)
  @Column()
  userId?: number;

  @ApiProperty({
    type: () => [AnnotationEntity],
  })
  @OneToMany(
    () => AnnotationEntity,
    annotation => annotation.video,
  )
  annotations?: AnnotationEntity[];

  @ManyToMany(
    () => UserEntity,
    user => user.videoBookmarks,
    {
      onDelete: 'CASCADE',
    },
  )
  users?: UserEntity[];

  @ApiProperty({
    enum: [
      'ANNOTATION_PENDING',
      'ANNOTATING',
      'ANNOTATION_FINISHED',
      'ANNOTATION_NOT_REQUIRED',
    ],
  })
  @Column({
    enum: AnnotationStates,
    nullable: false,
    default: 'ANNOTATION_NOT_REQUIRED',
  })
  annotationState?: AnnotationStates;

  @ApiProperty({
    type: () => [VideoChunkEntity],
  })
  @OneToMany(
    () => VideoChunkEntity,
    videoChunk => videoChunk.video,
  )
  chunkVideo: VideoChunkEntity[];

  @ApiProperty({
    type: () => [Number],
  })
  @RelationId('groups')
  groupIds: number[];

  @ApiProperty({
    type: () => [VideoGroupEntity],
  })
  @ManyToMany(
    () => VideoGroupEntity,
    group => group.videos,
  )
  @JoinTable({
    name: 'video-group-joins',
    joinColumn: { referencedColumnName: 'id', name: 'videoId' },
    inverseJoinColumn: { referencedColumnName: 'id', name: 'groupId' },
  })
  groups: VideoGroupEntity[];

  @ApiProperty()
  @Column()
  isOriginal: boolean;
  @ApiProperty()
  @Column()
  height: number;

  @ApiProperty()
  @Column()
  width: number;

  @ApiProperty({
    type: () => VideoEntity,
  })
  @ManyToOne(
    () => VideoEntity,
    video => video.children,
    {
      onDelete: 'CASCADE',
    },
  )
  parent: VideoEntity;

  @ApiProperty()
  @Column()
  @RelationId('parent')
  parentId: number;

  @ApiProperty({
    type: () => [VideoEntity],
  })
  @OneToMany(
    () => VideoEntity,
    video => video.parent,
  )
  children: VideoEntity[];

  @ApiProperty({
    type: () => [Number],
  })
  @RelationId('children')
  childrenIds: number[];

  @Expose()
  get format(): string {
    const standardRes = STANDARD_RESOLUTIONS.find(
      res => this.width === res.width && this.height === res.height,
    );
    return 'object' === typeof standardRes ? standardRes.name : 'custom';
  }

  get extendedName(): string {
    return `${basename(this.name, extname(this.name))}.${this.width}x${
      this.height
    }.${extname(this.name)}`;
  }
}
