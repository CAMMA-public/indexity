import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineTracksComponent } from './timeline-tracks.component';
import {TimelineCursorComponent} from '../timeline-cursor/timeline-cursor.component';
import {TimelineTrackComponent} from '../timeline-track/timeline-track.component';
import {TimelineEventComponent} from '../timeline-event/timeline-event.component';
import {TimelineToolbarComponent} from '../timeline-toolbar/timeline-toolbar.component';
import {TimelinePlayerService, TimelineStoreService} from 'ngx-event-timeline';

describe('TimelineTracksComponent', () => {
  let component: TimelineTracksComponent;
  let fixture: ComponentFixture<TimelineTracksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TimelineTracksComponent,
        TimelineCursorComponent,
        TimelineTrackComponent,
        TimelineEventComponent,
        TimelineToolbarComponent
      ],
      providers: [TimelineStoreService,  TimelinePlayerService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
