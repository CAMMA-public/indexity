import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { VideoGroupEntity } from '../entities/video-group.entity';

@WebSocketGateway({ namespace: 'video-groups' })
export class VideoGroupsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  static readonly CREATED_EVENT = 'video_group_created';
  static readonly DELETED_EVENT = 'video_group_removed';
  static readonly UPDATED_EVENT = 'video_group_updated';

  @WebSocketServer()
  private server: Socket;

  private readonly logger = new Logger(this.constructor.name);

  afterInit(): void {
    this.logger.log('socket initialized');
  }

  handleConnection(): void {
    this.logger.log('client connected');
  }

  handleDisconnect(): void {
    this.logger.log('client disconnected');
  }

  deleted(videoGroupId: number): void {
    this.server.emit(VideoGroupsGateway.DELETED_EVENT, videoGroupId);
  }

  created(videoGroup: VideoGroupEntity): void {
    this.server.emit(VideoGroupsGateway.CREATED_EVENT, videoGroup);
  }

  updated(videoGroup: VideoGroupEntity): void {
    this.server.emit(VideoGroupsGateway.UPDATED_EVENT, videoGroup);
  }
}
