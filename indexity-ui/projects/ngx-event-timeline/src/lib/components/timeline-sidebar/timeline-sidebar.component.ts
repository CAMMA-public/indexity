import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TimelineEventType} from 'ngx-event-timeline';
import {TimelineStoreService} from '../../services/timeline-store.service';

@Component({
  selector: 'ngx-timeline-sidebar',
  templateUrl: './timeline-sidebar.component.html',
  styleUrls: ['./timeline-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineSidebarComponent implements OnInit {
  timelineEventTypes$ = this.timelineStore.timelineEventTypes$;


  eventTypeTrackFn = (i, et: TimelineEventType) => et.type;


  constructor(public timelineStore: TimelineStoreService) { }

  onVisibilityToggle(e, et: TimelineEventType) {
    this.timelineStore.setEventTypeVisibility(et, e.target.checked);
  }

  ngOnInit() {}

}
