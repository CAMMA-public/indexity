import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {TimelineEvent} from './models/timeline-event';
import {TimelineStoreService} from './services/timeline-store.service';
import {TimelinePlayerService} from './services/timeline-player.service';
import {PlayerState} from './models/player';
import {TimelineEventType} from './models/timeline-event-type';

@Component({
  selector: 'ngx-event-timeline',
  templateUrl: 'event-timeline.component.html',
  styleUrls: ['event-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TimelineStoreService,
    TimelinePlayerService
  ]
})
export class EventTimelineComponent implements OnInit, OnChanges {

  @Input()
  timelineEvents: TimelineEvent[] = [];

  @Input()
  timelineEventTypes: TimelineEventType[] = [];

  @Input()
  zoom = 1.0;

  @Input()
  currentTimestamp = 0; // ms

  @Input()
  totalTime = 0; // ms

  @Input()
  showSidebar = true;

  @Input() showSetCurrentTime = true;

  @Input()
  cursorEventMagnet = false;

  @Input() currentTimeFormat: 'standard' | 'seconds' = 'standard';

  @Output()
  currentTimestampUpdate = new EventEmitter<number>();

  @Output()
  activeEventsUpdate = new EventEmitter<TimelineEvent[]>();

  @Output()
  eventClick = new EventEmitter<TimelineEvent>();

  @Output()
  eventHover = new EventEmitter<string | number>();

  @Output()
  play = new EventEmitter();

  @Output()
  pause = new EventEmitter();

  @Input()
  showToolbar = true;

  @Output()
  cursorMove = new EventEmitter<number>();

  @Output()
  rewind = new EventEmitter();

  @Output()
  forwardNext = new EventEmitter();

  @Output()
  zoomed = new EventEmitter<number>();

  @Output()
  currentTimeClicked = new EventEmitter();

  @Input() timeScaleLabel: string;

  @Input() displayDefaultTimeline = false;
  @Input() filterEvents = false;

  @Input() selectedEvents: Array<number | string> = [];

  @Input() highlightedEvents: Array<number | string> = [];

  @Input() disabledEvents: Array<number | string> = [];

  constructor(
    public timelineStore: TimelineStoreService,
    public timelinePlayer: TimelinePlayerService
  ) { }

  ngOnInit() {

    // TODO: unsub
    this.timelineStore.currentTimestamp$
      .subscribe(this.currentTimestampUpdate);

    this.timelineStore.activeTimelineEvents$
      .subscribe(this.activeEventsUpdate);

    this.timelineStore.zoom$
      .subscribe(this.zoomed);

    this.timelinePlayer.playerState$.subscribe(state => {
      if (state === PlayerState.PLAYING) {
        this.play.emit();
      }

      if (state === PlayerState.PAUSED) {
        this.pause.emit();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {


    this.timelineStore.displayDefaultTimeline = this.displayDefaultTimeline;
    this.timelineStore.filterEvents = this.filterEvents;


    if (changes['timelineEvents'] && changes['timelineEvents'].currentValue) {
      this.timelineStore.timelineEvents = this.timelineEvents;
    }
    if (changes['timelineEventTypes'] && changes['timelineEventTypes'].currentValue && changes['timelineEventTypes'].currentValue.length) {
      this.timelineStore.timelineEventTypes = this.timelineEventTypes;
    }
    if (changes['zoom'] && changes['zoom'].currentValue) {
      this.timelineStore.zoom = this.zoom;
    }
    if (changes['totalTime'] && changes['totalTime'].currentValue) {
      this.timelineStore.totalTime = this.totalTime;
    }

    if (changes['currentTimeFormat'] && changes['currentTimeFormat'].currentValue) {
      this.timelineStore.currentTimeFormat = this.currentTimeFormat;
    }

    if (changes['currentTimestamp'] && changes['currentTimestamp'].currentValue >= 0) {
      this.timelineStore.currentTimestamp = this.currentTimestamp;
    }

    if (changes['highlightedEvents'] && changes['highlightedEvents'].currentValue) {
      this.timelineStore.highlightedEvents = this.highlightedEvents;
    }

    if (changes['selectedEvents'] && changes['selectedEvents'].currentValue) {
      this.timelineStore.selectedEvents = this.selectedEvents;
    }


    if (changes['disabledEvents'] && changes['disabledEvents'].currentValue) {
      this.timelineStore.disabledEvents = this.disabledEvents;
    }

  }

  onTimelineResized(e) {
    this.timelineStore.timelineElWidth = e.newWidth;
  }

  onCurrentTimeClicked() {

    // Used by the toolbar in standalone mode, (when timeline provider is specified)

    if (this.timelineStore.currentTimeFormat === 'seconds') {
      this.timelineStore.currentTimeFormat = 'standard';
    } else {
      this.timelineStore.currentTimeFormat = 'seconds';
    }

    this.currentTimeClicked.emit();

  }

  onSetCurrentTimeClicked() {

    const res = prompt('Set time (milliseconds):');
    if (res) {
      const newTime = Number(res);
      if (!isNaN(newTime) && newTime >= 0 && newTime <= this.timelineStore.totalTime ) {
        this.timelineStore.currentTimestamp = newTime;
      }
    }

  }

}
