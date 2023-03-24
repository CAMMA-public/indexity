import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineEventComponent } from './timeline-event.component';
import {TimelineStoreService} from 'ngx-event-timeline';

describe('TimelineEventComponent', () => {
  let component: TimelineEventComponent;
  let fixture: ComponentFixture<TimelineEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineEventComponent ],
      providers: [TimelineStoreService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineEventComponent);
    component = fixture.componentInstance;
    component.timelineEvent = {
      timestamp: 0,
      duration: 1,
      id: 1,
      eventType: 'test',
      title: 'test event'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
