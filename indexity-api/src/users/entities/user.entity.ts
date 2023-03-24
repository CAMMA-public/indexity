import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { IsArray, IsEmail, IsString, MinLength } from 'class-validator';
import { USER_ROLE } from '../models/user-roles';
import { VideoEntity } from '../../videos/entities/video.entity';
import { User } from '../models/user';
import { Exclude, Transform } from 'class-transformer';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { ApiProperty } from '@nestjs/swagger';
import { VideoChunkEntity } from '../../videos/entities/chunked-video.entity';
import { VideoGroupEntity } from '../../videos/entities/video-group.entity';

const PASSWORD_MIN_LENGTH = 7;

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity implements User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString()
  @Index()
  @Column()
  name: string;

  @ApiProperty()
  @Index({ unique: true })
  @IsEmail()
  @Index()
  @Column({
    unique: true,
  })
  email: string;

  @Exclude()
  @Column()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;

  @ApiProperty({
    enum: ['ADMIN', 'ANNOTATOR', 'MODERATOR'],
    isArray: true,
  })
  @IsArray()
  @Column({ type: 'text', array: true })
  roles: USER_ROLE[];

  @Exclude()
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  @Transform(ip => (ip.substr(0, 7) === '::ffff:' ? ip.substr(7) : ip))
  @Column({
    default: '',
  })
  ipAddress: string;

  @ApiProperty({
    type: () => [AnnotationEntity],
  })
  @OneToMany(
    () => AnnotationEntity,
    annotation => annotation.user,
  )
  annotations?: AnnotationEntity[];

  @ApiProperty({
    type: () => [VideoChunkEntity],
  })
  @OneToMany(
    () => VideoChunkEntity,
    Videochunk => Videochunk.user,
  )
  chunkVideos?: VideoChunkEntity[];

  @ApiProperty({
    type: () => [VideoEntity],
  })
  @OneToMany(
    () => VideoEntity,
    video => video.user,
  )
  videos?;

  @ManyToMany(
    () => VideoEntity,
    video => video.users,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinTable()
  videoBookmarks?: VideoEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    default: null,
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt: Date;

  @Column({ default: false })
  isActivated: boolean;

  // video groups the user has created
  @ApiProperty({
    type: () => [VideoGroupEntity],
  })
  @OneToMany(
    () => VideoGroupEntity,
    videoGroup => videoGroup.user,
  )
  videoGroups?: VideoGroupEntity[];

  // video groups the user has access to
  @ApiProperty({
    type: () => [Number],
  })
  @RelationId('accessibleVideoGroups')
  accessibleVideoGroupIds?: number[];

  @ApiProperty({
    type: () => [VideoGroupEntity],
  })
  @ManyToMany(
    () => VideoGroupEntity,
    group => group.allowedUsers,
  )
  accessibleVideoGroups?: VideoGroupEntity[];
}
