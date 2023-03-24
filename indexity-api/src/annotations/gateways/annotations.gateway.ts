import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import {
  ANNOTATION_CREATE,
  ANNOTATION_CREATE_ERROR,
  ANNOTATION_CREATE_SUCCESS,
  ANNOTATION_DELETE,
  ANNOTATION_DELETE_SUCCESS,
  ANNOTATION_UPDATE,
  ANNOTATION_UPDATE_SUCCESS,
  ANNOTATION_UPDATE_ERROR,
  LEAVE_ROOM,
  LEAVE_ROOM_ERROR,
  LEAVE_ROOM_SUCCESS,
  REGISTER_ROOM,
  REGISTER_ROOM_ERROR,
  REGISTER_ROOM_SUCCESS,
  ANNOTATION_INTERPOLATE,
} from './events';
import { AnnotationEntity } from '../entities/annotation.entity';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { isError, partition } from 'lodash';
import { AnnotationsService } from '../services/annotations.service';
import {
  AnnotationDeleteErrorEvent,
  AnnotationUpdateErrorEvent,
  ErrorEvent,
  LeaveRoomErrorEvent,
  LeaveRoomSuccessEvent,
  RegisterRoomErrorEvent,
  RegisterRoomSuccessEvent,
  RoomMessageEvent,
} from '../interfaces/events.interface';
import { addInterpolatedPositions } from './../../common/helpers/annotations.helper';
import { config } from '../../config';

interface ClientInterpolationSettings {
  id: string;
  step: number;
}

