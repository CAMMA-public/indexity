import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { VideoGroupsIndexViewComponent } from './video-groups-index-view.component';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { reducers as videosReducers } from '@app/annotations/modules/videos/store';
import { reducers as videoGroupsReducers } from '@app/annotations/store/video-groups';
import { VideoGroupsService } from '@app/annotations/services/video-groups.service';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { VideoGroupItemComponent } from '@app/annotations/modules/video-groups/components/video-group-item/video-group-item.component';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { InfoMessageService } from '@app/services/info-message.service';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../../test-constants';

describe('VideoGroupsIndexViewComponent', () => {
  let component: VideoGroupsIndexViewComponent;
  let fixture: ComponentFixture<VideoGroupsIndexViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AnnotationsSharedModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', videosReducers),
        StoreModule.forFeature('videoGroups', videoGroupsReducers),
        PerfectScrollbarModule,
      ],
      declarations: [VideoGroupsIndexViewComponent, VideoGroupItemComponent],
      providers: [
        VideoGroupsService,
        VideoGroupsStoreFacade,
        LabelGroupsFacade,
        UsersFacade,
        UiFacade,
        InfoMessageService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoGroupsIndexViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
