import { User } from '../../../../core/models/user';

export interface GenericGroup {
  id?: number;
  name: string;
  description?: string;
  userId: number;
  user?: User;
  updatedAt?: string;
  createdAt?: string;
}
