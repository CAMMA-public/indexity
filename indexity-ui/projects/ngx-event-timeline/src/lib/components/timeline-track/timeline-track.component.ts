import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {TimelineEvent, TimelineEventType} from 'ngx-event-timeline';

@Component({
  selector: 'ngx-timeline-track',
  templateUrl: './timeline-track.component.html',
  styleUrls: ['./timeline-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineTrackComponent implements OnInit {

  @Input() isDefaultTrack = false;

  @Input()
  timelineEvents: TimelineEvent[];

  @Input()
  timelineEventType: TimelineEventType;

  @Output()
  eventClick = new EventEmitter<TimelineEvent>();

  @Output()
  eventHover = new EventEmitter<string | number>();

  eventTrackFn = (i, et: TimelineEvent) => et.id;

  constructor() { }

  ngOnInit() {}

}
