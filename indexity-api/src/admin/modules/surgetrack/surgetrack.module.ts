import { Module } from '@nestjs/common';
import { SurgetrackController } from './surgetrack.controller';
import { VideosModule } from '../../../videos/videos.module';
import { AnnotationsModule } from '../../../annotations/annotations.module';
import { MulterModule } from '@nestjs/platform-express';
import { SurgetrackService } from './surgetrack.service';
import { UsersModule } from '../../../users/users.module';

@Module({
  imports: [VideosModule, AnnotationsModule, MulterModule, UsersModule],
  controllers: [SurgetrackController],
  providers: [SurgetrackService],
  exports: [SurgetrackService],
})
export class SurgetrackModule {}
