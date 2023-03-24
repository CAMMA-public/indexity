import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SearchBarComponent } from '@app/annotations/components/search-bar/search-bar.component';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VideoListComponent } from '@app/annotations/components/video-list/video-list.component';
import { VideoListHeaderComponent } from '@app/annotations/components/video-list-header/video-list-header.component';
import { ROOT_REDUCERS } from '@app/main-store';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { MaterialCustomModule } from '@app/modules';
import { AnnotationLabelsService } from '@app/annotations/services/annotation-labels.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as fromVideos from '@app/videos/store';
import { VideosStoreFacade } from '@app/videos/store/videos/videos.store-facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../test-constants';
import { InfoMessageService } from '@app/services/info-message.service';

describe('VideoListComponent', () => {
  let component: VideoListComponent;
  let fixture: ComponentFixture<VideoListComponent>;

  const videos: Video[] = [
    {
      id: 1,
      url: 'storage/000001_VID001.mp4',
      name: '000001_VID001.mp4',
      thumbnailUrl: 'storage/000001_VID001.mp4_thumbnail.jpg',
      userId: 3,
      annotationState: VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED,
    },
    {
      id: 2,
      url: 'storage/000003_VID001.mp4',
      name: '000003_VID001.mp4',
      thumbnailUrl: 'storage/000003_VID001.mp4_thumbnail.jpg',
      userId: 3,
      annotationState: null,
    },
    {
      id: 3,
      url: 'storage/000003_VID002.mp4',
      name: '000003_VID002.mp4',
      thumbnailUrl: 'storage/000003_VID002.mp4_thumbnail.jpg',
      userId: 3,
      annotationState: null,
    },
    {
      id: 4,
      url: 'storage/000003_VID003.mp4',
      name: '000003_VID003.mp4',
      thumbnailUrl: 'storage/000003_VID003.mp4_thumbnail.jpg',
      userId: 3,
      annotationState: null,
    },
    {
      id: 5,
      url: 'storage/000003_VID004.mp4',
      name: '000003_VID004.mp4',
      thumbnailUrl: 'storage/000003_VID004.mp4_thumbnail.jpg',
      userId: 3,
      annotationState: null,
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        VideoListComponent,
        VideoListHeaderComponent,
        SearchBarComponent,
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialCustomModule,
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
      ],
      providers: [
        AnnotationLabelsService,
        VideosStoreFacade,
        InfoMessageService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show header', () => {
    component.showHeader = true;
    fixture.detectChanges();
    const header = fixture.debugElement.query(
      By.directive(VideoListHeaderComponent),
    );
    expect(header).toBeTruthy();
  });

  it('should hide header', () => {
    component.showHeader = false;
    fixture.detectChanges();
    const header = fixture.debugElement.query(
      By.directive(VideoListHeaderComponent),
    );
    expect(header).toBeFalsy();
  });

  describe('Component Outputs', () => {
    beforeEach(() => {
      component.videos = videos;
      component.canManageVideos = true;
      component.bookmarkedIds = [videos[1].id];
      fixture.detectChanges();
    });
  });
});
