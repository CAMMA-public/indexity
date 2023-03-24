import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import { TokenClaims } from '../interfaces/token-claims.interface';
import { UserEntity } from '../../users/entities/user.entity';
import uuid from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Configuration } from '../../common/decorators';
import { AppConfiguration } from '../../config';

@Injectable()
export class RefreshTokensService {
  private readonly client: Redis;

  constructor(
    private readonly jwt: JwtService,
    @Configuration() private readonly cfg: AppConfiguration,
    redisService: RedisService,
  ) {
    this.client = redisService.getClient();
  }

  /**
   * Takes in a UserEntity and return its signed jwt.
   * @param user
   */
  async issueToken(user: UserEntity): Promise<string> {
    const claims = this.createClaims(user);
    const token = this.jwt.sign(claims);
    // await this.whitelist(claims);
    return token;
  }

  /**
   * Takes in a UserEntity a return new access token claims.
   * @param user
   */
  private createClaims(user: UserEntity): TokenClaims {
    return {
      sub: user.id.toString(),
      iat: Date.now(),
      exp: Date.now() + this.cfg.auth.refresh.ttl,
      jti: uuid.v4(),
    };
  }

  /**
   * Adds the given token claims to the whitelist
   * @param claim
   */
  // private async whitelist(claim: TokenClaims): Promise<void> {
  //   const key = `RT:${claim.sub}:${claim.jti}`;
  //   await this.client
  //     .pipeline()
  //     .set(key, true)
  //     .pexpireat(key, claim.exp)
  //     .exec();
  // }

  /**
   * Decode and verify the given encoded token and returns the matching claims
   * @param token
   */
  verifyToken(token: string): Promise<TokenClaims | undefined> {
    return this.jwt
      .verifyAsync<TokenClaims>(token)
      .then(async claims =>
        (await this.isWhitelisted(claims)) ? claims : undefined,
      )
      .catch(() => undefined);
  }

  /**
   * Check if the given token claims are whitelisted
   * @param claim
   */
  private async isWhitelisted(claim: TokenClaims): Promise<boolean> {
    const key = `RT:${claim.sub}:${claim.jti}`;
    return (await this.client.exists(key)) === 1;
  }

  /**
   * Remove the given token claims from the whitelist
   * @param claim
   */
  async revoke(claim: TokenClaims): Promise<void> {
    const key = `RT:${claim.sub}:${claim.jti}`;
    await this.client.del(key);
  }
}
