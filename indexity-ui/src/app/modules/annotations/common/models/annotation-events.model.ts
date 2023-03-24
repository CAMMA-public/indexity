import { Annotation } from '@app/annotations/common/models/annotation.model';

export interface ErrorEvent {
  error: Error;
}

export interface AnnotationCreateSuccessEvent {
  id: number;
  createdAnnotation: Annotation;
}

export interface AnnotationUpdateErrorEvent extends ErrorEvent {
  id: number;
}

export interface AnnotationUpdateSuccessEvent {
  id: number;
  updatedAnnotation: Annotation;
}

export interface AnnotationDeleteErrorEvent extends ErrorEvent {
  id: number;
}

export interface AnnotationDeleteSuccessEvent {
  id: number;
  deletedAnnotation: Annotation;
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

export interface StructureTrackerStartEvent {
  annotationId: number;
}

export interface StructureTrackerSuccessEvent {
  annotationId: number;
}

export interface StructureTrackerFailureEvent {
  annotationId: number;
}
