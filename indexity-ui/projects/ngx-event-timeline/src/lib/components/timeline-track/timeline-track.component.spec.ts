import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineTrackComponent } from './timeline-track.component';
import {TimelineEventComponent} from '../timeline-event/timeline-event.component';
import {TimelineStoreService} from 'ngx-event-timeline';

describe('TimelineTrackComponent', () => {
  let component: TimelineTrackComponent;
  let fixture: ComponentFixture<TimelineTrackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineTrackComponent, TimelineEventComponent ],
      providers: [TimelineStoreService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
