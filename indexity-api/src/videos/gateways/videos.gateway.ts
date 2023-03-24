import { VideoEntity } from '../entities/video.entity';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'videos' })
export class VideosGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  protected CREATED_EVENT = 'video_created';
  protected DELETED_EVENT = 'video_removed';
  protected UPDATED_EVENT = 'video_updated';
  protected THUMBNAIL_GENERATED_EVENT = 'video_thumbnail_generated';
  protected STATE_CREATE_SUCCESS = 'video_annotation_state_create_success';
  protected STATE_UPDATE_SUCCESS = 'video_annotation_state_update_success';
  protected STATE_DELETE_SUCCESS = 'video_annotation_state_delete_success';

  @WebSocketServer() private server: Socket;

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

  deleted(videoId: number): void {
    this.server.emit(this.DELETED_EVENT, videoId);
  }

  created(video: VideoEntity): void {
    this.server.emit(this.CREATED_EVENT, video);
  }

  updated(video: VideoEntity): void {
    this.server.emit(this.UPDATED_EVENT, video);
  }

  thumbnailGenerated(data: { id: number; thumbnailUrl: string }): void {
    this.server.emit(this.THUMBNAIL_GENERATED_EVENT, data);
  }
}
