import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfiguration } from '../../config';
import { defaultTo, isUndefined, toNumber } from 'lodash';
import { UserEntity } from '../../users/entities/user.entity';
import { TokenClaims } from '../interfaces/token-claims.interface';
import { Configuration } from '../../common/decorators';
import { AccessTokensService } from './access-tokens.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly accessTokensService: AccessTokensService,
    private readonly usersService: UsersService,
    @Configuration() private readonly cfg: AppConfiguration,
  ) {
    super({
      jwtFromRequest: req =>
        defaultTo(
          ExtractJwt.fromAuthHeaderAsBearerToken()(req),
          ExtractJwt.fromUrlQueryParameter(cfg.auth.query)(req),
        ),
      secretOrKey: cfg.auth.secret,
    });
  }

  async validate(payload: TokenClaims): Promise<UserEntity> {
    const user = await this.usersService.getOne({
      id: toNumber(payload.sub),
      isActivated: true,
    });
    if (isUndefined(user)) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
