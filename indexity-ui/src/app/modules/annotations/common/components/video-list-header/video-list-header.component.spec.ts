import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VideoListHeaderComponent } from '@app/annotations/components/video-list-header/video-list-header.component';
import { ROOT_REDUCERS } from '@app/main-store';
import { MaterialCustomModule } from '@app/modules';
import * as fromVideos from '@app/videos/store';
import { VideosStoreFacade } from '@app/videos/store/videos/videos.store-facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

describe('VideoListHeaderComponent', () => {
  let component: VideoListHeaderComponent;
  let fixture: ComponentFixture<VideoListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VideoListHeaderComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialCustomModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
      ],
      providers: [VideosStoreFacade],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
