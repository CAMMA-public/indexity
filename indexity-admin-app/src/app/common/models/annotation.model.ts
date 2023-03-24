import { AnnotationShape } from './annotation-shape.model';
import { AnnotationLabel } from './annotation-label.model';
import { User } from './user';

export interface Annotation {
  id?: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
  shape?: AnnotationShape;
  description?: string;
  duration: number;
  timestamp: number;
  ipAdress?: string;
  videoId: number;
  label?: AnnotationLabel;
  labelName?: string;
  isOneShot: boolean;
  instance?: string;
  user?: User;
  userId?: number;
  isFalsePositive?: boolean;
}
