import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { AppConfiguration } from '../../config';
import { isUndefined, toNumber } from 'lodash';
import { UserEntity } from '../../users/entities/user.entity';
import { passwordHash } from '../../users/helpers/user.helpers';
import { Equal, IsNull, Not } from 'typeorm';
import { Credentials } from '../interfaces/credentials.interface';
import { Configuration } from '../../common/decorators';
import { LoginResult } from '../interfaces/login-result.interface';
import { AccessTokensService } from './access-tokens.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { USER_ROLE } from '../../users/models/user-roles';
import { SettingsService } from '../../settings/services/settings.service';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accessTokensService: AccessTokensService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly settingsService: SettingsService,
    @Configuration() private readonly cfg: AppConfiguration,
    @Optional() private readonly logger: Logger = new Logger('AuthService'),
  ) {}

  /**
   * Takes in user or user credentials and return an object wrapping the matching UserEntity and its signed jwt.
   * @param credentials
   */
  async login(
    credentialsOrUser: Credentials | UserEntity,
  ): Promise<LoginResponseDto> {
    const user =
      credentialsOrUser instanceof UserEntity
        ? credentialsOrUser
        : await this.verifyCredentials(
            credentialsOrUser.email,
            credentialsOrUser.password,
          );
    if (isUndefined(user)) {
      this.logger.verbose(`Failed login. (mail: ${credentialsOrUser.email})`);
      throw new HttpException('Wrong credentials.', HttpStatus.UNAUTHORIZED);
    } else if (!user.isActivated) {
      this.logger.verbose(
        `Failed login. (mail: ${credentialsOrUser.email} - deactivated user)`,
      );
      throw new HttpException(
        'Deactivated account. Please contact your administrator.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!user.roles.includes(USER_ROLE.ADMIN)) {
      const maintenanceMode = await this.settingsService.maintenanceMode();
      if (maintenanceMode.value === 'true') {
        throw new HttpException(
          'System is under Maintenance',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
    this.logger.verbose(`Successful login. (mail: ${credentialsOrUser.email})`);
    // plainToClass allows class-transformer decorators to be called (@Transform, @Exclude)
    return plainToClass(LoginResponseDto, {
      user: user,
      accessToken: await this.accessTokensService.issueToken(user),
      refreshToken: await this.refreshTokensService.issueToken(user),
    });
  }
  /**
   * Takes in an email and a password and return the matching activated UserEntity (if any).
   * @param email
   * @param password
   * @param includeSoftDeleted
   */
  async verifyCredentials(
    email: string,
    password: string,
    includeSoftDeleted = false,
  ): Promise<UserEntity | undefined> {
    try {
      return await this.usersService.getOne({
        where: {
          email,
          password: passwordHash(password, this.cfg.salt),
          deletedAt: includeSoftDeleted ? Not(IsNull()) : IsNull(),
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        return;
      }
      throw err;
    }
  }

  /**
   * Takes in a encoded refresh token an return a new
   * @param refreshToken
   */
  async refresh(refreshToken: string): Promise<LoginResult> {
    const maintenanceMode = await this.settingsService.maintenanceMode();
    if (maintenanceMode.value === 'true') {
      throw new HttpException(
        'System is under Maintenance',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const claims = await this.refreshTokensService.verifyToken(refreshToken);
    if (isUndefined(claims)) {
      this.logger.verbose(`Failed refresh.`);
      throw new UnauthorizedException();
    } else {
      const user = await this.usersService.getOne({
        where: {
          id: Equal(toNumber(claims.sub)),
        },
      });
      this.logger.verbose(`Successful refresh. (mail: ${user.email})`);
      // plainToClass allows class-transformer decorators to be called (@Transform, @Exclude)
      return plainToClass(LoginResponseDto, {
        user: user,
        accessToken: await this.accessTokensService.issueToken(user),
        refreshToken: await this.refreshTokensService.issueToken(user),
      });
    }
  }
}
