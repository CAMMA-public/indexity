import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { VideoGroupsGateway } from '../gateways/video-groups.gateway';

@Injectable()
export class VideoGroupsSubscriber
  implements EntitySubscriberInterface<VideoGroupEntity> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private videoGroupsGateway: VideoGroupsGateway,
  ) {
    this.connection.subscribers.push(this);
  }

  listenTo(): Function {
    return VideoGroupEntity;
  }

  afterInsert(event: InsertEvent<VideoGroupEntity>): void {
    this.videoGroupsGateway.created(event.entity);
  }

  afterRemove(event: RemoveEvent<VideoGroupEntity>): void {
    this.videoGroupsGateway.deleted(event.entityId);
  }

  afterUpdate(event: UpdateEvent<VideoGroupEntity>): void {
    this.videoGroupsGateway.updated(event.entity);
  }
}
