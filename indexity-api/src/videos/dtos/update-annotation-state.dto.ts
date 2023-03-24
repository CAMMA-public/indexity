import { AnnotationStates } from './../annotation-states';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnnotationStateDto {
  @ApiProperty({
    enum: [
      'ANNOTATION_PENDING',
      'ANNOTATING',
      'ANNOTATION_FINISHED',
      'ANNOTATION_NOT_REQUIRED',
    ],
  })
  @IsEnum(AnnotationStates)
  @IsNotEmpty()
  state: AnnotationStates;
}
