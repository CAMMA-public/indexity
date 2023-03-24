import { forwardRef, Inject, Injectable, Type } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { VideoGroupEntity } from '../entities/video-group.entity';
import {
  DeepPartial,
  EntityManager,
  FindConditions,
  FindManyOptions,
  In,
  QueryFailedError,
} from 'typeorm';
import { PaginatedData, ServiceOptions } from '../../common/interfaces';
import { VideoGroupJoinsService } from './video-group-joins.service';
import { difference, isEmpty, merge } from 'lodash';
import { VideoEntity } from '../entities/video.entity';
import { VideoGroupNameAlreadyTakenError } from '../errors/video-group-name-already-taken.error';
import { GenericCRUDService } from '../../common/services';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoAccessValidationService } from './video-access-validation.service';
import { userIsAdmin } from '../../users/helpers/user.helpers';
import { VideoGroupUserJoinsService } from './video-group-user-joins.service';

@Injectable()
export class VideoGroupsService extends GenericCRUDService<VideoGroupEntity> {
  constructor(
    @InjectEntityManager() manager: EntityManager,
    private readonly joinsService: VideoGroupJoinsService,
    private readonly userJoinsService: VideoGroupUserJoinsService,
    @Inject(forwardRef(() => VideoAccessValidationService))
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {
    super(manager);
  }

  protected get target(): Type<VideoGroupEntity> {
    return VideoGroupEntity;
  }

  /**
   * Create and save a VideoGroupEntity.
   * @param payload
   * @param serviceOptions
   */
  async createOne<U extends VideoGroupEntity>(
    payload: DeepPartial<U>,
    serviceOptions?: ServiceOptions,
  ): Promise<U> {
    return super.createOne(payload, serviceOptions).catch((err: Error) => {
      if (
        err instanceof QueryFailedError &&
        'duplicate key value violates unique constraint "UQ_1fa3b655832a502975d4058e1fa"' ===
          err.message
      ) {
        throw new VideoGroupNameAlreadyTakenError(
          // NOTE
          // This is a dirty hack to reassure tsc that the name property is defined (as it should be if you look at the VideoGroupEntity)
          'string' === typeof payload.name ? payload.name : 'UNKNOWN',
        );
      } else {
        throw err;
      }
    });
  }

  /**
   * Delete all VideoGroupEntity.
   */
  async deleteAll(
    serviceOptions?: ServiceOptions,
  ): Promise<VideoGroupEntity[]> {
    const ids = [];
    const foundEntities = await this.getMany(null, serviceOptions);
    foundEntities.map(group => (ids[group.name] = group.id));
    await this.getRepository(serviceOptions).remove(foundEntities);
    const res = foundEntities.map(group => ({
      ...group,
      id: ids[group.name],
    }));
    this.logger.verbose(
      `All video groups deleted. (ids: [${res.map(e => e.id)}])`,
    );
    return res;
  }

  /**
   * Get paginated video groups with respect to user access.
   * @param user
   * @param findOptions
   * @param serviceOptions
   */
  async protectedGetManyPaginated(
    user: UserEntity,
    findOptions?:
      | FindConditions<VideoGroupEntity>
      | FindManyOptions<VideoGroupEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<VideoGroupEntity>> {
    if (userIsAdmin(user)) {
      return this.getManyPaginated(findOptions, serviceOptions);
    }
    const accessibleVideoGroupIds = await this.videoAccessValidationService.getAccessibleVideoGroupIds(
      user,
    );
    if (accessibleVideoGroupIds.length === 0) {
      return { data: [], total: 0 };
    }
    const accessOptions = {
      where: { id: In(accessibleVideoGroupIds) },
    };
    const completeFindOptions =
      typeof findOptions === 'undefined'
        ? merge(findOptions, accessOptions)
        : accessOptions;
    return this.getManyPaginated(completeFindOptions, serviceOptions);
  }

  /**
   * Add the given VideoEntities to the given VideoGroupEntity.
   * @param group
   * @param videos
   * @param serviceOptions
   */
  async addVideos(
    group: VideoGroupEntity,
    videos: VideoEntity[],
    serviceOptions?: ServiceOptions,
  ): Promise<VideoGroupEntity> {
    await this.joinsService.createMany(
      videos.map(video => ({ groupId: group.id, videoId: video.id })),
      serviceOptions,
    );
    this.logger.verbose(
      `Added videos (ids: [${videos.map(video => video.id)}]) to group ${
        group.id
      }`,
    );
    return this.getOne(
      {
        where: { id: group.id },
      },
      serviceOptions,
    );
  }

  /**
   * Remove the given VideoEntities from the given VideoGroupEntity.
   * @param group
   * @param videos
   * @param serviceOptions
   */
  async removeVideos(
    group: VideoGroupEntity,
    videos: VideoEntity[],
    serviceOptions?: ServiceOptions,
  ): Promise<VideoGroupEntity> {
    const joinToBeDeleted = await this.joinsService.getMany(
      {
        where: {
          groupId: group.id,
          videoId: In(videos.map(video => video.id)),
        },
      },
      serviceOptions,
    );
    await this.joinsService.deleteMany(joinToBeDeleted, serviceOptions);
    this.logger.verbose(
      `Removed videos (ids: [${videos.map(video => video.id)}]) from group ${
        group.id
      }`,
    );
    return this.getOne(
      {
        where: { id: group.id },
      },
      serviceOptions,
    );
  }

  /**
   * Update the 'videos' collection with the given VideoEntities for the given VideoGroupEntity.
   * @param group
   * @param videos
   * @param serviceOptions
   */
  async updateVideos(
    group: VideoGroupEntity,
    videos: VideoEntity[],
    serviceOptions?: ServiceOptions,
  ): Promise<VideoGroupEntity> {
    const videoIdsToAdd = difference(
      videos.map(video => video.id),
      group.videoIds,
    );
    if (!isEmpty(videoIdsToAdd)) {
      // TODO Use this.addVideos
      await this.joinsService.createMany(
        videoIdsToAdd.map(videoId => ({ groupId: group.id, videoId })),
      );
    }
    const videoIdsToRemove = difference(
      group.videoIds,
      videos.map(video => video.id),
    );
    if (!isEmpty(videoIdsToRemove)) {
      // TODO Use this.removeVideos
      const joinsToRemove = await this.joinsService.getMany(
        {
          where: {
            groupId: group.id,
            videoId: In(videoIdsToRemove),
          },
        },
        serviceOptions,
      );
      await this.joinsService.deleteMany(joinsToRemove);
    }
    this.logger.verbose(
      `Updated videos (ids: [${videos.map(video => video.id)}]) of group ${
        group.id
      }`,
    );
    return this.getOne(
      {
        where: { id: group.id },
      },
      serviceOptions,
    );
  }

  /**
   * Add user to video group.
   * @param videoGroup
   * @param user (with allowedUsers)
   */
  async addUserToGroup(
    user: UserEntity,
    videoGroup: VideoGroupEntity,
  ): Promise<void> {
    await this.userJoinsService.createOne({
      videoGroupId: videoGroup.id,
      userId: user.id,
    });
  }

  /**
   * Remove user from video group.
   * @param videoGroup
   * @param user (with allowedUsers)
   */
  async removeUserFromGroup(
    user: UserEntity,
    videoGroup: VideoGroupEntity,
  ): Promise<void> {
    const joinToBeDeleted = await this.userJoinsService.getOne({
      where: {
        videoGroupId: videoGroup.id,
        userId: user.id,
      },
    });
    await this.userJoinsService.deleteOne(joinToBeDeleted);
  }

  /**
   * Update the video groups so that they're linked to a new user.
   * @param video groups
   * @param user
   */
  async saveVideoGroupsToUser(
    videoGroups: VideoGroupEntity[],
    user: UserEntity,
  ): Promise<VideoGroupEntity[]> {
    const updatedVideoGroups = videoGroups.map(videoGroup => ({
      ...videoGroup,
      user,
    }));
    this.logger.verbose(
      `Moved ${updatedVideoGroups.length} video groups to another user (${user.id})`,
    );
    return this.updateMany(updatedVideoGroups);
  }
}
