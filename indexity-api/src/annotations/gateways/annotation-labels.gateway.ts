import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  ANNOTATION_LABEL_CREATE_SUCCESS,
  ANNOTATION_LABEL_UPDATE_SUCCESS,
} from './events';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';

@WebSocketGateway({ namespace: 'annotation-labels' })
export class AnnotationLabelsGateway {
  @WebSocketServer()
  private readonly server: Server;

  emitAnnotationLabelCreateSuccess(
    annotationLabel: AnnotationLabelEntity,
  ): void {
    this.server.emit(ANNOTATION_LABEL_CREATE_SUCCESS, {
      createdAnnotationLabel: annotationLabel,
    });
  }

  emitAnnotationLabelUpdateSuccess(
    annotationLabel: AnnotationLabelEntity,
  ): void {
    this.server.emit(ANNOTATION_LABEL_UPDATE_SUCCESS, {
      updatedAnnotationLabel: annotationLabel,
    });
  }
}
