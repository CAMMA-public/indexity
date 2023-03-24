import { Injectable } from '@nestjs/common';
import { TokenClaims } from '../interfaces/token-claims.interface';
import { UserEntity } from '../../users/entities/user.entity';
import uuid from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Configuration } from '../../common/decorators';
import { AppConfiguration } from '../../config';

@Injectable()
export class AccessTokensService {
  constructor(
    private readonly jwt: JwtService,
    @Configuration() private readonly cfg: AppConfiguration,
  ) {}

  /**
   * Takes in a UserEntity and return its signed access jwt.
   * @param user
   */
  async issueToken(user: UserEntity): Promise<string> {
    const claims = this.createClaims(user);
    return this.jwt.sign(claims);
  }

  /**
   * Takes in a UserEntity a return new access token claims.
   * @param user
   */
  private createClaims(user: UserEntity): TokenClaims {
    return {
      sub: user.id.toString(),
      iat: Date.now(),
      exp: Date.now() + this.cfg.auth.access.ttl,
      jti: uuid.v4(),
    };
  }
}