@WebSocketGateway({ namespace: 'annotations' })
export class AnnotationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  private readonly server: Server;
  @Inject(forwardRef(() => AnnotationsService))
  private readonly service: AnnotationsService;
  private readonly logger = new Logger(this.constructor.name);
  _clientsWithInterpolation: ClientInterpolationSettings[] = [];

  afterInit(): void {
    this.logger.log('socket initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log('client connected');
  }

  handleDisconnect(client: Socket): void {
    this.logger.log('client disconnected');
    this.removeInterpolationForClient(client.id);
  }

  @SubscribeMessage(REGISTER_ROOM)
  onRegisterRoom(
    client: Socket,
    roomId: number,
  ): Promise<WsResponse<RegisterRoomSuccessEvent | RegisterRoomErrorEvent>> {
    return new Promise(resolve =>
      client.join(roomId.toString(), (err: Error) => {
        if (isError(err)) {
          resolve({
            event: REGISTER_ROOM_ERROR,
            data: { roomId, error: err },
          });
        } else {
          resolve({
            event: REGISTER_ROOM_SUCCESS,
            data: { roomId },
          });
        }
      }),
    );
  }

  @SubscribeMessage(ANNOTATION_INTERPOLATE)
  onInterpolate(
    client: Socket,
    data: { withInterpolation: boolean; step?: number },
  ): void {
    this.removeInterpolationForClient(client.id);

    if (data.withInterpolation) {
      const step =
        typeof data.step === 'undefined' || data.step < 0 ? null : data.step;
      this.addInterpolationForClient(client.id, step);
    }
    this.logger.verbose(
      `Received ANNOTATION_INTERPOLATE: ${this._clientsWithInterpolation.length} client(s) using the interpolation`,
    );
  }

  @SubscribeMessage(LEAVE_ROOM)
  onLeaveRoom(
    client: Socket,
    roomId: number,
  ): Promise<WsResponse<LeaveRoomSuccessEvent | LeaveRoomErrorEvent>> {
    return new Promise(resolve =>
      client.leave(roomId.toString(), (err: Error) => {
        if (isError(err)) {
          resolve({
            event: LEAVE_ROOM_ERROR,
            data: { roomId, error: err },
          });
        } else {
          resolve({
            event: LEAVE_ROOM_SUCCESS,
            data: { roomId },
          });
        }
      }),
    );
  }

  @SubscribeMessage(ANNOTATION_CREATE)
  async onAnnotationCreate(
    client: Socket,
    annotation: AnnotationEntity,
  ): Promise<WsResponse<ErrorEvent> | void> {
    try {
      await this.service.createOne(annotation);
      // NOTE: The ANNOTATION_CREATE_SUCCESS is sent by the AnnotationsSubscriber.afterInsert hook.
    } catch (error) {
      return {
        event: ANNOTATION_CREATE_ERROR,
        data: { error },
      };
    }
  }

  @SubscribeMessage(ANNOTATION_DELETE)
  async onAnnotationDelete(
    client: Socket,
    annotationId: number,
  ): Promise<WsResponse<AnnotationDeleteErrorEvent> | void> {
    try {
      const annotation = await this.service.getOne(annotationId);
      await this.service.deleteOne(annotation);
      // NOTE: The ANNOTATION_DELETE_SUCCESS is sent by the AnnotationsController.removeOne method.
    } catch (error) {
      return {
        event: ANNOTATION_UPDATE_ERROR,
        data: { id: annotationId, error },
      };
    }
  }

  @SubscribeMessage(ANNOTATION_UPDATE)
  async onAnnotationUpdate(
    client: Socket,
    annotation: Partial<AnnotationEntity>,
  ): Promise<WsResponse<AnnotationUpdateErrorEvent> | void> {
    try {
      await this.service.updateOne(annotation);
      // NOTE: The ANNOTATION_UPDATE_SUCCESS is sent by the AnnotationsSubscriber.afterUpdate hook.
    } catch (error) {
      return {
        event: ANNOTATION_UPDATE_ERROR,
        data: { id: annotation.id, error },
      };
    }
  }

  emitAnnotationCreateSuccess(annotation: AnnotationEntity): void {
    const [
      withInterpolation,
      withoutInterpolation,
    ] = this.getPartitionnedClientIds(annotation.videoId.toString());

    withoutInterpolation.map(clientId => {
      this.server.sockets[clientId].emit(ANNOTATION_CREATE_SUCCESS, {
        id: annotation.id,
        createdAnnotation: annotation,
      });
    });

    if (withInterpolation.length > 0) {
      const clients = this._clientsWithInterpolation.filter(client =>
        withInterpolation.includes(client.id),
      );
      const interpolatedAnnotations = this.buildInterpolatedAnnotations(
        clients,
        annotation,
      );

      clients.map(client => {
        const step =
          typeof client === 'undefined' || client.step === null
            ? config.annotationInterpolationStep
            : client.step;
        const interpolatedAnnotation = interpolatedAnnotations.find(
          annotation => annotation.step === step,
        ).annotation;

        this.server.sockets[client.id].emit(ANNOTATION_CREATE_SUCCESS, {
          id: annotation.id,
          createdAnnotation: interpolatedAnnotation,
        });
      });
    }
  }

  emitAnnotationDeleteSuccess(annotation: AnnotationEntity): void {
    this.emitMessageInRoom({
      roomId: annotation.videoId,
      event: ANNOTATION_DELETE_SUCCESS,
      data: {
        id: annotation.id,
        deletedAnnotation: annotation,
      },
    });
  }

  emitAnnotationUpdateSuccess(annotation: AnnotationEntity): void {
    const [
      withInterpolation,
      withoutInterpolation,
    ] = this.getPartitionnedClientIds(annotation.videoId.toString());

    withoutInterpolation.map(clientId => {
      this.server.sockets[clientId].emit(ANNOTATION_UPDATE_SUCCESS, {
        id: annotation.id,
        updatedAnnotation: annotation,
      });
    });

    if (withInterpolation.length > 0) {
      const clients = this._clientsWithInterpolation.filter(client =>
        withInterpolation.includes(client.id),
      );
      const interpolatedAnnotations = this.buildInterpolatedAnnotations(
        clients,
        annotation,
      );

      clients.map(client => {
        const step =
          typeof client === 'undefined' || client.step === null
            ? config.annotationInterpolationStep
            : client.step;
        const interpolatedAnnotation = interpolatedAnnotations.find(
          annotation => annotation.step === step,
        ).annotation;

        this.server.sockets[client.id].emit(ANNOTATION_UPDATE_SUCCESS, {
          id: annotation.id,
          updatedAnnotation: interpolatedAnnotation,
        });
      });
    }
  }

  emitMessageInRoom(msg: RoomMessageEvent): void {
    const clients = this.getRoomClients(msg.roomId.toString());
    clients.map(id => this.server.sockets[id].emit(msg.event, msg.data));
  }

  addInterpolationForClient(id: string, step: number): void {
    this._clientsWithInterpolation = [
      ...this._clientsWithInterpolation,
      { id, step },
    ];
  }

  removeInterpolationForClient(id: string): void {
    this._clientsWithInterpolation = this._clientsWithInterpolation.filter(
      c => c.id !== id,
    );
  }

  buildInterpolatedAnnotations(
    clientsWithInterpolation: ClientInterpolationSettings[],
    annotation: AnnotationEntity,
  ): { annotation: AnnotationEntity; step: number }[] {
    const allSteps = clientsWithInterpolation.map(client =>
      client.step === null ? config.annotationInterpolationStep : client.step,
    );

    const uniqueSteps = [...new Set(allSteps)];

    return uniqueSteps.map(step => ({
      annotation: addInterpolatedPositions(annotation, step),
      step,
    }));
  }

  /**
   * For a room, separate IDs of clients asking for interpolated or regular annotations
   * @param roomId
   */
  getPartitionnedClientIds(roomId: string): [string[], string[]] {
    const clientsInRoom = this.getRoomClients(roomId);
    return partition(
      clientsInRoom,
      id => !!this._clientsWithInterpolation.find(client => client.id === id),
    );
  }

  getRoomClients(roomId: string): string[] {
    // eslint-disable-next-line
    // @ts-ignore
    const room = this.server.adapter.rooms[roomId.toString()];
    return typeof room !== 'undefined' ? Object.keys(room.sockets) : [];
  }
}
