import { Injectable, Type } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ServiceOptions } from '../../common/interfaces';
import { VideoEntity } from '../../videos/entities/video.entity';
import { VideosService } from '../../videos/services/videos.service';
import { AnnotationsService } from './annotations.service';
import { isEmpty, isString } from 'lodash';
import { GenericCRUDService } from '../../common/services';

const DEFAULT_LABEL_SUGGESTIONS_LIMIT = 10;

@Injectable()
export class AnnotationLabelsService extends GenericCRUDService<
  AnnotationLabelEntity
> {
  constructor(
    @InjectEntityManager() manager: EntityManager,
    private readonly videosService: VideosService,
    private readonly annotationsService: AnnotationsService,
  ) {
    super(manager);
  }

  protected get target(): Type<AnnotationLabelEntity> {
    return AnnotationLabelEntity;
  }

  /**
   * Get label suggestions based on the querying user and its last label usages.
   * @param user
   * @param labelName
   * @param limit
   * @param serviceOptions
   */
  async getLabelSuggestions(
    user: UserEntity,
    labelName?: string,
    limit: number = DEFAULT_LABEL_SUGGESTIONS_LIMIT,
    serviceOptions?: ServiceOptions,
  ): Promise<AnnotationLabelEntity[]> {
    const suggestions: AnnotationLabelEntity[] = [];

    const isFilteredMode = isString(labelName);

    if (isFilteredMode) {
      this.logger.debug('Performing label search in filtered mode.');
      // Filtering mode: when user starts typing anything into the name field,
      // Suggested labels should be: only labels that correspond to the search criteria, and that's it (most relevant first)
      const lastUsedByCurrentUserQuery = this.annotationsService
        .getRepository(serviceOptions)
        .createQueryBuilder('annotation')
        .select('label.name', 'labelName')
        .addSelect('label.color', 'labelColor')
        .addSelect('label.type', 'labelType')
        .addSelect('MAX(annotation.updatedAt)', 'lastLabelUsage')
        .leftJoin('annotation.label', 'label')
        .where('annotation.userId = :userId', { userId: user.id })
        .andWhere('annotation.labelName ILIKE :pattern', {
          pattern: `%${labelName}%`,
        })
        .groupBy('label.name')
        .orderBy('"lastLabelUsage"', 'DESC')
        .limit(limit);
      suggestions.push(
        ...(await lastUsedByCurrentUserQuery.getRawMany().then(rows =>
          rows.map(row =>
            Object.assign(new AnnotationLabelEntity(), {
              name: row.labelName,
              color: row.labelColor,
              type: row.labelType,
            }),
          ),
        )),
      );
      if (suggestions.length < limit) {
        const fillersQuery = this.getRepository(serviceOptions)
          .createQueryBuilder('label')
          .limit(limit - suggestions.length)
          .where('label.name ILIKE :pattern', { pattern: `%${labelName}%` });
        if (!isEmpty(suggestions)) {
          fillersQuery.andWhere('label.name NOT IN(:...names)', {
            names: suggestions.map(s => s.name),
          });
        }
        suggestions.push(...(await fillersQuery.getMany()));
      }
    } else {
      // Suggestion mode: when user hasn't typed anything yet in the label name field
      // Suggested labels should be: last used labels by the user (most recently used first),
      // optionally fill the limit with any labels if the last used labels list length is less than limit option
      this.logger.debug('Performing label search in suggestion mode.');
      const lastUsedByCurrentUserQuery = this.annotationsService
        .getRepository(serviceOptions)
        .createQueryBuilder('annotation')
        .select('label.name', 'labelName')
        .addSelect('label.color', 'labelColor')
        .addSelect('label.type', 'labelType')
        .addSelect('MAX(annotation.updatedAt)', 'lastLabelUsage')
        .leftJoin('annotation.label', 'label')
        .where('annotation.userId = :userId', { userId: user.id })
        .groupBy('label.name')
        .orderBy('"lastLabelUsage"', 'DESC')
        .limit(limit);
      suggestions.push(
        ...(await lastUsedByCurrentUserQuery.getRawMany().then(rows =>
          rows.map(row =>
            Object.assign(new AnnotationLabelEntity(), {
              name: row.labelName,
              color: row.labelColor,
              type: row.labelType,
            }),
          ),
        )),
      );
      if (suggestions.length < limit) {
        const fillersQuery = this.getRepository(serviceOptions)
          .createQueryBuilder('label')
          .limit(limit - suggestions.length);
        if (!isEmpty(suggestions)) {
          fillersQuery.where('label.name NOT IN(:...names)', {
            names: suggestions.map(s => s.name),
          });
        }
        suggestions.push(...(await fillersQuery.getMany()));
      }
    }

    this.logger.debug(`Label search results: ${suggestions.map(s => s.name)}`);

    return suggestions;
  }

  async getRelatedVideos(
    label: AnnotationLabelEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<VideoEntity[]> {
    const { name: labelName } = label;
    const videos: VideoEntity[] = [];
    const videoIds = await this.annotationsService
      .getMany(
        {
          where: { labelName },
          select: ['videoId'],
        },
        serviceOptions,
      )
      .then(partialAnnotations =>
        partialAnnotations.map(({ videoId }) => videoId),
      );
    if (!isEmpty(videoIds)) {
      videos.push(
        ...(await this.videosService.getMany({
          where: { id: In(videoIds) },
        })),
      );
    }
    return videos;
  }
}
