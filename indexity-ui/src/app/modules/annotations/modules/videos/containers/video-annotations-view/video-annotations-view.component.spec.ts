import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoAnnotationsViewComponent } from './video-annotations-view.component';

import { EventTimelineModule } from 'ngx-event-timeline';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import * as fromVideos from '@app/videos-store';
import * as fromAnnotations from '@app/annotations-store';
import { EffectsModule } from '@ngrx/effects';
import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';

import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from '@app/annotations/services/socket.service';
import { IndexityAnnotationsModule } from '@indexity/annotations';
import { VideoPlayerStoreFacade } from '@app/annotations/modules/videos/store/video-player/video-player.store-facade';
import { LocalStorageService } from '@app/annotations/services/local-storage.service';
import { AnnotationsToolsComponent } from '@app/annotations/modules/videos/components/annotations-tools/annotations-tools.component';
import { AnnotationItemComponent } from '@app/annotations/components/annotation-item/annotation-item.component';
import { FormatMsPipe } from '@app/annotations/modules/videos/pipes/minutes-seconds.pipe';
import { InfoMessageService } from '@app/services/info-message.service';
import { AnnotationsTimelinesComponent } from '@app/annotations/modules/videos/components/annotations-timelines/annotations-timelines.component';
import { of } from 'rxjs';
import { AnnotationLabelsStoreFacade } from '@app/annotation-labels-store/annotation-labels-store-facade.service';
import * as fromAnnotationLabels from '@app/annotation-labels-store';
import { ResizableModule } from 'angular-resizable-element';
import { ROOT_REDUCERS } from '@app/main-store';

import { AnnotationsStoreFacade } from '@app/annotations-store/facades/annotations.store-facade';
import { SvgStoreFacade } from '@app/annotations-store/facades/svg.store-facade';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import * as fromSettings from '@app/settings-store';
import { SettingsStoreFacade } from '@app/settings-store/settings.store-facade';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ReactiveFormsModule } from '@angular/forms';
import { MediaPlayerComponent } from '@app/views';
import { HoldableDirective } from '@app/directives/holdable.directive';
import { MaterialCustomModule } from '@app/modules';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { StructureTrackerFacade } from '@app/annotations/store/structure-tracker/structure-tracker.facade';
import * as fromStructureTracker from '@app/annotations/store/structure-tracker/';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../../test-constants';

describe('VideoAnnotationsViewComponent', () => {
  let component: VideoAnnotationsViewComponent;
  let fixture: ComponentFixture<VideoAnnotationsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        VideoAnnotationsViewComponent,
        MediaPlayerComponent,
        AnnotationsToolsComponent,
        HoldableDirective,
        AnnotationItemComponent,
        FormatMsPipe,
        AnnotationsTimelinesComponent,
      ],
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: 'video/:id',
            loadChildren: () =>
              import('@app/annotations/modules/videos/videos.module').then(
                (m) => m.VideosModule,
              ),
          },
        ]),

        ReactiveFormsModule,
        MaterialCustomModule,
        EventTimelineModule,
        PerfectScrollbarModule,
        ResizableModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        StoreModule.forFeature('annotations', fromAnnotations.reducers),
        StoreModule.forFeature('settings', fromSettings.reducers),
        StoreModule.forFeature(
          'annotationLabels',
          fromAnnotationLabels.reducers,
        ),
        StoreModule.forFeature(
          'structureTracker',
          fromStructureTracker.reducers,
        ),
        EffectsModule.forRoot([]),
        IndexityAnnotationsModule,
        HttpClientModule,
      ],
      providers: [
        VideoPlayerStoreFacade,
        VideosStoreFacade,
        AnnotationsStoreFacade,
        SettingsStoreFacade,
        SvgStoreFacade,
        VideosApiService,
        SocketService,
        LocalStorageService,
        VideoGroupsStoreFacade,
        LabelGroupsFacade,
        InfoMessageService,
        AnnotationLabelsStoreFacade,
        UiFacade,
        StructureTrackerFacade,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoAnnotationsViewComponent);
    component = fixture.componentInstance;
    component.normalizedAnnotations$ = of([]);
    component.displayedShapes$ = of([]);
    component.user = {
      roles: [],
      email: 'asda@sfd.com',
      name: 'sdsdf',
      id: 1,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
