import { UserEntity } from '../../users/entities/user.entity';

export class Token {
  expiresIn: number;
  accessToken: string;
  user: UserEntity;
}
