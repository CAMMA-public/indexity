import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideosIndexViewComponent } from './videos-index-view.component';

import { RouterTestingModule } from '@angular/router/testing';
import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from '@app/annotations/services/socket.service';
import * as fromVideos from '@app/videos-store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LocalStorageService } from '@app/annotations/services/local-storage.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ROOT_REDUCERS } from '@app/main-store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VideoStatsStoreFacade } from '@app/annotations/modules/videos/store/video-stats/video-stats.store-facade';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MaterialCustomModule } from '@app/modules';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { of } from 'rxjs';
import { AnnotationLabelsService } from '@app/annotations/services/annotation-labels.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../../test-constants';
import { InfoMessageService } from '@app/services/info-message.service';

class MockUsersFacade {
  currentUser$ = of({ id: 1 });
}

describe('VideosIndexViewComponent', () => {
  let component: VideosIndexViewComponent;
  let fixture: ComponentFixture<VideosIndexViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VideosIndexViewComponent],
      imports: [
        MaterialCustomModule,
        RouterTestingModule,
        FormsModule,
        PerfectScrollbarModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
        HttpClientModule,
        AnnotationsSharedModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        VideosStoreFacade,
        VideosApiService,
        SocketService,
        LocalStorageService,
        VideoStatsStoreFacade,
        AnnotationLabelsService,
        InfoMessageService,
        { provide: UsersFacade, useClass: MockUsersFacade },
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideosIndexViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
