import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';
import { AnnotationLabelsService } from '../services/annotation-labels.service';
import { FindMany, FindOne, User } from '../../common/decorators';
import { UserEntity } from '../../users/entities/user.entity';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { isObject, isArray, isString } from 'lodash';
import { PaginatedData } from '../../common/interfaces';
import { Request } from 'express';
import { ValidationGroups } from '../../common/enums/validation-groups.enum';
import { AnnotationLabelTypePipe } from '../pipes/annotation-label-type.pipe';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('annotation-labels')
@Controller('annotation-labels')
export class AnnotationLabelsController {
  constructor(private readonly service: AnnotationLabelsService) {}

  @ApiOperation({ description: 'Get suggestions for labels.' })
  @ApiOkResponse({
    description: 'The server successfully build the labels suggestions.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Get('/search')
  getLabelSuggestions(
    @User() user: UserEntity,
    @FindMany() findOptions: FindManyOptions<AnnotationLabelEntity>,
    @Req() request: Request,
  ): Promise<AnnotationLabelEntity[]> {
    // TODO Support all nestjsx/crud filters
    let nameFilter: string = null;
    const isSupportedNameFilter = (val: any): boolean =>
      'string' === typeof val && val.startsWith('name||cont||');
    const getFilterValue = (val: string): string => val.split('||').pop();
    if (isSupportedNameFilter(request.query.filter)) {
      nameFilter = getFilterValue(request.query.filter);
    } else if (
      isArray(request.query.filter) &&
      isString(request.query.filter.find(isSupportedNameFilter))
    ) {
      nameFilter = getFilterValue(
        request.query.filter.find(isSupportedNameFilter),
      );
    }
    return this.service.getLabelSuggestions(user, nameFilter, findOptions.take);
  }

  @ApiOperation({ description: 'Get one annotation label.' })
  @ApiOkResponse({
    description: 'The annotation label has been successfully fetched.',
  })
  @ApiNotFoundResponse({
    description: 'The requested annotation label has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Get(':labelName')
  async getOne(
    @Param('labelName') name: string,
    @FindOne() options: FindOneOptions,
  ): Promise<AnnotationLabelEntity> {
    const optionsWithName: FindOneOptions & { where: { name: string } } = {
      ...options,
      where: {
        ...(isObject(options.where) ? options.where : {}),
        name,
      },
    };
    return this.service.getOne(optionsWithName);
  }

  @ApiOperation({ description: 'Get all annotation labels.' })
  @ApiOkResponse({
    description: 'The annotation labels have been successfully fetched.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Get()
  async getMany(
    @FindMany() options: FindManyOptions,
  ): Promise<PaginatedData<AnnotationLabelEntity>> {
    return this.service.getManyPaginated(options);
  }

  @ApiOperation({ description: 'Create an annotation label' })
  @ApiCreatedResponse({
    description: 'The annotation label has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Post()
  @UsePipes(new AnnotationLabelTypePipe())
  createOne(
    @Body(new ValidationPipe({ groups: [ValidationGroups.CREATE] }))
    payload: AnnotationLabelEntity,
  ): Promise<AnnotationLabelEntity> {
    return this.service.createOne(payload);
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body(new ValidationPipe({ groups: [ValidationGroups.UPDATE] }))
    payload: Partial<AnnotationLabelEntity>,
  ): Promise<AnnotationLabelEntity> {
    const label = await this.service.getOne({
      name: id,
    });

    return await this.service.updateOne({
      ...label,
      ...payload,
    });
  }
}
