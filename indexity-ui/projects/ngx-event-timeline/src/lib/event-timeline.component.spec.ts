import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTimelineComponent } from './event-timeline.component';
import {TimelineTracksComponent} from './components/timeline-tracks/timeline-tracks.component';
import {TimelineCursorComponent} from './components/timeline-cursor/timeline-cursor.component';
import {TimelineTrackComponent} from './components/timeline-track/timeline-track.component';
import {TimelineEventComponent} from './components/timeline-event/timeline-event.component';
import {TimelineToolbarComponent} from './components/timeline-toolbar/timeline-toolbar.component';
import {TimelineSidebarComponent} from './components/timeline-sidebar/timeline-sidebar.component';
import {TimelineEvent} from './models/timeline-event';
import {TimelineStoreService} from './services/timeline-store.service';
import {TimelinePlayerService} from './services/timeline-player.service';

describe('EventTimelineComponent', () => {
  let component: EventTimelineComponent;
  let fixture: ComponentFixture<EventTimelineComponent>;
  const events: TimelineEvent[] = [
    {
      id: '1212',
      eventType: 'SIGHT.RECONSTRUCTION',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 2030,
      duration: 200
    },
    {
      id: '1213',
      eventType: 'SIGHT.MOVEMENT',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 3030,
      duration: 340
    },
    {
      id: '1214',
      eventType: 'SIGHT.MOVEMENT',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 4130,
      duration: 1200
    },
    {
      id: '1299',
      eventType: 'DICOM.MPPS.PROGRESS',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 4030,
      duration: 320
    },
    {
      id: '1215',
      eventType: 'SIGHT.MOVEMENT',
      alt: 'Notification event has occurred',
      title: 'Notification message',
      timestamp: 1030,
      duration: 180
    },
    {
      id: '1216',
      eventType: 'SIGHT.RECONSTRUCTION',
      alt: 'Notification event has occurred',
      title: 'Notification message',
      timestamp: 400,
      duration: 300
    },
    {
      id: '1217',
      eventType: 'DICOM.MPPS.PROGRESS',
      alt: 'Notification event has occurred',
      title: 'Notification message',
      timestamp: 2430,
      duration: 100
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EventTimelineComponent,
        TimelineSidebarComponent,
        TimelineTracksComponent,
        TimelineCursorComponent,
        TimelineTrackComponent,
        TimelineEventComponent,
        TimelineToolbarComponent
      ],
      providers: [TimelineStoreService, TimelinePlayerService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTimelineComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    component.timelineEvents = events;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
