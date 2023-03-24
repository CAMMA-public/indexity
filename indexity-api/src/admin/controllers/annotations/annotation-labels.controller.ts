import { AdminController } from '../admin/admin.controller';
import {
  BadRequestException,
  Controller,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { DeleteLabelResponseBodyDto } from '../../dtos/annotations/delete-label-response-body.dto';
import { AnnotationLabelsService } from '../../../annotations/services/annotation-labels.service';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin/annotation-labels')
export class AnnotationLabelsController extends AdminController {
  constructor(
    private readonly labelService: AnnotationLabelsService,
    private readonly annotationService: AnnotationsService,
  ) {
    super();
  }

  @Delete(':name')
  async deleteLabelByName(
    @Param('name') name: string,
  ): Promise<DeleteLabelResponseBodyDto> {
    const foundLabel = await this.labelService
      .getOne({ where: { name } })
      .catch((err: Error) => {
        switch (err.constructor) {
          case NotFoundException:
            throw err;
          default:
            throw new InternalServerErrorException();
        }
      });
    const isUsed = await this.annotationService
      .getOne({ where: { labelName: name } })
      .then(() => true)
      .catch((err: Error) => {
        switch (err.constructor) {
          case NotFoundException:
            return false;
          default:
            throw new InternalServerErrorException();
        }
      });
    if (isUsed) {
      throw new BadRequestException(
        `This label (${name}) is related to at least one annotation. You can't delete labels that are in use.`,
      );
    }
    await this.labelService.deleteOne(foundLabel);
    return foundLabel;
  }
}
