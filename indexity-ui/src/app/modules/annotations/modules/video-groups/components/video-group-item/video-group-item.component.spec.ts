import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VideoGroupItemComponent } from '@app/annotations/modules/video-groups/components/video-group-item/video-group-item.component';
import { MaterialCustomModule } from '@app/modules';

describe('VideoGroupItemComponent', () => {
  let component: VideoGroupItemComponent;
  let fixture: ComponentFixture<VideoGroupItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialCustomModule, RouterTestingModule],
      declarations: [VideoGroupItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
