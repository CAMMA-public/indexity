import { forwardRef, Inject, Injectable, Type } from '@nestjs/common';
import { AnnotationEntity } from '../entities/annotation.entity';
import { EntityManager, FindConditions, FindManyOptions, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AnnotationsGateway } from '../gateways/annotations.gateway';
import { GenericCRUDService } from '../../common/services';
import { RoomMessageEvent } from '../interfaces/events.interface';
import { UserEntity } from '../../users/entities/user.entity';
import { PaginatedData, ServiceOptions } from '../../common/interfaces';
import { userIsAdmin } from '../../users/helpers/user.helpers';
import { merge } from 'lodash';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';

@Injectable()
export class AnnotationsService extends GenericCRUDService<AnnotationEntity> {
  constructor(
    @InjectEntityManager() manager: EntityManager,
    @Inject(forwardRef(() => AnnotationsGateway))
    private readonly gateway: AnnotationsGateway,
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {
    super(manager);
  }

  protected get target(): Type<AnnotationEntity> {
    return AnnotationEntity;
  }

  emitMessageInRoom(msg: RoomMessageEvent): void {
    this.gateway.emitMessageInRoom(msg);
  }

  /**
   * Get paginated annotations with respect to user access to videos.
   * @param user
   * @param findOptions
   * @param serviceOptions
   */
  async protectedGetManyPaginated(
    user: UserEntity,
    findOptions?:
      | FindConditions<AnnotationEntity>
      | FindManyOptions<AnnotationEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<AnnotationEntity>> {
    if (userIsAdmin(user)) {
      return this.getManyPaginated(findOptions, serviceOptions);
    }
    const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
      user,
    );
    if (accessibleVideoIds.length === 0) {
      return { data: [], total: 0 };
    }
    const accessOptions = { where: { videoId: In(accessibleVideoIds) } };
    const completeFindOptions =
      typeof findOptions === 'undefined'
        ? merge(findOptions, accessOptions)
        : accessOptions;
    return this.getManyPaginated(completeFindOptions, serviceOptions);
  }

  /**
   * Update the annotations so that they're linked to a new user.
   * @param annotations
   * @param user
   */
  async saveAnnotationsToUser(
    annotations: AnnotationEntity[],
    user: UserEntity,
  ): Promise<AnnotationEntity[]> {
    const updatedAnnotations = annotations.map(annotation => ({
      ...annotation,
      user,
    }));
    this.logger.verbose(
      `Moved ${updatedAnnotations.length} annotations to another user (${user.id})`,
    );
    return this.updateMany(updatedAnnotations);
  }
}
