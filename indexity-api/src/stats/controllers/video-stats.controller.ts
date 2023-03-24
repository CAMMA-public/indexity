import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { VideoStats } from '../models/video-stats.model';
import { VideoStatsService } from '../services/video-stats.service';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { FindMany, User } from '../../common/decorators';
import { FindManyOptions } from 'typeorm';
import { VideoEntity } from '../../videos/entities/video.entity';
import { PaginatedData } from '../../common/interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';
import { UserEntity } from '../../users/entities/user.entity';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('stats')
@Controller('stats/videos')
export class VideoStatsController {
  constructor(
    private readonly videoStatsService: VideoStatsService,
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {}

  @Get(':videoId')
  async getOne(
    @Param('videoId', new ParseIntPipe()) videoId: number,
    @User() user: UserEntity,
  ): Promise<VideoStats> {
    await this.videoAccessValidationService.validateVideoIdAccess(
      videoId,
      user,
    );
    return this.videoStatsService.getOne(videoId);
  }

  @Get()
  async getMany(
    @FindMany() findOptions: FindManyOptions<VideoEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<VideoStats>> {
    return this.videoStatsService.protectedGetManyPaginated(user, findOptions);
  }
}
