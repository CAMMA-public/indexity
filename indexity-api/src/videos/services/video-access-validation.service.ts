import { VideoGroupEntity } from '../entities/video-group.entity';
import {
  userIsAdmin,
  userIsInternal,
  userIsModerator,
} from '../../users/helpers/user.helpers';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoEntity } from '../entities/video.entity';
import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { VideoGroupsService } from '../services/video-groups.service';
import { In } from 'typeorm';
import { flatten } from 'lodash';
import { VideosService } from './videos.service';
import { VideoChunkEntity } from '../entities/chunked-video.entity';
import { UsersService } from '../../users/services/users.service';
import { Configuration } from '../../common/decorators';
import { AppConfiguration } from '../../config';

@Injectable()
export class VideoAccessValidationService {
  constructor(
    @Inject(forwardRef(() => VideoGroupsService))
    private readonly videoGroupsService: VideoGroupsService,
    private readonly videosService: VideosService,
    private readonly usersService: UsersService,
    @Configuration() private readonly cfg: AppConfiguration,
  ) {}

  /**
   * Return true if user has access to video group.
   * Ignores admin/internal privileges, since they have access to everything.
   * @param userId
   * @param videoGroup
   */
  userBelongsToGroup(userId: number, videoGroup: VideoGroupEntity): boolean {
    if (this.cfg.enableGroupPermissions) {
      return (
        videoGroup.userId == userId ||
        videoGroup.allowedUserIds.includes(userId)
      );
    } else {
      return true;
    }
  }

  /**
   * Throws if the user has not access to the video group
   * @param videoGroup
   * @param user
   */
  validateVideoGroupAccess(
    videoGroup: VideoGroupEntity,
    user: UserEntity,
  ): void {
    const canAccess =
      userIsAdmin(user) ||
      userIsInternal(user) ||
      this.userBelongsToGroup(user.id, videoGroup);
    if (!canAccess) {
      throw new HttpException(
        `User ${user.id} has not access to video group ${videoGroup.id}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Throws if the user cannot manage the video group
   * @param videoGroup
   * @param user
   */
  validateVideoGroupManagement(
    videoGroup: VideoGroupEntity,
    user: UserEntity,
  ): void {
    const canManage =
      userIsAdmin(user) ||
      (userIsModerator(user) && this.userBelongsToGroup(user.id, videoGroup));
    if (!canManage) {
      throw new HttpException(
        `User ${user.id} cannot manage video group ${videoGroup.id}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Throws if the user cannot manage the video
   * @param video
   * @param user
   */
  async validateVideoManagement(
    video: VideoEntity,
    user: UserEntity,
  ): Promise<void> {
    if (userIsAdmin(user) || userIsInternal(user)) {
      return;
    } else if (userIsModerator(user)) {
      await this.validateVideoAccess(video, user);
    } else {
      throw new HttpException(
        `User ${user.id} cannot manage video ${video.id}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Throws if the user has not access to the video corresponding to the ID
   * @param videoId
   * @param user
   */
  async validateVideoIdAccess(
    videoId: number,
    user: UserEntity,
  ): Promise<void> {
    const video = await this.videosService.getOne(videoId);
    await this.validateVideoAccess(video, user);
  }

  /**
   * Throws if the user has not access to the video
   * @param video
   * @param user
   */
  async validateVideoAccess(
    video: VideoEntity,
    user: UserEntity,
  ): Promise<void> {
    if (!this.cfg.enableGroupPermissions) {
      return;
    }
    if (userIsAdmin(user) || userIsInternal(user) || video.userId === user.id) {
      return;
    }
    if (video.groupIds.length === 0) {
      throw new HttpException(
        `User ${user.id} has not access to video ${video.id}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const videoGroups = await this.videoGroupsService.getMany({
      where: {
        id: In(video.groupIds),
      },
    });
    const userWithAccessIds = videoGroups.map(group => [
      ...group.allowedUserIds,
      group.userId,
    ]);

    if (!flatten(userWithAccessIds).includes(user.id)) {
      throw new HttpException(
        `User ${user.id} has not access to video ${video.id}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Throws if the user has not access to the video chunk
   * @param videoChunk
   * @param user
   */
  async validateVideoChunkAccess(
    videoChunk: VideoChunkEntity,
    user: UserEntity,
  ): Promise<void> {
    const originalVideo = await this.videosService.getOne({
      where: { id: videoChunk.videoId },
    });
    await this.validateVideoAccess(originalVideo, user);
  }

  /**
   * Return video IDs accessible to the user (created videos, created and authorized video groups).
   * Ignores admin/internal privileges, since they have access to everything.
   * @param user
   */
  async getAccessibleVideoIds(user: UserEntity): Promise<number[]> {
    if (!this.cfg.enableGroupPermissions) {
      const videoIds: number[] = await this.videosService
        .getMany({ select: ['id'] })
        .then(videos => videos.map(({ id }) => id));

      return videoIds;
    }

    const userWithGroups = await this.usersService.getOne({
      where: { id: user.id },
      relations: ['accessibleVideoGroups', 'videoGroups', 'videos'],
    });
    const createdVideoIds = userWithGroups.videos.map(video => video.id);
    const createdGroupVideoIds = flatten(
      userWithGroups.videoGroups.map(group => group.videoIds),
    );
    const accessibleGroupVideoIds = flatten(
      userWithGroups.accessibleVideoGroups.map(group => group.videoIds),
    );

    return [
      ...new Set([
        ...createdVideoIds,
        ...createdGroupVideoIds,
        ...accessibleGroupVideoIds,
      ]),
    ];
  }

  /**
   * Return video group IDs accessible to the user (created and authorized video groups).
   * Ignores admin/internal privileges, since they have access to everything.
   * @param user
   */
  async getAccessibleVideoGroupIds(user: UserEntity): Promise<number[]> {
    if (!this.cfg.enableGroupPermissions) {
      const videoGroupIds: number[] = await this.videoGroupsService
        .getMany({ select: ['id'] })
        .then(groups => groups.map(({ id }) => id));

      return videoGroupIds;
    }

    const userWithGroups = await this.usersService.getOne({
      where: { id: user.id },
      relations: ['accessibleVideoGroups', 'videoGroups'],
    });
    return [
      ...userWithGroups.videoGroups.map(group => group.id),
      ...userWithGroups.accessibleVideoGroupIds,
    ];
  }
}
