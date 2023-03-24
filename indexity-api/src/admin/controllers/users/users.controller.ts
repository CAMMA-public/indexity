import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Optional,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { isUndefined, uniq } from 'lodash';
import { FindManyOptions } from 'typeorm';
import { LoginResult } from '../../../auth/interfaces/login-result.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { FindMany, User } from '../../../common/decorators';
import { PaginatedData } from '../../../common/interfaces';
import { UserStatsResponseBodyDto } from '../../dtos/users/user-stats-response-body.dto';
import { VideoEntity } from '../../../videos/entities/video.entity';
import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';
import { VideoGroupEntity } from '../../../videos/entities/video-group.entity';
import { VideosService } from '../../../videos/services/videos.service';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { VideoGroupsService } from '../../../videos/services/video-groups.service';
import { CreateAnnotatorDto } from '../../../users/dtos/user.dto';
import { UserEntity } from '../../../users/entities/user.entity';
import { EmailAlreadyUsedError } from '../../../users/errors/email-already-used.error';
import { EmailAlreadyRegisteredFilter } from '../../../users/filters/email-already-registered.filter';
import { USER_ROLE } from '../../../users/models/user-roles';
import { UsersService } from '../../../users/services/users.service';
import { CreateUserRequestBodyDto } from '../../dtos/users/create-user-request-body.dto';
import { CreateUserResponseBodyDto } from '../../dtos/users/create-user-response-body.dto';
import { AdminController } from '../admin/admin.controller';
import { UserActivationHashEntity } from '../../../users/entities/user-activation-hash.entity';
import { UserActivationHashService } from '../../../users/services/user-activation-hash.service';
import { UpdateUserResponseBodyDto } from '../../dtos/users/update-user-response-body.dto';
import { UpdateUserRequestBodyDto } from '../../dtos/users/update-user-request-body.dto';
import { PasswordResetHashService } from '../../../users/services/password-reset-hash.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin/users')
export class UsersController extends AdminController {
  constructor(
    private activationHashService: UserActivationHashService,
    private authService: AuthService,
    private usersService: UsersService,
    private readonly videoService: VideosService,
    private readonly annotationService: AnnotationsService,
    private readonly groupService: VideoGroupsService,
    private readonly passwordResetHashService: PasswordResetHashService,
    @Optional()
    private readonly logger: Logger = new Logger('UsersController'),
  ) {
    super();
  }

  @Get(':id')
  getOne(@Param('id', new ParseIntPipe()) id: number): Promise<UserEntity> {
    return this.usersService.getOne(id);
  }

  @Get()
  getMany(
    @FindMany() findOptions: FindManyOptions<UserEntity>,
  ): Promise<PaginatedData<UserEntity>> {
    return this.usersService.getManyPaginated(findOptions);
  }

