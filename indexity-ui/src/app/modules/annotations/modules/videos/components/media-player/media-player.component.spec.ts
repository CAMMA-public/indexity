import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexityAnnotationsModule } from '@indexity/annotations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import * as fromVideos from '@app/videos-store';
import { ResizableModule } from 'angular-resizable-element';

import { ROOT_REDUCERS } from '@app/main-store';
import { MaterialCustomModule } from '@app/modules';
import { MediaPlayerComponent } from '@app/views';

describe('MediaPlayerComponent', () => {
  let component: MediaPlayerComponent;
  let fixture: ComponentFixture<MediaPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MediaPlayerComponent],
      imports: [
        MaterialCustomModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
        IndexityAnnotationsModule,
        ResizableModule,
      ],
      providers: [VideosStoreFacade],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
