import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventTimelineModule } from 'ngx-event-timeline';
import { AnnotationsTimelinesComponent } from '@app/annotations/modules/videos/components/annotations-timelines/annotations-timelines.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

describe('AnnotationsTimelinesComponent', () => {
  let component: AnnotationsTimelinesComponent;
  let fixture: ComponentFixture<AnnotationsTimelinesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EventTimelineModule, PerfectScrollbarModule],
      declarations: [AnnotationsTimelinesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnotationsTimelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
