import { PipeTransform } from '@nestjs/common';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';

export class AnnotationLabelTypePipe implements PipeTransform {
  transform(value: AnnotationLabelEntity): AnnotationLabelEntity {
    if (!value.type) {
      value.type = 'structure';
    }
    return value;
  }
}
