import { OriginalVideosService } from './../../videos/services/original-videos.service';
import { InjectConnection } from '@nestjs/typeorm';
import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AnnotationsGateway } from '../gateways/annotations.gateway';
import { AnnotationEntity } from '../entities/annotation.entity';
import { VideosService } from '../../videos/services/videos.service';
import { AnnotationStates } from '../../videos/annotation-states';

@Injectable()
export class AnnotationsSubscriber
  implements EntitySubscriberInterface<AnnotationEntity> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly annotationsGateway: AnnotationsGateway,
    private readonly videosService: VideosService,
    private readonly originalVideosService: OriginalVideosService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo(): Function {
    return AnnotationEntity;
  }

  async beforeInsert(
    insertEvent: InsertEvent<AnnotationEntity>,
  ): Promise<void> {
    const insertedAnnotation = insertEvent.entity;
    const video = await this.videosService.getOne(insertedAnnotation.videoId);

    if (!video.isOriginal) {
      const videos = await this.videosService.getRelatedVideos(video);
      const originalVideo = videos.find(video => video.isOriginal);

      if (typeof originalVideo !== 'undefined') {
        insertedAnnotation.videoId = originalVideo.id;
      }
    }
  }

  async afterInsert(insertEvent: InsertEvent<AnnotationEntity>): Promise<void> {
    const insertedAnnotation = insertEvent.entity;
    const video = await this.videosService.getOne(insertEvent.entity.videoId);
    if (
      [
        AnnotationStates.ANNOTATION_PENDING,
        AnnotationStates.ANNOTATION_FINISHED,
      ].includes(video.annotationState)
    ) {
      await this.originalVideosService.updateOne({
        id: video.id,
        annotationState: AnnotationStates.ANNOTATING,
      });
    }
    this.annotationsGateway.emitAnnotationCreateSuccess(insertedAnnotation);
  }

  afterUpdate(updateEvent: UpdateEvent<AnnotationEntity>): void {
    const updatedEntity = updateEvent.entity;
    this.annotationsGateway.emitAnnotationUpdateSuccess(updatedEntity);
  }

  // FIXME: Using the subscriber to emit the event would be more reliable
  // but 'afterRemove' subscriber cannot access the entity id, which is needed in the UI
  // TypeORM issue: https://github.com/typeorm/typeorm/issues/4058

  // afterRemove(removeEvent: RemoveEvent<AnnotationEntity>): void {
  //   const removedEntity = removeEvent.entity;
  //   this.annotationsGateway.emitAnnotationDeleteSuccess(removedEntity);
  // }
}
