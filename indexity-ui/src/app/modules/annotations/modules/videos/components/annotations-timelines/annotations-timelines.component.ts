import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';

import { MediaPlayerComponent } from '@app/annotations/modules/videos/components/media-player/media-player.component';
import { EventTimelineComponent, TimelineEvent } from 'ngx-event-timeline';
import { msToTime } from '@app/annotations/helpers/base.helpers';
import {
  getAnnotationsToSelect,
  getSvgEvents,
  mapEventTypesWithColor,
} from '@app/annotations/helpers/annotations.helper';
import { Annotation } from '@app/annotations/models/annotation.model';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

@Component({
  selector: 'app-annotations-timelines',
  templateUrl: './annotations-timelines.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationsTimelinesComponent implements OnInit, OnChanges {
  @ViewChild(MediaPlayerComponent) mediaPlayer: MediaPlayerComponent;
  @ViewChild('timeline', { static: true }) timeline: EventTimelineComponent;

  @Input() annotations: Array<Annotation> = [];
  @Input() labels: AnnotationLabel[] = [];
  @Input() isVideoPlaying = false;
  @Input() highlightedAnnotations: number[] = [];
  @Input() hiddenAnnotations: number[] = [];
  @Input() selectedAnnotations: number[] = [];
  @Input() videoDuration = 1;
  @Input() videoTime = 0;
  @Input() currentTimeScaleLabel: string;
  @Input() formattedVideoTime = '00:00:00';
  @Input() playbackRate = 1;

  @Output() setIsPlaying = new EventEmitter<boolean>();
  @Output() setTime = new EventEmitter<number>();
  @Output() eventHover = new EventEmitter<number>();
  @Output() selectAnnotation = new EventEmitter<number>();
  @Output() selectAnnotations = new EventEmitter<number[]>();
  @Output() updatePlaybackRate = new EventEmitter<void>();
  @Output() seekNextEvent = new EventEmitter<void>();
  @Output() currentTimeClicked = new EventEmitter();

  // video
  formattedVideoDuration$ = new Subject();
  showSidebar = true;
  ctrlPressed = false;
  zoom = 1;
  lastSelectedId: number = null;

  annotationEvents: TimelineEvent[] = [];
  annotationEventTypes = [];

  ngOnInit(): void {
    if (this.videoDuration) {
      this.formattedVideoDuration$.next(msToTime(this.videoDuration));
    }

    if (this.annotations && this.annotations.length) {
      this.annotationEvents = getSvgEvents(this.annotations);

      if (this.labels && this.labels.length) {
        this.annotationEventTypes = mapEventTypesWithColor(
          this.annotationEvents,
          this.labels,
        );
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.videoDuration) {
      this.formattedVideoDuration$.next(msToTime(this.videoDuration));
    }

    if (changes.annotations && this.annotations) {
      this.annotationEvents = getSvgEvents(this.annotations);
      this.annotationEventTypes = mapEventTypesWithColor(
        this.annotationEvents,
        this.labels,
      );
    }

    if (changes.labels && this.labels) {
      this.annotationEventTypes = mapEventTypesWithColor(
        this.annotationEvents,
        this.labels,
      );
    }
  }

  onZoomed(zoom: number): void {
    this.zoom = zoom;
  }

  // Video
  onSetIsVideoPlaying(isPlaying: boolean): void {
    this.setIsPlaying.emit(isPlaying);
  }

  setCurrentTime(time: number): void {
    this.setTime.emit(time);
  }

  @HostListener('document:keyup.control')
  onCtrlUp(): void {
    this.ctrlPressed = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): boolean {
    if (e.ctrlKey) {
      this.ctrlPressed = true;
      if (e.key === 'a') {
        this.selectAnnotations.emit(
          getAnnotationsToSelect(
            this.lastSelectedId,
            this.selectedAnnotations,
            this.annotations,
          ),
        );
        return false;
      }
    }
  }

  @HostListener('document:mouseleave')
  onMouseLeave(): void {
    this.ctrlPressed = false;
  }

  onSetCurrentTime(): void {
    const res = Number(prompt('Set time (milliseconds):'));

    if (res) {
      const newTime = Math.round(Number(res) / 1000);
      if (!isNaN(newTime) && newTime >= 0 && newTime <= this.videoDuration) {
        this.setTime.emit(newTime);
      }
    }
  }

  onEventClick(event): void {
    if (this.ctrlPressed) {
      this.selectAnnotation.emit(event.id);
      this.lastSelectedId = event.id;
    }
  }
}
