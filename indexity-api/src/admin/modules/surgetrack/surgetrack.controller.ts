import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VideosService } from '../../../videos/services/videos.service';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRolesGuard } from '../../../auth/guards/user-roles.guard';
import { UserRoles } from '../../../auth/decorators/roles.decorator';
import { USER_ROLE } from '../../../users/models/user-roles';
import { SurgetrackService } from './surgetrack.service';
import { User } from '../../../common/decorators';
import { UserEntity } from '../../../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(UserRolesGuard)
@UserRoles(USER_ROLE.ADMIN)
@ApiTags('admin')
@Controller('admin/surgetrack')
export class SurgetrackController {
  constructor(
    private videosService: VideosService,
    private annotationsService: AnnotationsService,
    private surgeTrackService: SurgetrackService,
  ) {}

  @Post('import/video/:id')
  @UseInterceptors(FileInterceptor('file'))
  async importXMLForStream(
    @UploadedFile() file,
    @Param('id', new ParseIntPipe()) videoId: number,
    @User() user: UserEntity,
  ): Promise<any> {
    const res = await this.surgeTrackService.handleXMLFile(file, videoId);
    const builtAnnotations = this.surgeTrackService.buildAnnotationSet(
      res.contents,
      res.video,
      user,
    );

    console.log(
      builtAnnotations.map(a => a.labelName),
      '\n',
    );

    return await this.annotationsService.createMany(builtAnnotations);
  }
}
