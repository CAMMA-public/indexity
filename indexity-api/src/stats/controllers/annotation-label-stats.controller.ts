import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { FindMany } from '../../common/decorators';
import { FindManyOptions } from 'typeorm';
import { AnnotationLabelStatsService } from '../services/annotation-label-stats.service';
import { AnnotationLabelStats } from '../models/annotation-label-stats.model';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { PaginatedData } from '../../common/interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('stats')
@Controller('stats/annotation-labels')
export class AnnotationLabelStatsController {
  constructor(
    private readonly annotationLabelStatsService: AnnotationLabelStatsService,
  ) {}

  @Get(':labelName')
  getOne(@Param('labelName') labelName: string): Promise<AnnotationLabelStats> {
    return this.annotationLabelStatsService.getOne(labelName);
  }

  @Get()
  getMany(
    @FindMany() findOptions: FindManyOptions<AnnotationLabelEntity>,
  ): Promise<PaginatedData<AnnotationLabelStats>> {
    return this.annotationLabelStatsService.getManyPaginated(findOptions);
  }
}
