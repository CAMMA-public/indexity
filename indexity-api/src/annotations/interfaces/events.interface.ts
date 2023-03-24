import { AnnotationEntity } from '../entities/annotation.entity';

export interface ErrorEvent {
  error: Error;
}

export interface AnnotationCreateSuccessEvent {
  id: number;
  createdAnnotation: AnnotationEntity;
}

export interface AnnotationUpdateErrorEvent extends ErrorEvent {
  id: number;
}

export interface AnnotationUpdateSuccessEvent {
  id: number;
  updatedAnnotation: AnnotationEntity;
}

export interface AnnotationDeleteErrorEvent extends ErrorEvent {
  id: number;
}

export interface AnnotationDeleteSuccessEvent {
  id: number;
  deletedAnnotation: AnnotationEntity;
}

export interface RegisterRoomSuccessEvent {
  roomId: number;
}

export interface RegisterRoomErrorEvent extends ErrorEvent {
  roomId: number;
}

export interface LeaveRoomSuccessEvent {
  roomId: number;
}

export interface LeaveRoomErrorEvent extends ErrorEvent {
  roomId: number;
}

export interface RoomMessageEvent {
  roomId: number;
  event: string;
  data: any;
}
