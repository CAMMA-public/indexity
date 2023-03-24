import { UserEntity } from '../../../users/entities/user.entity';
import { VideoEntity } from '../../../videos/entities/video.entity';
import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';
import { VideoGroupEntity } from '../../../videos/entities/video-group.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseBodyDto
  implements Pick<UserEntity, 'name' | 'email'> {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  uploadedVideoIds: VideoEntity['id'][];

  @ApiProperty()
  annotatedVideoIds: VideoEntity['id'][];

  @ApiProperty()
  annotationCount: number;

  @ApiProperty()
  annotationIds: AnnotationEntity['id'][];

  @ApiProperty()
  groupIds: VideoGroupEntity['id'][];
}
