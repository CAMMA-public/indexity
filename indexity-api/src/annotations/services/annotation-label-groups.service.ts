import { GenericCRUDService } from '../../common/services';
import { AnnotationLabelGroupEntity } from '../entities/annotation-label-group.entity';
import { Injectable, Type } from '@nestjs/common';
import { AnnotationLabelsService } from './annotation-labels.service';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

import _ from 'lodash';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class AnnotationLabelGroupsService extends GenericCRUDService<
  AnnotationLabelGroupEntity
> {
  constructor(
    @InjectEntityManager() manager: EntityManager,
    private labelsService: AnnotationLabelsService,
  ) {
    super(manager);
  }

  get target(): Type<AnnotationLabelGroupEntity> {
    return AnnotationLabelGroupEntity;
  }

  async addLabels(
    groupId: number,
    labelNames: string[],
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.getOne({
      where: { id: groupId },
      relations: ['labels'],
    });

    const labels = await this.labelsService.getMany({
      where: { name: In(labelNames) },
    });

    const labelsToAdd: AnnotationLabelEntity[] = _.differenceBy(
      labels,
      group.labels,
      'name',
    );
    group.labels = group.labels.concat(labelsToAdd);

    return this.getRepository().save(group);
  }

  async removeLabels(
    groupId: number,
    labelNames: string[],
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.getOne({
      where: { id: groupId },
      relations: ['labels'],
    });

    group.labels = group.labels.filter(l => !labelNames.includes(l.name));

    return this.getRepository().save(group);
  }

  /**
   * Update the annotation label groups so that they're linked to a new user.
   * @param annotation label groups
   * @param user
   */
  async saveLabelGroupsToUser(
    labelGroups: AnnotationLabelGroupEntity[],
    user: UserEntity,
  ): Promise<AnnotationLabelGroupEntity[]> {
    const updatedLabelGroups = labelGroups.map(labelGroup => ({
      ...labelGroup,
      user,
    }));
    this.logger.verbose(
      `Moved ${updatedLabelGroups.length} label groups to another user (${user.id})`,
    );
    return this.updateMany(updatedLabelGroups);
  }
}
