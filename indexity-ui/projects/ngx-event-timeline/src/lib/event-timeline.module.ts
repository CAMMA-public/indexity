import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventTimelineComponent } from './event-timeline.component';
import { TimelineEventComponent } from './components/timeline-event/timeline-event.component';
import { TimelineCursorComponent } from './components/timeline-cursor/timeline-cursor.component';
import { TimelineToolbarComponent } from './components/timeline-toolbar/timeline-toolbar.component';
import { SizeSensorDirective } from './directives/size-sensor.directive';
import { TimelineTrackComponent } from './components/timeline-track/timeline-track.component';
import { TimelineSidebarComponent } from './components/timeline-sidebar/timeline-sidebar.component';
import { TimelineTracksComponent } from './components/timeline-tracks/timeline-tracks.component';


@NgModule({
  declarations: [
    EventTimelineComponent,
    TimelineEventComponent,
    TimelineCursorComponent,
    TimelineToolbarComponent,
    SizeSensorDirective,
    TimelineTrackComponent,
    TimelineSidebarComponent,
    TimelineTracksComponent
  ],
  imports: [CommonModule],
  exports: [EventTimelineComponent, TimelineToolbarComponent]
})
export class EventTimelineModule { }
