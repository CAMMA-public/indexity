import {
  Entity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  RelationId,
} from 'typeorm';
import { IsInt } from 'class-validator';
import { VideoEntity } from './video.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';
import { Transform } from 'class-transformer';
import { CleanUserDto } from '../../users/dtos/clean-user.dto';

@Entity({ name: 'video-chunks' })
export class VideoChunkEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id?: number;
  @ApiProperty()
  @IsInt({ always: true })
  @Column()
  startTime: number;
  @ApiProperty()
  @IsInt({ always: true })
  @Column()
  duration: number;
  @CreateDateColumn()
  createdAt?: Date;
  @Column({ default: '' })
  zipFile: string;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ApiProperty({
    type: () => VideoEntity,
  })
  @ManyToOne(
    () => VideoEntity,
    video => video.chunkVideo,
  )
  video?: VideoEntity;
  @ApiProperty()
  @RelationId((chunk: VideoChunkEntity) => chunk.video)
  @Column()
  videoId: number;

  @ManyToOne(
    () => UserEntity,
    user => user.chunkVideos,
  )
  @Transform(user => new CleanUserDto(user.id, user.name))
  user?: UserEntity;

  @ApiProperty()
  @RelationId((VideoChunk: VideoChunkEntity) => VideoChunk.user)
  @Column({ nullable: true })
  userId: number;
}
