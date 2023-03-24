import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { VideoEntity } from '../entities/video.entity';
import { VideoGroupsService } from '../services/video-groups.service';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { FindMany, FindOne, User } from '../../common/decorators';
import { VideosService } from '../services/videos.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { isEmpty, merge } from 'lodash';
import { UserEntity } from '../../users/entities/user.entity';
import { PaginatedData } from '../../common/interfaces';
import { AnnotationLabelGroupsService } from '../../annotations/services/annotation-label-groups.service';
import { UsersService } from '../../users/services/users.service';
import { VideoAccessValidationService } from '../services/video-access-validation.service';
import { userIsAdmin, userIsInternal } from '../../users/helpers/user.helpers';
import { UserRoles } from '../../auth/decorators/roles.decorator';
import { USER_ROLE } from '../../users/models/user-roles';
import { VideoGroupDto } from '../dtos/create-video-group.dto';

@ApiBearerAuth()
@ApiTags('video-groups')
@UseGuards(UserRolesGuard)
@Controller('video-groups')
export class VideoGroupsController {
  constructor(
    private readonly groupsService: VideoGroupsService,
    private readonly videosService: VideosService,
    private readonly annotationLabelGroupsService: AnnotationLabelGroupsService,
    private readonly usersService: UsersService,
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {}

  @ApiOperation({ description: 'Create a video group.' })
  @ApiCreatedResponse({
    description: 'The video group has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Post()
  @UserRoles(USER_ROLE.ADMIN, USER_ROLE.MODERATOR)
  createOne(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    group: VideoGroupDto,
    @User() user: UserEntity,
  ): Promise<VideoGroupEntity> {
    return this.groupsService.createOne({
      ...group,
      user,
    });
  }

  @ApiOperation({ description: 'Get all video groups.' })
  @ApiOkResponse({
    description: 'The video groups have been successfully fetched.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Get()
  async getMany(
    @FindMany() findManyOptions: FindManyOptions<VideoGroupEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<VideoGroupEntity>> {
    return this.groupsService.protectedGetManyPaginated(user, findManyOptions);
  }

  @ApiOperation({ description: 'Get one video group.' })
  @ApiOkResponse({
    description: 'The video group has been successfully fetched.',
  })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Get(':id')
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
    @FindOne() findOneOptions: FindOneOptions<VideoGroupEntity>,
  ): Promise<VideoGroupEntity> {
    const foundGroup = await this.groupsService.getOne({
      ...findOneOptions,
      where: { id },
    });
    await this.videoAccessValidationService.validateVideoGroupAccess(
      foundGroup,
      user,
    );
    return foundGroup;
  }

  @ApiOperation({ description: 'Update one video group.' })
  @ApiOkResponse({
    description: 'The video group has been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Patch(':id')
  async updateOne(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() payload: Partial<VideoGroupEntity>,
    @User() user: UserEntity,
  ): Promise<VideoGroupEntity> {
    const group = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupManagement(
      group,
      user,
    );
    if (payload.annotationLabelGroupId) {
      group.annotationLabelGroup = await this.annotationLabelGroupsService.getOne(
        { id: payload.annotationLabelGroupId },
      );
    }
    if (payload.annotationLabelGroupId === null) {
      group.annotationLabelGroup = null;
      delete payload.annotationLabelGroupId;
    }
    const updatedGroup = await this.groupsService.updateOne(
      merge(group, payload, { id }),
    );
    return updatedGroup;
  }

  @ApiOperation({ description: 'Delete one video group.' })
  @ApiOkResponse({
    description: 'The video group has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Delete(':id')
  async removeOne(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<VideoGroupEntity> {
    const group = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupManagement(
      group,
      user,
    );
    return this.groupsService.deleteOne(group);
  }

  @ApiOperation({ description: 'Get all videos from video group.' })
  @ApiOkResponse({ description: 'The videos have been successfully deleted.' })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Get(':id/videos')
  async getVideos(
    @Param('id', new ParseIntPipe()) id: number,
    @FindMany() findOptions: FindManyOptions<VideoEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<VideoEntity>> {
    const videoGroup = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupAccess(
      videoGroup,
      user,
    );
    const paginatedVideos: PaginatedData<VideoEntity> =
      videoGroup.videoIds.length === 0
        ? { data: [], total: 0 }
        : await this.videosService.getManyPaginated(
            merge(findOptions, { where: { id: In(videoGroup.videoIds) } }),
          );
    return paginatedVideos;
  }

  @ApiOperation({ description: 'Add videos to video group.' })
  @ApiOkResponse({
    description: 'The videos have been successfully added to the video group.',
  })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @HttpCode(HttpStatus.OK)
  @Post(':id/videos')
  async addVideos(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() videoIds: number[],
    @User() user: UserEntity,
  ): Promise<VideoGroupEntity> {
    const group = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupManagement(
      group,
      user,
    );
    const videosToAdd = !isEmpty(videoIds)
      ? await this.videosService.getMany({ where: { id: In(videoIds) } })
      : [];
    return this.groupsService.addVideos(group, videosToAdd);
  }

  @ApiOperation({ description: 'Remove videos from video group.' })
  @ApiOkResponse({
    description:
      'The videos have been successfully removed from the video group.',
  })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Delete(':id/videos')
  async removeVideos(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() videoIds: number[],
    @User() user: UserEntity,
  ): Promise<VideoGroupEntity> {
    const group = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupManagement(
      group,
      user,
    );
    const videosToRemove = !isEmpty(videoIds)
      ? await this.videosService.getMany({ where: { id: In(videoIds) } })
      : [];
    return this.groupsService.removeVideos(group, videosToRemove);
  }
  @ApiOperation({ description: 'Set the video relations of video group.' })
  @ApiOkResponse({
    description:
      'The video relations have been successfully established for the video group.',
  })
  @ApiNotFoundResponse({
    description: 'The requested video group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Patch(':id/videos')
  async updateVideos(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() videoIds: number[],
    @User() user: UserEntity,
  ): Promise<VideoGroupEntity> {
    const group = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupManagement(
      group,
      user,
    );
    const videoToSet = !isEmpty(videoIds)
      ? await this.videosService.getMany({ where: { id: In(videoIds) } })
      : [];
    return this.groupsService.updateVideos(group, videoToSet);
  }

  @Patch(':id/users/:userId')
  async grantAccessToUser(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('userId', new ParseIntPipe()) userId: number,
    @User() currentUser: UserEntity,
  ): Promise<void> {
    const videoGroup = await this.groupsService.getOne({
      where: { id },
      relations: ['allowedUsers'],
    });
    await this.videoAccessValidationService.validateVideoGroupManagement(
      videoGroup,
      currentUser,
    );
    if (
      this.videoAccessValidationService.userBelongsToGroup(userId, videoGroup)
    ) {
      throw new HttpException(
        `User ${userId} already has access to this group`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.usersService.getOne(userId);
    if (userIsAdmin(user) || userIsInternal(user)) {
      throw new HttpException(
        `User ${userId} already has access to this group`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.groupsService.addUserToGroup(user, videoGroup);
  }

  @Get(':id/users')
  async getUsers(
    @Param('id', new ParseIntPipe()) id: number,
    @FindMany() findOptions: FindManyOptions<UserEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<UserEntity>> {
    const videoGroup = await this.groupsService.getOne(id);
    await this.videoAccessValidationService.validateVideoGroupManagement(
      videoGroup,
      user,
    );
    return videoGroup.allowedUserIds.length === 0
      ? { data: [], total: 0 }
      : await this.usersService.getManyPaginated(
          merge(findOptions, {
            where: {
              id: In(videoGroup.allowedUserIds),
            },
          }),
        );
  }
  @Delete(':id/users/:userId')
  async removeUser(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('userId', new ParseIntPipe()) userId: number,
    @User() currentUser: UserEntity,
  ): Promise<void> {
    const videoGroup = await this.groupsService.getOne({
      where: { id },
      relations: ['allowedUsers'],
    });
    await this.videoAccessValidationService.validateVideoGroupManagement(
      videoGroup,
      currentUser,
    );
    const user = await this.usersService.getOne(userId);
    if (!videoGroup.allowedUserIds.includes(userId)) {
      throw new HttpException(
        `User ${userId} does not belong to group ${id} or cannot be removed from it`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.groupsService.removeUserFromGroup(user, videoGroup);
  }
}
