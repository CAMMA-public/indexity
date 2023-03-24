import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { VideoGroupsEditViewComponent } from './video-groups-edit-view.component';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { reducers as videosReducers } from '@app/annotations/modules/videos/store';
import { reducers as videoGroupsReducers } from '@app/annotations/store/video-groups';
import { VideoGroupsService } from '@app/annotations/services/video-groups.service';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { VideoGroupToolbarComponent } from '../../components/video-group-toolbar/video-group-toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { AnnotationLabelsService } from '@app/annotations/services/annotation-labels.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../../test-constants';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { InfoMessageService } from '@app/services/info-message.service';

describe('VideoGroupsEditViewComponent', () => {
  let component: VideoGroupsEditViewComponent;
  let fixture: ComponentFixture<VideoGroupsEditViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AnnotationsSharedModule,
        RouterTestingModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', videosReducers),
        StoreModule.forFeature('videoGroups', videoGroupsReducers),
        BrowserAnimationsModule,
        PerfectScrollbarModule,
      ],
      declarations: [VideoGroupsEditViewComponent, VideoGroupToolbarComponent],
      providers: [
        UiFacade,
        VideoGroupsService,
        VideoGroupsStoreFacade,
        LabelGroupsFacade,
        AnnotationLabelsService,
        VideosApiService,
        InfoMessageService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoGroupsEditViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
