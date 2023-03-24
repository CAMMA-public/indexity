import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ImporterService } from '../../services/importer.service';
import { AdminController } from '../admin/admin.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin/importer')
export class ImporterController extends AdminController {
  @Inject()
  private readonly service: ImporterService;

  @Post()
  importOldData(@Body() body: any): Promise<void> {
    const { videos, users, annotations } = body;
    return this.service.import(videos, users, annotations);
  }
}
