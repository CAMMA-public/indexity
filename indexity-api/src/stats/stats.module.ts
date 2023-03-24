import { Module } from '@nestjs/common';
import { VideoStatsController } from './controllers/video-stats.controller';
import { VideosModule } from '../videos/videos.module';
import { AnnotationsModule } from '../annotations/annotations.module';
import { VideoStatsService } from './services/video-stats.service';
import { AnnotationLabelStatsService } from './services/annotation-label-stats.service';
import { AnnotationLabelStatsController } from './controllers/annotation-label-stats.controller';

@Module({
  imports: [VideosModule, AnnotationsModule],
  providers: [VideoStatsService, AnnotationLabelStatsService],
  controllers: [VideoStatsController, AnnotationLabelStatsController],
  exports: [VideoStatsService, AnnotationLabelStatsService],
})
export class StatsModule {}
