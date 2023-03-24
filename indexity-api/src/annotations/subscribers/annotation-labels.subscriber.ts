import { InjectConnection } from '@nestjs/typeorm';
import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AnnotationLabelsGateway } from '../gateways/annotation-labels.gateway';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';

@Injectable()
export class AnnotationLabelsSubscriber
  implements EntitySubscriberInterface<AnnotationLabelEntity> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly annotationLabelsGateway: AnnotationLabelsGateway,
  ) {
    connection.subscribers.push(this);
  }

  listenTo(): Function {
    return AnnotationLabelEntity;
  }

  afterInsert(insertEvent: InsertEvent<AnnotationLabelEntity>): void {
    this.annotationLabelsGateway.emitAnnotationLabelCreateSuccess(
      insertEvent.entity,
    );
  }

  afterUpdate(updateEvent: UpdateEvent<AnnotationLabelEntity>): void {
    this.annotationLabelsGateway.emitAnnotationLabelUpdateSuccess(
      updateEvent.entity,
    );
  }
}
