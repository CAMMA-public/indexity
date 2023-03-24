import { Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { VideoEntity } from './video.entity';
import { VideoGroupEntity } from './video-group.entity';

/**
 * This is a dummy entity which purpose is to enable the VideoEntity-VideoGroupEntity join table subscription.
 */
@Entity({ name: 'video-group-joins', synchronize: false })
export class VideoGroupJoinEntity {
  @PrimaryColumn()
  @RelationId('group')
  groupId: number;

  @ManyToOne(() => VideoGroupEntity)
  group: VideoGroupEntity;

  @PrimaryColumn()
  @RelationId('video')
  videoId: number;

  @ManyToOne(() => VideoEntity)
  video: VideoEntity;
}
