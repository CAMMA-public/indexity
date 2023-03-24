import {
  PaginatedData,
  ReadService,
  ServiceOptions,
} from '../../common/interfaces';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { AnnotationLabelStats } from '../models/annotation-label-stats.model';
import { EntityManager, FindManyOptions, FindOneOptions } from 'typeorm';

import { AnnotationsService } from '../../annotations/services/annotations.service';
import { Logger, Optional } from '@nestjs/common';
import { AnnotationLabelsService } from '../../annotations/services/annotation-labels.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';

export class AnnotationLabelStatsService
  implements ReadService<AnnotationLabelEntity, AnnotationLabelStats> {
  constructor(
    private readonly annotationsService: AnnotationsService,
    private readonly annotationLabelsService: AnnotationLabelsService,
    @InjectEntityManager() private readonly manager: EntityManager,
    @Optional()
    private readonly logger: Logger = new Logger('AnnotationLabelStatsService'),
  ) {}

  async getOne(
    idOrFindOptions?: string | FindOneOptions<AnnotationLabelEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<AnnotationLabelStats> {
    const label = await this.annotationLabelsService.getOne(
      idOrFindOptions,
      serviceOptions,
    );
    return this.getStatsForAnnotationLabel(label);
  }

  async getMany(
    findOptions?: FindManyOptions<AnnotationLabelEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<AnnotationLabelStats[]> {
    const labels = await this.annotationLabelsService.getMany(
      findOptions,
      serviceOptions,
    );
    return Promise.all(
      labels.map(label => this.getStatsForAnnotationLabel(label)),
    );
  }

  async getManyPaginated(
    findOptions?: FindManyOptions<AnnotationLabelEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<AnnotationLabelStats>> {
    const labels = await this.annotationLabelsService.getManyPaginated(
      findOptions,
      serviceOptions,
    );
    const stats = await Promise.all(
      labels.data.map(label => this.getStatsForAnnotationLabel(label)),
    );
    return {
      ...labels,
      data: stats,
    };
  }

  private async getStatsForAnnotationLabel(
    label: AnnotationLabelEntity,
  ): Promise<AnnotationLabelStats> {
    const { name: labelName } = label;
    const rawRes: { id: number; videoId: number }[] = await this.manager
      .createQueryBuilder(AnnotationEntity, 'annotation')
      .select('id, "videoId"')
      .where({ labelName })
      .getRawMany();
    const stats = rawRes.reduce(
      (accumulator, value) => {
        accumulator.annotationIds.push(value.id);
        if (!accumulator.videoIds.includes(value.videoId)) {
          accumulator.videoIds.push(value.videoId);
        }
        return accumulator;
      },
      { labelName, annotationIds: [], videoIds: [] },
    );
    this.logger.verbose(
      `Computed stats for one annotation label. (name: ${labelName})`,
    );
    return Object.assign(new AnnotationLabelStats(), stats);
  }
}
