import { HttpModule, Module, forwardRef } from '@nestjs/common';
import { TrackerController } from './controllers/tracker.controller';
import { StructureTrackerService } from './services/structure-tracker.service';
import { AnnotationsModule } from '../annotations/annotations.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  controllers: [TrackerController],
  providers: [StructureTrackerService],
  imports: [
    forwardRef(() => AnnotationsModule),
    forwardRef(() => VideosModule),
    HttpModule,
  ],
  exports: [StructureTrackerService],
})
export class StructureTrackerModule {}
