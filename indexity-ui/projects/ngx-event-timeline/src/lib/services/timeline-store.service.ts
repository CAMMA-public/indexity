import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {TimelineEvent, TimelineEventType} from '../../index';
import {
  arraysEqual, buildEventTypes, eventIsEnabled, eventTypeIsEnabled,
  filterEvents,
  groupEvents,
  normalizeEvent, normalizeOneShotEventDuration,
  timestampIncludesEvent,
} from '../helpers';
import {distinctUntilChanged, map} from 'rxjs/operators';


@Injectable()
export class TimelineStoreService {

  private readonly ZOOM_STEP = .1;


  //////////////////////////////////////////////////////////////////

  private _timelineEvents = new BehaviorSubject<TimelineEvent[]>([]);
  timelineEvents$ = this._timelineEvents.asObservable();

  set timelineEvents(val: TimelineEvent[]) {
    val = val.map(normalizeEvent);

    this.groupedEvents = groupEvents(val);
    this.timelineEventTypes = buildEventTypes(val);
    this._timelineEvents.next(val);
  }

  get timelineEvents() {
    return this._timelineEvents.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _totalTime = new BehaviorSubject<number>(0);
  totalTime$ = this._totalTime.asObservable();

  set totalTime(val: number) {
    if (val < 0) {
      val = 0;
    }
    this._totalTime.next(val);
  }

  get totalTime() {
    return this._totalTime.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _currentTimeFormat = new BehaviorSubject<'standard' | 'seconds'>('standard');
  currentTimeFormat$ = this._currentTimeFormat.asObservable();

  set currentTimeFormat(val: 'standard' | 'seconds') {
    this._currentTimeFormat.next(val);
  }

  get currentTimeFormat() {
    return this._currentTimeFormat.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _disabledEventTypes = new BehaviorSubject<TimelineEventType[]>([]);
  disabledEventTypes$ = this._disabledEventTypes.asObservable();

  set disabledEventTypes(val: TimelineEventType[]) {
    this._disabledEventTypes.next(val);
  }

  get disabledEventTypes() {
    return this._disabledEventTypes.getValue();
  }



  //////////////////////////////////////////////////////////////////

  private _currentTimestamp = new BehaviorSubject<number>(0);
  currentTimestamp$ = this._currentTimestamp.asObservable();

  set currentTimestamp(val: number) {
    if (val > this.totalTime) {
      val = this.totalTime;
    }

    if (val < 0) {
      val = 0;
    }
    this._currentTimestamp.next(val);
  }

  get currentTimestamp() {
    return this._currentTimestamp.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _zoom = new BehaviorSubject<number>(1);
  zoom$ = this._zoom.asObservable();

  set zoom(val: number) {
    this._zoom.next(val);
  }

  get zoom() {
    return this._zoom.getValue();
  }

  //////////////////////////////////////////////////////////////////


  private _timelineElWidth = new BehaviorSubject<number>(0);
  timelineElWidth$ = this._timelineElWidth.asObservable();

  set timelineElWidth(val: number) {
    this._timelineElWidth.next(val);
  }

  get timelineElWidth() {
    return this._timelineElWidth.getValue();
  }


  //////////////////////////////////////////////////////////////////

  private _groupedEvents = new BehaviorSubject<{[k: string]: TimelineEvent[]}>({});
  groupedEvents$ = this._groupedEvents.asObservable();


  set groupedEvents (val: {[k: string]: TimelineEvent[]}) {
    this._groupedEvents.next(val);
  }

  get groupedEvents () {
    return this._groupedEvents.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _timelineEventTypes = new BehaviorSubject<TimelineEventType[]>([]);
  timelineEventTypes$ = this._timelineEventTypes.asObservable();

  set timelineEventTypes (val: TimelineEventType[]) {
    this._timelineEventTypes.next(val);
  }

  get timelineEventTypes() {
    return this._timelineEventTypes.getValue();
  }

  ////////////////////////////////////////////////////////////////////


  private _displayDefaultTimeline = new BehaviorSubject<boolean>(false);
  displayDefaultTimeline$ = this._displayDefaultTimeline.asObservable();

  set displayDefaultTimeline(val: boolean) {
    this._displayDefaultTimeline.next(val);
  }

  get displayDefaultTimeline() {
    return this._displayDefaultTimeline.getValue();
  }



  ////////////////////////////////////////////////////////////////////


  private _filterEvents = new BehaviorSubject<boolean>(false);
  filterEvents$ = this._filterEvents.asObservable();

  set filterEvents(val: boolean) {
    this._filterEvents.next(val);
  }

  get filterEvents() {
    return this._filterEvents.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _highlightedEvents = new BehaviorSubject<Array<number | string>>([]);
  highlightedEvents$ = this._highlightedEvents.asObservable();

  set highlightedEvents (val: Array<number | string>) {
    this._highlightedEvents.next(val);
  }

  get highlightedEvents() {
    return this._highlightedEvents.getValue();
  }

  //////////////////////////////////////////////////////////////////

  private _selectedEvents = new BehaviorSubject<Array<number | string>>([]);
  selectedEvents$ = this._selectedEvents.asObservable();

  set  selectedEvents (val: Array<number | string>) {
    this._selectedEvents.next(val);
  }

  get  selectedEvents() {
    return this._selectedEvents.getValue();
  }




  //////////////////////////////////////////////////////////////////

  private _disabledEvents = new BehaviorSubject<Array<number | string>>([]);
  disabledEvents$ = this._disabledEvents.asObservable();

  set disabledEvents (val: Array<number | string>) {
    this._disabledEvents.next(val);
  }

  get disabledEvents() {
    return this._disabledEvents.getValue();
  }

  /////////////////////////////////////////////////////////////////////


  activeTimelineEvents$: Observable<TimelineEvent[]> = this.currentTimestamp$.pipe(
    map(timestamp => filterEvents(this.timelineEvents, timestampIncludesEvent(timestamp))),
    map(events => filterEvents(events, eventTypeIsEnabled(this.disabledEventTypes))),
    map(events => filterEvents(events, eventIsEnabled(this.disabledEvents))),
    map(events => events.map( e => normalizeOneShotEventDuration(e, this.totalTime, this.timelineElWidth ))),
    distinctUntilChanged(arraysEqual)
  );


  getEvent(eventId: number | string) {
    return this.timelineEvents$.pipe(
      map(events => events.find(event => event.id === eventId))
    );
  }

  zoomIn() {
    this.zoom = this.zoom + this.ZOOM_STEP;
  }

  zoomOut() {

    if (this.zoom - this.ZOOM_STEP > 1) {
      this.zoom = this.zoom - this.ZOOM_STEP;
    } else {
      this.zoom = 1;
    }

  }

  setEventTypeVisibility(et, visible: boolean) {
    if (visible) {
      this.disabledEventTypes = this.disabledEventTypes.filter(eventType => et !== eventType );
    } else  {
      this.disabledEventTypes = [...this.disabledEventTypes, et];
    }
  }

  eventIsEnabled(event: TimelineEvent) {
    return eventTypeIsEnabled(this.disabledEventTypes)(event) && eventIsEnabled(this.disabledEvents)(event);
  }

  constructor() {}
}
