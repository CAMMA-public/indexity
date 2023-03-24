import { Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoGroupEntity } from './video-group.entity';

/**
 * This is a dummy entity which purpose is to enable the VideoGroupEntity-UserEntity join table subscription.
 */
@Entity({ name: 'user_video-group', synchronize: false })
export class VideoGroupUserJoinEntity {
  @PrimaryColumn()
  @RelationId('videoGroup')
  videoGroupId: number;

  @ManyToOne(() => VideoGroupEntity)
  videoGroup: VideoGroupEntity;

  @PrimaryColumn()
  @RelationId('user')
  userId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;
}
