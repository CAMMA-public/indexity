import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {map, tap} from 'rxjs/operators';
import {formatTimeStamp} from '../../helpers';
import {EventTimelineComponent} from '../../event-timeline.component';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {TimelinePlayerService} from '../../services/timeline-player.service';
import {TimelineStoreService} from '../../services/timeline-store.service';

@Component({
  selector: 'ngx-timeline-toolbar',
  templateUrl: './timeline-toolbar.component.html',
  styleUrls: ['./timeline-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class TimelineToolbarComponent implements OnInit, OnDestroy {

  @Input() timelineProvider: EventTimelineComponent;
  @Input() isPlaying = false;
  @Input() currentTimestamp = '00:00:00';
  @Input() currentTimestamp$: Observable<string>;
  @Input() timeScaleLabel: string;
  @Output() currentTimeClicked = new EventEmitter();
  @Input() showSetCurrentTime = true;
  @Output() setCurrentTimeClicked = new EventEmitter();
  @Output() play = new EventEmitter();
  @Output() pause = new EventEmitter();
  @Output() rewind = new EventEmitter();
  @Output() forwardNext = new EventEmitter();

  isStandAlone = false;
  private subscriptions: Array<Subscription> = [];

  constructor(
    @Optional() public timelineStore: TimelineStoreService,
    @Optional() public timelinePlayer: TimelinePlayerService,
  ) {}

  ngOnInit() {

    if (this.timelineProvider) {
      this.timelineStore = this.timelineProvider.timelineStore;
      this.timelinePlayer = this.timelineProvider.timelinePlayer;
    }

    if (this.timelinePlayer && this.timelineStore) {
      const isPlayingSub = this.timelinePlayer.isPlaying$
        .subscribe(isPlaying => this.isPlaying = isPlaying);
      this.subscriptions.push(isPlayingSub);

      this.currentTimestamp$ = combineLatest([
        this.timelineStore.currentTimestamp$,
        this.timelineStore.currentTimeFormat$
      ]).pipe(
        map( ([ ms, format]) => formatTimeStamp(ms, format)),
      );


    } else {
      this.isStandAlone = true;
    }

  }

  ngOnDestroy() {
    this.subscriptions.map(sub => sub.unsubscribe());
  }

  onPlay() {
    if (!this.isStandAlone) {
      this.timelinePlayer.play();
    }

    this.play.emit();
  }

  onPause() {
    if (!this.isStandAlone) {
      this.timelinePlayer.pause();
    }
    this.pause.emit();
  }

  onRewind() {
    if (!this.isStandAlone) {
      this.timelinePlayer.rewind();
    }

    this.rewind.emit();
  }

  onForwardNext() {
    if (!this.isStandAlone) {
      this.timelinePlayer.forwardNext();
    }
    this.forwardNext.emit();
  }

  onCurrentTimeClick() {

    if (this.timelineProvider) {
      this.timelineProvider.onCurrentTimeClicked();
    } else {
      this.currentTimeClicked.emit();
    }

  }

}
