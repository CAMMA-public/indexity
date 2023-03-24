import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {TimelineStoreService} from '../../services/timeline-store.service';
import {TimelineEvent} from 'ngx-event-timeline';
import {msToTime} from '../../helpers';
import {PlayerState} from '../../models/player';
import {filter, map, pairwise} from 'rxjs/operators';
import {TimelineCursorComponent} from '../timeline-cursor/timeline-cursor.component';
import {TimelinePlayerService} from '../../services/timeline-player.service';

@Component({
  selector: 'ngx-timeline-tracks',
  templateUrl: './timeline-tracks.component.html',
  styleUrls: ['./timeline-tracks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineTracksComponent implements AfterViewInit {

  @Input()
  cursorEventMagnet = true;

  @Output()
  resize = new EventEmitter();

  @Output()
  cursorMove = new EventEmitter<number>();

  @Output()
  eventHover = new EventEmitter<string | number>();

  @Output()
  eventClick = new EventEmitter<TimelineEvent>();

  @ViewChild('tracksContainer', { read: ElementRef, static: true })
  tracksContainer;

  @ViewChild('cursor', { static: true })
  cursor: TimelineCursorComponent;

  @ViewChild('mainContainer', { static: true })
  mainContainer;

  ctrlPressed = false;

  hoverTime = '';
  hoverTimeEnabled = false;
  isDragging = false;
  hoverTimePosition = {
    x: 0,
    y: 0
  };

  zoom$ = this.timelineStore.zoom$.pipe(
    map(z => z * 100),
  );

  eventTrackFn = (i, et: TimelineEvent) => et.id;

  @HostListener('document:keydown.control')
  onCtrlDown() {
    this.ctrlPressed = true;
  }

  @HostListener('document:keyup.control')
  onCtrlUp() {
    this.ctrlPressed = false;
  }

  @HostListener('document:mouseleave')
  onDocumentLeave() {
    this.ctrlPressed = false;
  }

  constructor(
    public timelineStore: TimelineStoreService,
    public timelinePlayer: TimelinePlayerService
  ) { }

  onMouseEnter(e: MouseEvent) {
    e.preventDefault();
    this.hoverTimeEnabled = true;
  }

  onMouseLeave(e: MouseEvent) {
    e.preventDefault();
    this.hoverTimeEnabled = false;
    this.isDragging = false;
  }

  onMouseDown(e) {
    e.preventDefault();

    if (e.touches || e.button === 0) {
      if (this.timelinePlayer.playerState === PlayerState.PLAYING) {
        this.timelinePlayer.tmpPause();
      }
      this.isDragging = true;
      if (!this.cursorEventMagnet  && !this.ctrlPressed) {
        this.setCurrentTimestamp(e);
      }
    }
  }

  onMouseUp(e) {
    e.preventDefault();
    if (this.timelinePlayer.playerState === PlayerState.TMP_PAUSED) {
      this.timelinePlayer.play();
    }
    this.isDragging = false;
    if (e.touches) {
      this.updateHoverTime(e.changedTouches[0].clientX, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    } else {
      this.updateHoverTime(e.x, e.pageX, e.pageY);
    }
  }

  updateHoverTime(mousePositionX: number, hoverTimePositionX: number, hoverTimePositionY: number) {
    if (this.hoverTimeEnabled) {
      this.hoverTime = msToTime(this.computeCurrentTimestamp(mousePositionX));
      this.hoverTimePosition = {
        x: hoverTimePositionX,
        y: hoverTimePositionY
      };
    }
  }


  onMouseMove(e: MouseEvent) {
    this.updateHoverTime(e.x, e.pageX, e.pageY);
    if (this.isDragging && !this.ctrlPressed) {
      e.preventDefault();
      this.setCurrentTimestamp(e);
    }

  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY < 0) {
      this.timelineStore.zoomIn();
    } else if (e.deltaY > 0) {
      this.timelineStore.zoomOut();
    }

    this.updateHoverTime(e.x, e.pageX, e.pageY);
  }

  onEventClick(event: TimelineEvent) {
    if (this.cursorEventMagnet  && !this.ctrlPressed) {
      this.timelineStore.currentTimestamp = event.timestamp;
    }

    this.eventClick.emit(event);
  }

  ngAfterViewInit(): void {

    this.cursor.cursorPosition$.pipe(
      pairwise(),
      filter(_ => this.timelineStore.zoom !== 1),
    ).subscribe(([prevP, currP]) => {
      const mainContainerW = this.mainContainer.nativeElement.getBoundingClientRect().width;
      const direction = (prevP - currP) < 0 ? 'forward' : 'backward';
      const cursorVirtualPosition = currP - this.mainContainer.nativeElement.scrollLeft;

      if (cursorVirtualPosition < 0) {
        this.mainContainer.nativeElement.scrollLeft = 0;
      }

      if (cursorVirtualPosition >  mainContainerW / 2 && direction === 'forward') {
        this.mainContainer.nativeElement.scrollLeft = this.mainContainer.nativeElement.scrollLeft + (currP - prevP);
      } else if (cursorVirtualPosition < mainContainerW / 2 && direction === 'backward') {
        this.mainContainer.nativeElement.scrollLeft = this.mainContainer.nativeElement.scrollLeft - (prevP - currP);
      }

    });
  }

  setCurrentTimestamp(e) {
    const x = e.touches ? e.touches[0].clientX : e.x;
    this.timelineStore.currentTimestamp = this.computeCurrentTimestamp(x);
    this.cursorMove.emit(this.timelineStore.currentTimestamp);
  }

  computeCurrentTimestamp(x: number) {
    return (x - (this.tracksContainer.nativeElement.getBoundingClientRect() as DOMRect).x)
      * this.timelineStore.totalTime
      / this.timelineStore.timelineElWidth;
  }

}
