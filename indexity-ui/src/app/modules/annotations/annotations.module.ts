import { NgModule } from '@angular/core';
import { AnnotationsViewLayoutComponent } from '@app/annotations/annotations-view-layout.component';
import { CommonModule } from '@angular/common';
import { AnnotationsRoutingModule } from '@app/annotations/annotations-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AnnotationLabelsEffects } from '@app/annotation-labels-store/annotation-labels.effects';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AnnotationEffects } from '@app/annotations-store/effects/annotation.effects';
import * as fromAnnotations from '@app/annotations-store';
import * as fromSettings from '@app/settings-store';
import * as fromAnnotationLabels from '@app/annotation-labels-store';
import { SocketService } from '@app/annotations/services/socket.service';

import { LocalStorageService } from '@app/annotations/services/local-storage.service';
import { AnnotationsStoreFacade } from '@app/annotations-store/facades/annotations.store-facade';
import { AnnotationsService } from '@app/annotations/services/annotations.service';
import { StructureTrackerService } from '@app/annotations/services/structure-tracker.service';
import { AnnotationsSocketService } from '@app/annotations/services/annotations-socket.service';
import { AnnotationLabelsStoreFacade } from '@app/annotation-labels-store/annotation-labels-store-facade.service';
import { AnnotationLabelsSocketService } from '@app/annotations/services/annotation-labels-socket.service';
import { AnnotationLabelsService } from '@app/annotations/services/annotation-labels.service';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { VideosSocketService } from '@app/annotations/services/videos-socket.service';
import { VideoStatsService } from '@app/annotations/services/video-stats.service';
import { SettingsStoreFacade } from '@app/settings-store/settings.store-facade';
import { VideoGroupsService } from '@app/annotations/services/video-groups.service';
import { VideoGroupsSocketService } from '@app/annotations/services/video-groups-socket.service';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { AnnotationLabelGroupsService } from '@app/annotations/services/annotation-label-groups.service';
import { LabelGroupsStoreModule } from '@app/annotations/store/label-groups';
import * as fromVideoGroups from '@app/annotations/store/video-groups';
import { VideoGroupsEffects } from '@app/annotations/store/video-groups/video-groups.effects';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import * as fromStructureTracker from '@app/annotations/store/structure-tracker';
import { StructureTrackerEffects } from './store/structure-tracker/structure-tracker.effects';
import { StructureTrackerFacade } from './store/structure-tracker/structure-tracker.facade';
import { VideosModule } from './modules/videos/videos.module';
import { AboutComponent } from './common/components/about/about.component';
import { UsersService } from '@app/annotations/services/users.service';
import { DocumentationModule } from '@app/annotations/modules/documentation/documentation.module';

@NgModule({
  declarations: [AnnotationsViewLayoutComponent, AboutComponent],
  imports: [
    CommonModule,
    AnnotationsSharedModule,
    AnnotationsRoutingModule,
    StoreModule.forFeature('annotations', fromAnnotations.reducers),
    StoreModule.forFeature('annotationLabels', fromAnnotationLabels.reducers),
    StoreModule.forFeature('settings', fromSettings.reducers),
    EffectsModule.forFeature([AnnotationEffects, AnnotationLabelsEffects]),
    StoreModule.forFeature('videoGroups', fromVideoGroups.reducers),
    EffectsModule.forFeature([VideoGroupsEffects]),
    LabelGroupsStoreModule,
    StoreModule.forFeature('structureTracker', fromStructureTracker.reducers),
    EffectsModule.forFeature([StructureTrackerEffects]),
    VideosModule,
    DocumentationModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    SocketService,
    SettingsStoreFacade,
    LocalStorageService,
    AnnotationsStoreFacade,
    AnnotationsService,
    VideosApiService,
    VideosSocketService,
    VideoStatsService,
    AnnotationsSocketService,
    AnnotationLabelsStoreFacade,
    AnnotationLabelsSocketService,
    AnnotationLabelsService,
    VideoGroupsService,
    VideoGroupsSocketService,
    AnnotationLabelGroupsService,
    VideoGroupsStoreFacade,
    StructureTrackerFacade,
    StructureTrackerService,
    UsersService,
  ],
})
export class AnnotationsModule {}
