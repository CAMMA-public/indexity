import { Controller, Delete } from '@nestjs/common';
import { AdminController } from '../admin/admin.controller';
import { VideoGroupsService } from '../../../videos/services/video-groups.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin/video-groups')
export class VideoGroupsController extends AdminController {
  constructor(private readonly videoGroupsService: VideoGroupsService) {
    super();
  }

  @Delete('reset')
  async reset(): Promise<void> {
    await this.videoGroupsService.deleteAll();
  }
}
