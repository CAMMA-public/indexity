import { Transform } from 'class-transformer';
import { CleanUserDto } from '../../users/dtos/clean-user.dto';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { UserEntity } from '../../users/entities/user.entity';

export class VideoStats {
  videoId: number;
  annotationsCount: number;
  annotationLabels: AnnotationLabelEntity[];
  groupIds: number[];
  @Transform(user => user.map(u => new CleanUserDto(u.id, u.name)))
  users: UserEntity[];
}
