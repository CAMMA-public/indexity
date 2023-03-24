import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Query,
  UseFilters,
  ValidationPipe,
  Head,
  Param,
  Inject,
  Get,
  UseGuards,
  Logger,
  Optional,
  HttpException,
} from '@nestjs/common';

import { LoginResult } from '../../auth/interfaces/login-result.interface';
import { AuthService } from '../../auth/services/auth.service';
import { ActivationRequestQueryDto } from '../dtos/activate-request-query.dto';
import { PasswordUpdateQueryDto } from '../dtos/password-update-query.dto';
import { PasswordUpdateRequestDto } from '../dtos/password-update-request.dto';
import { ResetPasswordRequestDto } from '../dtos/reset-password-request.dto';
import { CreateAnnotatorDto } from '../dtos/user.dto';
import { PasswordResetHashEntity } from '../entities/password-reset-hash.entity';
import { UserActivationHashEntity } from '../entities/user-activation-hash.entity';
import { UserEntity } from '../entities/user.entity';
import { EmailAlreadyUsedError } from '../errors/email-already-used.error';
import { EmailAlreadyRegisteredFilter } from '../filters/email-already-registered.filter';
import { PasswordResetHashService } from '../services/password-reset-hash.service';
import { PasswordResetService } from '../services/password-reset.service';
import { UserActivationHashService } from '../services/user-activation-hash.service';
import { UsersService } from '../services/users.service';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { AppConfiguration } from '../../config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindMany } from '../../common/decorators';
import { FindManyOptions, Raw } from 'typeorm';
import { PaginatedData } from '../../common/interfaces';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { USER_ROLE } from '../models/user-roles';
import { merge } from 'lodash';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly resetHashService: PasswordResetHashService,
    private readonly passwordResetService: PasswordResetService,
    private readonly userActivationHashService: UserActivationHashService,
    @Optional() private readonly logger: Logger = new Logger('UserController'),
    @Inject(CONFIGURATION) private readonly cfg: AppConfiguration,
  ) {}

  @Get()
  @UseGuards(UserRolesGuard)
  getMany(
    @FindMany() findOptions: FindManyOptions<UserEntity>,
  ): Promise<PaginatedData<UserEntity>> {
    return this.userService.getManyPaginated(
      merge(findOptions, {
        where: {
          isActivated: true,
          roles: Raw(
            alias =>
              `('${USER_ROLE.ADMIN}' != ALL(${alias})) AND '${USER_ROLE.INTERNAL}' != ALL(${alias})`,
          ),
        },
      }),
    );
  }

  @Post('annotator')
  @UseFilters(new EmailAlreadyRegisteredFilter())
  async createAnnotator(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    user: CreateAnnotatorDto,
  ): Promise<UserEntity> {
    if (await this.userService.emailExists(user.email)) {
      throw new EmailAlreadyUsedError(user.email);
    }
    user.isActivated = false;
    return this.userService.createOne(user.buildEntity());
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestPasswordReset(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    resetPasswordPayload: ResetPasswordRequestDto,
  ): Promise<void> {
    const { email } = resetPasswordPayload;
    const user = await this.userService
      .getOne({ email })
      .catch((err: Error) => {
        this.logger.error(`Unknown user with email: ${email}`, err.stack);
        throw err;
      });
    if (user instanceof UserEntity) {
      await this.passwordResetService
        .requestPasswordReset(user)
        .catch((err: Error) => {
          this.logger.error(
            `Failed to send the reset password email to ${user.email}`,
            err.stack,
          );
          throw new HttpException(
            `Failed to send the reset password email.`,
            HttpStatus.BAD_GATEWAY,
          );
        });
    }
  }

  @Patch('reset-password')
  async handlePasswordReset(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: PasswordUpdateQueryDto,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: PasswordUpdateRequestDto,
  ): Promise<LoginResult> {
    const { hash } = query;
    const resetHashEntity = await this.resetHashService.getOne({
      where: { hash },
      relations: ['user'],
    });
    if (resetHashEntity instanceof PasswordResetHashEntity) {
      const { password } = body;
      const { email } = resetHashEntity.user;
      // Update password an log in
      await this.passwordResetService.performPasswordReset(
        resetHashEntity,
        password,
      );
      return this.authService.login({ email, password });
    } else {
      // No such hash found in the database
      throw new NotFoundException();
    }
  }

  @Post('activate')
  async activateAccount(
    @Query() query: ActivationRequestQueryDto,
  ): Promise<LoginResult> {
    const { hash } = query;
    // Look for the given hash validity
    const activationHash = await this.userActivationHashService.getOne({
      where: { hash },
      relations: ['user'],
    });
    if (activationHash instanceof UserActivationHashEntity) {
      // The given hash is valid.
      const { user } = activationHash;
      // Activate the user account
      user.isActivated = true;
      await this.userService.updateOne(user);
      // Destroy the activation hash record
      await this.userActivationHashService.deleteOne(activationHash);
      return this.authService.login(user);
    } else {
      // No such hash in the database records
      throw new NotFoundException();
    }
  }

  @Head('activation-hash/:hash')
  async checkIfHashExists(@Param('hash') hash: string): Promise<void> {
    const activationHash = await this.userActivationHashService.getOne({
      where: { hash },
    });
    if (!(activationHash instanceof UserActivationHashEntity)) {
      throw new NotFoundException();
    }
  }

  @Head('password-reset-hash/:hash')
  async checkIfPasswordHashExists(@Param('hash') hash: string): Promise<void> {
    const passwordHash = await this.resetHashService.getOne({
      where: { hash },
    });
    if (!(passwordHash instanceof PasswordResetHashEntity)) {
      throw new NotFoundException();
    }
  }
}
