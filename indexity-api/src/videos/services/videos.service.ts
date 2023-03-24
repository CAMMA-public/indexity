import { Injectable, Type } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { VideoEntity } from '../entities/video.entity';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { EntityManager } from 'typeorm';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { AppConfiguration } from '../../config';
import { Configuration } from '../../common/decorators';
import { ServiceOptions } from '../../common/interfaces';
import { UserEntity } from '../../users/entities/user.entity';
import { VideosGateway } from '../gateways/videos.gateway';
import { GenericCRUDService } from '../../common/services';
import { AnnotationStates, publicTransitionsFrom } from '../annotation-states';

@Injectable()
export class VideosService extends GenericCRUDService<VideoEntity> {
  constructor(
    @InjectEntityManager() manager: EntityManager,
    @Configuration() protected readonly configuration: AppConfiguration,
    protected readonly gateway: VideosGateway,
  ) {
    super(manager);
  }

  protected get target(): Type<VideoEntity> {
    return VideoEntity;
  }

  /**
   * Delete all VideoEntity.
   */
  async deleteAll(serviceOptions?: ServiceOptions): Promise<VideoEntity[]> {
    const foundEntities = await this.getMany(null, serviceOptions);
    await this.getRepository(serviceOptions).remove(foundEntities);
    this.logger.verbose(
      `All videos deleted. (ids: [${foundEntities.map(e => e.id)}]`,
    );
    return foundEntities;
  }

