import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnotationsService } from './services/annotations.service';
import { AnnotationEntity } from './entities/annotation.entity';
import { AnnotationsController } from './controllers/annotations.controller';
import { AnnotationsSubscriber } from './subscribers/annotations.subscriber';
import { AnnotationsGateway } from './gateways/annotations.gateway';
import { AnnotationLabelEntity } from './entities/annotation-label.entity';
import { AnnotationLabelsController } from './controllers/annotation-labels.controller';
import { AnnotationLabelsService } from './services/annotation-labels.service';
import { AnnotationLabelsGateway } from './gateways/annotation-labels.gateway';
import { AnnotationLabelsSubscriber } from './subscribers/annotation-labels.subscriber';
import { VideosModule } from '../videos/videos.module';
import { AnnotationLabelGroupsService } from './services/annotation-label-groups.service';
import { AnnotationLabelGroupsController } from './controllers/annotation-label-groups.controller';
import { StructureTrackerModule } from '../structure-tracker/structure-tracker.module';
import { AnnotationInterpolationInterceptor } from './interceptors/annotation-interpolation.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnnotationEntity, AnnotationLabelEntity]),
    forwardRef(() => VideosModule),
    forwardRef(() => StructureTrackerModule),
  ],
  providers: [
    AnnotationsService,
    AnnotationsSubscriber,
    AnnotationsGateway,
    AnnotationLabelsService,
    AnnotationLabelGroupsService,
    AnnotationLabelsGateway,
    AnnotationLabelsSubscriber,
    AnnotationInterpolationInterceptor,
  ],
  controllers: [
    AnnotationsController,
    AnnotationLabelsController,
    AnnotationLabelGroupsController,
  ],
  exports: [
    AnnotationsService,
    AnnotationLabelsService,
    AnnotationLabelGroupsService,
    AnnotationInterpolationInterceptor,
  ],
})
export class AnnotationsModule {}
