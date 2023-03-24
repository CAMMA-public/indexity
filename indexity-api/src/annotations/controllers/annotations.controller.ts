import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AnnotationsService } from '../services/annotations.service';
import { StructureTrackerService } from '../../structure-tracker/services/structure-tracker.service';
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
import { AnnotationEntity } from '../entities/annotation.entity';
import { FindMany, FindOne, User } from '../../common/decorators';
import { ValidationGroups } from '../../common/enums/validation-groups.enum';
import { FindConditions, FindManyOptions, FindOneOptions } from 'typeorm';
import { ArrayValidationPipe } from '../../common/pipes/array-validation.pipe';
import { PaginatedData } from '../../common/interfaces';
import { isObject } from 'lodash';
import { AnnotationsGateway } from '../gateways/annotations.gateway';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';
import { OriginalVideosService } from '../../videos/services/original-videos.service';
import { AnnotationInterpolationInterceptor } from '../interceptors/annotation-interpolation.interceptor';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('annotations')
@Controller('annotations')
export class AnnotationsController {
  constructor(
    private readonly structureTrackerService: StructureTrackerService,
    private readonly annotationsService: AnnotationsService,
    private readonly annotationsGateway: AnnotationsGateway,
    private readonly videoService: OriginalVideosService,
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {}

  @ApiOperation({ description: 'Create an annotation.' })
  @ApiCreatedResponse({
    description: 'The annotation has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Post()
  async createOne(
    @Body(new ValidationPipe({ groups: [ValidationGroups.CREATE] }))
    payload: AnnotationEntity,
    @User()
    user: UserEntity,
  ): Promise<AnnotationEntity> {
    await this.videoAccessValidationService.validateVideoIdAccess(
      payload.videoId,
      user,
    );
    return this.annotationsService.createOne({ ...payload, userId: user.id });
  }

  @ApiOperation({ description: 'Create many annotations.' })
  @ApiCreatedResponse({
    description: 'The annotations have been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Post('/bulk')
  async createMany(
    @Body(
      'bulk',
      new ArrayValidationPipe(AnnotationEntity, {
        groups: [ValidationGroups.CREATE],
      }),
    )
    payload: AnnotationEntity[],
    @User()
    user: UserEntity,
  ): Promise<AnnotationEntity[]> {
    const annotations = await Promise.all(
      payload.map(async p => {
        await this.videoAccessValidationService.validateVideoIdAccess(
          p.videoId,
          user,
        );
        return { ...p, userId: user.id };
      }),
    );
    return this.annotationsService.createMany(annotations);
  }

  @ApiOperation({ description: 'Get one annotation.' })
  @ApiOkResponse({
    description: 'The annotation has been successfully fetched.',
  })
  @ApiNotFoundResponse({
    description: 'The requested annotation has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @UseInterceptors(AnnotationInterpolationInterceptor)
  @Get(':id')
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @FindOne() findOneOptions: FindOneOptions<AnnotationEntity>,
    @User() user: UserEntity,
  ): Promise<AnnotationEntity> {
    const annotation = await this.annotationsService.getOne({
      ...findOneOptions,
      where: {
        ...(isObject(findOneOptions.where)
          ? (findOneOptions.where as FindConditions<AnnotationEntity>)
          : {}),
        id,
      },
    });
    await this.videoAccessValidationService.validateVideoIdAccess(
      annotation.videoId,
      user,
    );
    return annotation;
  }

  @ApiOperation({ description: 'Get all annotations.' })
  @ApiOkResponse({
    description: 'The annotations have been successfully fetched.',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @UseInterceptors(AnnotationInterpolationInterceptor)
  @Get()
  async getMany(
    @FindMany() findManyOptions: FindManyOptions<AnnotationEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<AnnotationEntity>> {
    return this.annotationsService.protectedGetManyPaginated(
      user,
      findManyOptions,
    );
  }

  @ApiOperation({ description: 'Update one annotation.' })
  @ApiOkResponse({
    description: 'The annotation has been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'The requested annotation has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Patch(':id')
  async updateOne(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ groups: [ValidationGroups.UPDATE] }))
    payload: Partial<AnnotationEntity>,
    @User() user: UserEntity,
  ): Promise<AnnotationEntity> {
    const annotation = await this.annotationsService.getOne(id);
    await this.videoAccessValidationService.validateVideoIdAccess(
      annotation.videoId,
      user,
    );
    const trackersUsingAnnotation = await this.structureTrackerService.getMany({
      where: { annotationId: id },
    });
    if (trackersUsingAnnotation.length > 0) {
      throw new HttpException(
        'Annotation used by a tracker',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedAnnotation = await this.annotationsService.updateOne({
      ...annotation,
      ...payload,
      id,
    });
    return updatedAnnotation;
  }

  @ApiOperation({ description: 'Delete one annotation.' })
  @ApiOkResponse({
    description: 'The annotation has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'The requested annotation has not been found. ',
  })
  @ApiUnauthorizedResponse({
    description:
      'You do not have sufficient privileges to query against this route. ',
  })
  @Delete(':id')
  async removeOne(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<AnnotationEntity> {
    const annotation = await this.annotationsService.getOne(id);
    await this.videoAccessValidationService.validateVideoIdAccess(
      annotation.videoId,
      user,
    );
    const trackersUsingAnnotation = await this.structureTrackerService.getMany({
      where: { annotationId: id },
    });
    if (trackersUsingAnnotation.length > 0) {
      throw new HttpException(
        'Annotation used by a tracker',
        HttpStatus.BAD_REQUEST,
      );
    }

    // FIXME: Using the subscriber to emit the event would be more reliable
    // but 'afterRemove' subscriber cannot access the entity id, which is needed in the UI
    // TypeORM issue: https://github.com/typeorm/typeorm/issues/4058
    await this.annotationsService.deleteOne(annotation);
    this.annotationsGateway.emitAnnotationDeleteSuccess(annotation);
    return annotation;
  }
}