  /**
   * Count all AnnotationEntity related to the VideoEntity matching the given id.
   * @param entity
   * @param serviceOptions
   * @throws NotFoundException
   */
  async getRelatedAnnotationsCount(
    entity: VideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<number> {
    const { id: videoId } = entity;
    const count = await this.getManager(serviceOptions)
      .getRepository(AnnotationEntity)
      .count({ where: { videoId } });
    this.logger.verbose(`Counted ${count} annotations for video ${videoId}.`);
    return count;
  }

  /**
   * Get all AnnotationEntity related to the VideoEntity matching the given id.
   * @param entity
   * @param serviceOptions
   * @throws NotFoundException
   */
  async getRelatedAnnotations(
    entity: VideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<AnnotationEntity[]> {
    const { id: videoId } = entity;
    const annotations = await this.getManager(serviceOptions)
      .getRepository(AnnotationEntity)
      .find({
        where: { videoId },
        relations: ['user'],
      });
    this.logger.verbose(
      `Got ${annotations.length} annotations (ids: [${annotations.map(
        e => e.id,
      )}]) related to video ${videoId}.`,
    );
    return annotations;
  }

  /**
   * Get all AnnotationLabelEntity related to the VideoEntity matching the given id.
   * @param entity
   * @param serviceOptions
   * @throws NotFoundException
   */
  async getRelatedAnnotationLabels(
    entity: VideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<AnnotationLabelEntity[]> {
    const { id: videoId } = entity;
    const labels = await this.getManager(serviceOptions)
      .createQueryBuilder(AnnotationLabelEntity, 'label')
      .leftJoin(
        AnnotationEntity,
        'annotation',
        '"label"."name" = "annotation"."labelName"',
      )
      .select('DISTINCT "label"."name"', 'name')
      .addSelect('"label"."color"', 'color')
      .where('annotation.videoId = :videoId', { videoId })
      .getRawMany()
      .then(rows =>
        rows.map(row => Object.assign(new AnnotationLabelEntity(), row)),
      );
    this.logger.verbose(
      `Got ${labels.length} labels (ids: [${labels.map(
        e => e.name,
      )}]) related to video ${videoId}.`,
    );
    return labels;
  }

  /**
   * Add the matching VideoEntity to the matching UserEntity's bookmarks.
   * @param user
   * @param video
   * @param serviceOptions
   */
  async bookmark(
    user: UserEntity,
    video: VideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<void> {
    const { id: videoId } = video;
    const { id: userId } = user;
    await this.getManager(serviceOptions)
      .createQueryBuilder()
      .relation(VideoEntity, 'users')
      .of(videoId)
      .add(userId);
    this.logger.verbose(`Bookmarked video ${videoId} for user ${userId}.`);
  }

  /**
   * Remove the matching VideoEntity from the matching UserEntity's bookmarks.
   * @param user
   * @param video
   * @param serviceOptions
   */
  async unbookmark(
    user: UserEntity,
    video: VideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<void> {
    const { id: videoId } = video;
    const { id: userId } = user;
    await this.getManager(serviceOptions)
      .createQueryBuilder()
      .relation(VideoEntity, 'users')
      .of(videoId)
      .remove(userId);
    this.logger.verbose(`Un-bookmarked video ${videoId} for user ${userId}.`);
  }

  /**
   * Get all VideoEntity that have been bookmarked by the UserEntity matching the given id.
   * @param user
   * @param serviceOptions
   */
  async getBookmarks(
    user: UserEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<number[]> {
    const { id: userId } = user;
    const bookmarks: number[] = await this.getManager(serviceOptions)
      .createQueryBuilder()
      .relation(UserEntity, 'videoBookmarks')
      .of(userId)
      .loadMany<VideoEntity>()
      .then(videos => videos.map(video => video.id));
    this.logger.verbose(
      `Got ${bookmarks.length} bookmarked videos (ids: [${bookmarks}]) for user ${userId}.`,
    );
    return bookmarks;
  }

  async getRelatedVideos(
    video: VideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<VideoEntity[]> {
    const { id, parentId, isOriginal } = video;
    return this.getMany(
      {
        where: isOriginal
          ? [{ id }, { parentId: id }]
          : [{ id }, { id: parentId }, { parentId }],
      },
      serviceOptions,
    );
  }

  /**
   * Get the video in the target resolution, or a better one
   * @param originalVideo
   * @param targetWidth
   */
  async getResolutionOrHigher(
    originalVideo: VideoEntity,
    targetWidth: number,
  ): Promise<VideoEntity> {
    if (originalVideo.width === targetWidth) {
      return originalVideo;
    }

    // if possible, get the video in the target resolution
    const relatedVideos = await this.getRelatedVideos(originalVideo);
    const searchedVideo = relatedVideos.find(
      video => video.width === targetWidth,
    );
    if (typeof searchedVideo !== 'undefined') {
      return searchedVideo;
    }

    // if possible, get a video with a slightly higher resolution
    const biggerVideos = relatedVideos.filter(
      video => video.width > targetWidth,
    );
    const widthValues = biggerVideos.map(video => video.width);
    const minWidth = Math.min(...widthValues);

    const biggerVideo = relatedVideos.find(video => video.width === minWidth);

    if (typeof biggerVideo !== 'undefined') {
      return biggerVideo;
    }

    return originalVideo;
  }

  /**
   * Throw an error if the transition is not allowed for given user.
   * @param video
   * @param userId
   * @param newState
   */
  validateTransition(
    video: VideoEntity,
    userId: number,
    newState: AnnotationStates,
  ): void {
    const oldState =
      video.annotationState || AnnotationStates.ANNOTATION_NOT_REQUIRED;

    if (oldState === newState) {
      return;
    }

    if (
      !publicTransitionsFrom[oldState].includes(newState) &&
      video.userId !== userId
    ) {
      throw new Error(
        `Only the owner of video ${video.id} can set the state from ${oldState} to ${newState}`,
      );
    }
  }

  /**
   * Set the annotation state to its new value.
   * @param videoId
   * @param userId
   * @param newState
   * @param serviceOptions
   */
  async setAnnotationState(
    videoId: number,
    userId: number,
    newState: AnnotationStates,
    serviceOptions?: ServiceOptions,
  ): Promise<VideoEntity> {
    const video = await this.getOne(videoId);
    const { annotationState: oldState } = video;

    this.validateTransition(video, userId, newState);
    if (oldState === newState) {
      throw new Error(`Video has already state ${newState}`);
    }
    const updatedVideo = { ...video, annotationState: newState };
    const updatedState = await this.getRepository(serviceOptions).save(
      updatedVideo,
    );
    this.logger.verbose(
      `Updated state (id: ${updatedState.id}) from ${oldState} to ${updatedVideo.annotationState}.`,
    );
    return updatedState;
  }

  /**
   * Update the videos so that they're linked to a new user.
   * @param videos
   * @param user
   */
  async saveVideosToUser(
    videos: VideoEntity[],
    user: UserEntity,
  ): Promise<VideoEntity[]> {
    const updatedVideos = videos.map(video => ({
      ...video,
      user,
    }));
    this.logger.verbose(
      `Moved ${updatedVideos.length} videos to another user (${user.id})`,
    );
    return this.updateMany(updatedVideos);
  }
}
