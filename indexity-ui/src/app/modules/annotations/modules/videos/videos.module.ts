import { NgModule } from '@angular/core';
import { VideosIndexViewComponent } from './containers/videos-index-view/videos-index-view.component';
import { VideoAnnotationsViewComponent } from './containers/video-annotations-view/video-annotations-view.component';
import { VideosRoutingModule } from '@app/annotations/modules/videos/videos-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EventTimelineModule } from 'ngx-event-timeline';
import { CommonModule } from '@angular/common';
import { VideosEffects } from '@app/annotations/modules/videos/store/videos/videos.effects';
import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import * as fromVideos from '@app/videos-store';
import { MediaPlayerComponent } from '@app/annotations/modules/videos/components/media-player/media-player.component';
import { VideoBookmarksService } from '@app/annotations/modules/videos/services/video-bookmarks.service';
import { AnnotationsToolsComponent } from '@app/annotations/modules/videos/components/annotations-tools/annotations-tools.component';
import { AnnotationsTimelinesComponent } from '@app/annotations/modules/videos/components/annotations-timelines/annotations-timelines.component';
import { VideoPlayerStoreFacade } from '@app/annotations/modules/videos/store/video-player/video-player.store-facade';
import { VideoStatsEffects } from '@app/annotations/modules/videos/store/video-stats/video-stats.effects';
import { VideoStatsStoreFacade } from '@app/annotations/modules/videos/store/video-stats/video-stats.store-facade';
import { SvgStoreFacade } from '@app/annotations-store/facades/svg.store-facade';
import { IndexityAnnotationsModule } from '@indexity/annotations';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { VideoPlayerEffects } from '@app/videos/store/video-player/video-player.effects';

@NgModule({
  declarations: [
    VideosIndexViewComponent,
    VideoAnnotationsViewComponent,
    MediaPlayerComponent,
    AnnotationsToolsComponent,
    AnnotationsTimelinesComponent,
  ],
  imports: [
    CommonModule,
    VideosRoutingModule,
    AnnotationsSharedModule,
    IndexityAnnotationsModule,
    StoreModule.forFeature('videos', fromVideos.reducers),
    EffectsModule.forFeature([
      VideosEffects,
      VideoStatsEffects,
      VideoPlayerEffects,
    ]),
    EventTimelineModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    VideoBookmarksService,
    VideosStoreFacade,
    VideoPlayerStoreFacade,
    SvgStoreFacade,
    VideoStatsStoreFacade,
  ],
})
export class VideosModule {}