  @Delete(':id')
  async deleteUser(
    @User() user: UserEntity,
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<UserEntity> {
    if (user.id === userId) {
      throw new HttpException(
        'Impossible to delete current user',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userToDelete = await this.usersService.getOne(userId);
    return this.usersService.deleteOne(userToDelete);
  }

  @Delete(':id/disable')
  disableUser(
    @User() user: UserEntity,
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<UserEntity> {
    if (user.id === userId) {
      throw new HttpException(
        'Impossible to deactivate current user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.disable(userId);
  }

  @Post(':id/enable')
  enableUser(@Param('id') userId: number): Promise<UserEntity> {
    return this.usersService.enable(userId);
  }
  @Post('annotator')
  @UseFilters(new EmailAlreadyRegisteredFilter())
  async createAnnotator(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    user: CreateAnnotatorDto,
  ): Promise<LoginResult> {
    const exists = await this.usersService.getOne({
      email: user.email,
    });

    if (isUndefined(exists)) {
      const createdUser = await this.usersService.createOne(user.buildEntity());
      return this.authService.login({
        email: createdUser.email,
        password: user.password,
      });
    } else {
      throw new EmailAlreadyUsedError(user.email);
    }
  }

  @Post('moderator')
  @UseFilters(new EmailAlreadyRegisteredFilter())
  createModerator(@Body() user): Promise<UserEntity> {
    return this.usersService.createOne({
      ...user,
      roles: [USER_ROLE.ANNOTATOR, USER_ROLE.MODERATOR],
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() data: Partial<UserEntity>): Promise<UserEntity> {
    return this.usersService.resetPassword(data);
  }

  @Post('admin')
  @UseFilters(new EmailAlreadyRegisteredFilter())
  async createAdmin(@Body() user): Promise<UserEntity> {
    return await this.usersService.createOne({
      ...user,
      roles: [USER_ROLE.ANNOTATOR, USER_ROLE.MODERATOR, USER_ROLE.ADMIN],
    });
  }

  @Delete('reset')
  async reset(): Promise<void> {
    const users = await this.usersService.getMany();
    const nonAdminUsers = users.filter(
      user => !user.roles.includes(USER_ROLE.ADMIN),
    );
    if (!nonAdminUsers || nonAdminUsers == null) {
      throw new NotFoundException('No users Found');
    }
    const nonAdminUserIds = Object.values(nonAdminUsers.map(user => user.id));
    nonAdminUserIds.map(async userId => {
      return await this.usersService.disable(userId);
    });
  }

  @Patch(':id/promote')
  async promoteUser(
    @Param('id', new ParseIntPipe()) userId: number,
    @Body() updatePayload: { role: USER_ROLE },
  ): Promise<UpdateUserResponseBodyDto> {
    const existing = await this.usersService.getOne(userId);
    if (!(existing instanceof UserEntity)) {
      throw new NotFoundException();
    }

    if (!Object.values(USER_ROLE).includes(updatePayload.role)) {
      throw new HttpException('Unknown role', HttpStatus.BAD_REQUEST);
    }

    if (existing.roles.includes(updatePayload.role)) {
      return existing;
    } else {
      existing.roles.push(updatePayload.role);
      return this.usersService.updateOne({ ...existing });
    }
  }

  @Patch(':id/demote')
  async demoteUser(
    @User() user: UserEntity,
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<UpdateUserResponseBodyDto> {
    if (user.id === userId) {
      throw new HttpException(
        'Impossible to demote current user',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existing = await this.usersService.getOne(userId);
    if (!(existing instanceof UserEntity)) {
      throw new NotFoundException();
    }
    return this.usersService.updateOne({
      ...existing,
      roles: [USER_ROLE.ANNOTATOR],
    });
  }

  @Post()
  async createUser(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    user: CreateUserRequestBodyDto,
  ): Promise<CreateUserResponseBodyDto> {
    return this.usersService.createOne(user);
  }

  @Patch(':id')
  async updateUser(
    @User() user: UserEntity,
    @Param('id', new ParseIntPipe()) userId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updatePayload: UpdateUserRequestBodyDto,
  ): Promise<UpdateUserResponseBodyDto> {
    if (user.id === userId) {
      if (
        typeof updatePayload.isActivated !== 'undefined' &&
        !updatePayload.isActivated
      ) {
        throw new HttpException(
          'Impossible to deactivate current user',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        typeof updatePayload.roles !== 'undefined' &&
        !updatePayload.roles.includes(USER_ROLE.ADMIN)
      ) {
        throw new HttpException(
          'Impossible to demote current user: roles should include ADMIN',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const existing = await this.usersService.getOne(userId);
    if (!(existing instanceof UserEntity)) {
      throw new NotFoundException();
    }
    return this.usersService.updateOne({ ...existing, ...updatePayload });
  }

  @Post(':id/activate')
  async activateUser(
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<void> {
    const existingUser = await this.usersService.getOne(userId);
    if (!(existingUser instanceof UserEntity)) {
      throw new NotFoundException();
    }
    await this.usersService.updateOne({ ...existingUser, isActivated: true });
    const existingActivationHash = await this.activationHashService.getOne({
      where: { userId: existingUser.id },
    });
    if (existingActivationHash instanceof UserActivationHashEntity) {
      await this.activationHashService.deleteOne(existingActivationHash);
    }
  }

  @Get(':id/stats')
  async getUserStats(
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<UserStatsResponseBodyDto> {
    return {
      ...(await this.usersService
        .getOne(userId)
        .then(({ name, email, ipAddress, createdAt }) => ({
          name,
          email,
          ipAddress,
          createdAt,
        }))),
      uploadedVideoIds: await this.videoService
        .getMany({ where: { userId }, select: ['id'], order: { id: 'ASC' } })
        .then((rows: { id?: VideoEntity['id'] }[]) => rows.map(({ id }) => id)),
      annotatedVideoIds: await this.annotationService
        .getMany({
          where: { userId },
          select: ['videoId'],
          order: { videoId: 'ASC' },
        })
        .then((rows: { videoId: VideoEntity['id'] }[]) =>
          rows.map(({ videoId }) => videoId),
        )
        .then(uniq),
      annotationCount: await this.annotationService
        .getManyPaginated({ where: { userId }, take: 0 })
        .then((data: PaginatedData) => data.total),
      annotationIds: await this.annotationService
        .getMany({ where: { userId }, select: ['id'], order: { id: 'ASC' } })
        .then((rows: { id?: AnnotationEntity['id'] }[]) =>
          rows.map(({ id }) => id),
        ),
      groupIds: await this.groupService
        .getMany({ where: { userId }, select: ['id'], order: { id: 'ASC' } })
        .then((rows: { id?: VideoGroupEntity['id'] }[]) =>
          rows.map(({ id }) => id),
        ),
    };
  }

  @Post(':id/send-activation-email')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendActivationEmail(
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<void> {
    const user = await this.usersService.getOne(userId).catch((err: Error) => {
      this.logger.error(`Unknown user with id: ${userId}`, err.stack);
      throw err;
    });
    // TODO
    // - Add an exception filter mapping thrown error if the given user is already actived to BadRequestException
    await this.usersService.sendActivationEmail(user).catch((err: Error) => {
      this.logger.error(
        `Failed to send the activation email to ${user.email}`,
        err.stack,
      );
      throw new HttpException(
        `Failed to send the activation email.`,
        HttpStatus.BAD_GATEWAY,
      );
    });
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post(':id/send-password-reset-email')
  async sendPasswordResetEmail(
    @Param('id', new ParseIntPipe()) userId: number,
  ): Promise<void> {
    const user = await this.usersService.getOne(userId).catch((err: Error) => {
      this.logger.error(`Unknown user with id: ${userId}`, err.stack);
      throw err;
    });
    // GenericUpdateService.updateOne will update the existing hash or create a new one.
    const resetHash = await this.passwordResetHashService.updateOne({
      user,
      userId: user.id,
      hash: this.passwordResetHashService.generateHash(),
    });
    return this.usersService
      .sendPasswordResetEmail(user, resetHash)
      .catch((err: Error) => {
        this.logger.error(
          `Failed to send the reset email to ${user.email}`,
          err.stack,
        );
        throw new HttpException(
          `Failed to send the reset email.`,
          HttpStatus.BAD_GATEWAY,
        );
      });
  }
}
