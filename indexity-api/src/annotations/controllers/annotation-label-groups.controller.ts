import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { AnnotationLabelsService } from '../services/annotation-labels.service';
import { ValidationGroups } from '../../common/enums/validation-groups.enum';
import { FindMany, FindOne, User } from '../../common/decorators';
import { UserEntity } from '../../users/entities/user.entity';
import { AnnotationLabelGroupEntity } from '../entities/annotation-label-group.entity';
import { AnnotationLabelGroupsService } from '../services/annotation-label-groups.service';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PaginatedData } from '../../common/interfaces';
import { userIsAdminOrMod } from '../../users/helpers/user.helpers';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('annotation-label-groups')
@Controller('annotation-label-groups')
export class AnnotationLabelGroupsController {
  constructor(
    private readonly annotationLabelsService: AnnotationLabelsService,
    private readonly annotationLabelGroupsService: AnnotationLabelGroupsService,
  ) {}

  @Get()
  getMany(
    @FindMany() findManyOptions: FindManyOptions<AnnotationLabelGroupEntity>,
  ): Promise<PaginatedData<AnnotationLabelGroupEntity>> {
    return this.annotationLabelGroupsService.getManyPaginated(findManyOptions);
  }

  @Get(':id')
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @FindOne() findOneOptions: FindOneOptions<AnnotationLabelGroupEntity>,
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.annotationLabelGroupsService.getOne({
      ...findOneOptions,
      where: { id },
    });

    return group;
  }

  @ApiOperation({ description: 'Create an annotation label group' })
  @ApiCreatedResponse({
    description: 'The annotation label group has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Post()
  createOne(
    @Body(new ValidationPipe({ groups: [ValidationGroups.CREATE] }))
    payload: AnnotationLabelGroupEntity,
    @User()
    user: UserEntity,
  ): Promise<AnnotationLabelGroupEntity> {
    return this.annotationLabelGroupsService.createOne({
      ...payload,
      user,
      labels: [],
      videoGroups: [],
    });
  }

  @ApiOperation({ description: 'Update one label group.' })
  @ApiOkResponse({
    description: 'The annotation has been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'The requested group has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Patch(':id')
  async updateOne(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ groups: [ValidationGroups.UPDATE] }))
    payload: Partial<AnnotationLabelGroupEntity>,
    @User()
    user: UserEntity,
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.annotationLabelGroupsService.getOne(id);

    if (!userIsAdminOrMod(user) && group.userId !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.annotationLabelGroupsService.updateOne({
      ...group,
      ...payload,
      id,
    });
  }

  @Post(':id/labels')
  async addLabelsIds(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() labelNames: string[],
    @User() user: UserEntity,
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.annotationLabelGroupsService.getOne({
      where: { id },
    });

    if (!userIsAdminOrMod(user) && group.userId !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.annotationLabelGroupsService.addLabels(
      group.id,
      labelNames,
    );
  }

  @Delete(':id/labels')
  async removeLabelsIds(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() labelNames: string[],
    @User() user: UserEntity,
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.annotationLabelGroupsService.getOne({
      where: { id },
    });

    if (!userIsAdminOrMod(user) && group.userId !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.annotationLabelGroupsService.removeLabels(
      group.id,
      labelNames,
    );
  }

  @Delete(':id')
  async removeGroup(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() labelNames: string[],
    @User() user: UserEntity,
  ): Promise<AnnotationLabelGroupEntity> {
    const group = await this.annotationLabelGroupsService.getOne({
      where: { id },
    });

    if (!userIsAdminOrMod(user) && group.userId !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.annotationLabelGroupsService.deleteOne(group);
  }
}
