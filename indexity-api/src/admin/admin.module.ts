import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { VideosModule } from '../videos/videos.module';
import { AdminController } from './controllers/admin/admin.controller';
import { UsersController } from './controllers/users/users.controller';
import { AnnotationsController } from './controllers/annotations/annotations.controller';
import { AnnotationsModule } from '../annotations/annotations.module';
import { ImporterService } from './services/importer.service';
import { ImporterController } from './controllers/importer/importer.controller';

import { VideoGroupsController } from './controllers/videos/video-groups.controller';
import { AnnotationLabelsController } from './controllers/annotations/annotation-labels.controller';
import { SurgetrackModule } from './modules/surgetrack/surgetrack.module';
import { VideosController } from './controllers/videos/videos.controller';
import { SystemController } from './controllers/system/system.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { SettingsModule } from './../settings/settings.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    VideosModule,
    AnnotationsModule,
    SurgetrackModule,
    SettingsModule,
  ],
  controllers: [
    AdminController,
    UsersController,
    AnnotationsController,
    ImporterController,
    VideosController,
    VideoGroupsController,
    AnnotationLabelsController,
    SystemController,
    SettingsController,
  ],
  providers: [ImporterService],
})
export class AdminModule {}
