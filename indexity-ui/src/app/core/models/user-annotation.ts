import { User } from './user';
import { Annotation } from '@app/annotations/models/annotation.model';

export interface UserAnnotation extends Annotation {
  user?: User;
}
