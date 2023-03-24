import { Annotation } from './annotation.model';
import { User } from './user';

export interface UserAnnotation extends Annotation {
  user?: User;
}
