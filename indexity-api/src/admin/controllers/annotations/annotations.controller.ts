import { Controller, Delete, Get, Param } from '@nestjs/common';
import { AdminController } from '../admin/admin.controller';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { removeDuplicatedPositions } from '../../../common/helpers';
import { FindMany } from '../../../common/decorators';
import { FindManyOptions } from 'typeorm';
import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';
import { merge } from 'lodash';
import { PaginatedData } from '../../../common/interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin/annotations')
export class AnnotationsController extends AdminController {
  constructor(private annotationsService: AnnotationsService) {
    super();
  }

  @Get('/label/:labelName')
  annotationsForLabel(
    @Param('labelName') labelName: string,
    @FindMany() findOptions: FindManyOptions<AnnotationEntity>,
  ): Promise<PaginatedData<AnnotationEntity>> {
    return this.annotationsService.getManyPaginated(
      merge(findOptions, { where: { labelName } }),
    );
  }

  @Delete('/label/:labelName')
  async deleteAnnotationsForLabel(
    @Param('labelName') labelName: string,
  ): Promise<{ message: string; count: number; ids: number[] }> {
    const annotations = await this.annotationsService.getMany({
      where: { labelName },
    });
    const count = annotations.length;
    const ids = annotations.map(a => a.id);
    await this.annotationsService.deleteMany(annotations);
    return {
      message: `${count} annotations removed`,
      count,
      ids,
    };
  }

  @Delete('reset')
  async reset(): Promise<AnnotationEntity[]> {
    const annotations = await this.annotationsService.getMany();
    await this.annotationsService.deleteMany(annotations);
    return this.annotationsService.getMany();
  }

  @Delete('duplicated-positions')
  async removeDuplicatedPositions(): Promise<AnnotationEntity[]> {
    const annotations = await this.annotationsService.getMany();

    const newAnnotations = [];
    for (const annotation of annotations) {
      const positions = annotation.shape.positions;
      const fixedPositions = removeDuplicatedPositions(positions);
      const difference =
        Object.keys(positions).length - Object.keys(fixedPositions).length;
      if (difference > 0) {
        console.log(
          `Annotation ${annotation.id}: ${difference} positions removed.`,
        );
        const fixedAnnotation = {
          ...annotation,
          shape: {
            ...annotation.shape,
            positions: fixedPositions,
          },
        };
        newAnnotations.push(
          await this.annotationsService.updateOne(fixedAnnotation),
        );
      }
    }

    return newAnnotations;
  }
}
