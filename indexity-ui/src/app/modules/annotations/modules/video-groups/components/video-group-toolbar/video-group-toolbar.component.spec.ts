import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoGroupToolbarComponent } from '@app/annotations/modules/video-groups/components/video-group-toolbar/video-group-toolbar.component';
import { MaterialCustomModule } from '@app/modules';

describe('VideoGroupToolbarComponent', () => {
  let component: VideoGroupToolbarComponent;
  let fixture: ComponentFixture<VideoGroupToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialCustomModule],
      declarations: [VideoGroupToolbarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoGroupToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
