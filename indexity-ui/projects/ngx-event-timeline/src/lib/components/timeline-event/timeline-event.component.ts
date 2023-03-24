import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {TimelineEvent, TimelineEventType} from 'ngx-event-timeline';
import {eventItemPosition, eventItemWidth} from '../../helpers';
import {TimelineStoreService} from '../../services/timeline-store.service';
import {filter, map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';

@Component({
  selector: 'ngx-timeline-event',
  templateUrl: './timeline-event.component.html',
  styleUrls: ['./timeline-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineEventComponent implements OnInit {

  @Input()
  timelineEvent: TimelineEvent;

  @Input()
  timelineEventType: TimelineEventType;

  @Output()
  click = new EventEmitter<TimelineEvent>();

  @Output()
  hover = new EventEmitter<string | number>();

  eventActive$ = combineLatest([
    this.timelineStore.activeTimelineEvents$,
    this.timelineStore.highlightedEvents$
  ]).pipe(
    map(([activeEvents, highlightedEventIds]) => {

      const isActive = Boolean(activeEvents.find(e => e.id === this.timelineEvent.id)) &&
        (!highlightedEventIds || !highlightedEventIds.filter(Boolean).length);

      const isHighlighted = Boolean(highlightedEventIds.find(id => id === this.timelineEvent.id));
      return isActive || isHighlighted;
    })
  );

  eventWidth$: Observable<number>;

  eventPosition$: Observable<number>;

  eventIsDisabled$ = combineLatest([
    this.timelineStore.disabledEventTypes$,
    this.timelineStore.disabledEvents$
  ]).pipe(
    map(_ => !this.timelineStore.eventIsEnabled(this.timelineEvent))
  );

  eventIsSelected$ = this.timelineStore.selectedEvents$.pipe(
    map(selectedEventsIds => Boolean(selectedEventsIds.find(id => id === this.timelineEvent.id)))
  );

  constructor(public timelineStore: TimelineStoreService) { }

  onClick(e) {
    e.stopPropagation();
    this.click.emit(this.timelineEvent);
  }

  onMouseOver(id: number | string) {
    this.hover.emit(id);
  }

  ngOnInit() {
    this.eventWidth$ = combineLatest([
      this.timelineStore.getEvent(this.timelineEvent.id),
      this.timelineStore.totalTime$,
      this.timelineStore.timelineElWidth$,
    ]).pipe(
      filter(([event]) => Boolean(event)),
      map(([event, totalTime, timelineW]) => eventItemWidth(event.duration, totalTime, timelineW)),
    );

    this.eventPosition$ = combineLatest([
      this.timelineStore.getEvent(this.timelineEvent.id),
      this.timelineStore.timelineElWidth$,
      this.timelineStore.totalTime$
    ]).pipe(
      filter(([event]) => Boolean(event)),
      map(([event, timelineW, totalTime]) => eventItemPosition(event.timestamp, totalTime, timelineW))
    );
  }
}
