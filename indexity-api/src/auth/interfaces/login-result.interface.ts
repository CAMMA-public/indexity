import { UserEntity } from '../../users/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserEntity;
}
