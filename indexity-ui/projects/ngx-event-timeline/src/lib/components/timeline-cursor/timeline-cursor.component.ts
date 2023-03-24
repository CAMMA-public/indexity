import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {map} from 'rxjs/operators';
import {timestampToPosition} from '../../helpers';
import {combineLatest} from 'rxjs';
import {TimelineStoreService} from '../../services/timeline-store.service';

@Component({
  selector: 'ngx-timeline-cursor',
  templateUrl: './timeline-cursor.component.html',
  styleUrls: ['./timeline-cursor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineCursorComponent implements OnInit {

  cursorPosition$ = combineLatest([
    this.timelineStore.currentTimestamp$,
    this.timelineStore.totalTime$,
    this.timelineStore.timelineElWidth$
  ]).pipe(
    map(([timestamp, totalTime, width]) => timestampToPosition(timestamp, totalTime, width) - 4),
    map(pos => pos < 0 ? 0 : pos)
  );

  constructor(public timelineStore: TimelineStoreService) { }

  ngOnInit() {}

}
