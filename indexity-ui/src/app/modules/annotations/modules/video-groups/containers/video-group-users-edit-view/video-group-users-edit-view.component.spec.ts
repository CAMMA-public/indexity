import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { VideoGroupUsersEditViewComponent } from './video-group-users-edit-view.component';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { reducers as videoGroupsReducers } from '@app/annotations/store/video-groups';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { RouterTestingModule } from '@angular/router/testing';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('VideoGroupUsersEditViewComponent', () => {
  let component: VideoGroupUsersEditViewComponent;
  let fixture: ComponentFixture<VideoGroupUsersEditViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AnnotationsSharedModule,
        RouterTestingModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videoGroups', videoGroupsReducers),
        BrowserAnimationsModule,
        PerfectScrollbarModule,
      ],
      declarations: [VideoGroupUsersEditViewComponent],
      providers: [UiFacade, VideoGroupsStoreFacade],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoGroupUsersEditViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
