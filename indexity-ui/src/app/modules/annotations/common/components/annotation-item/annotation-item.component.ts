import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { FormControl } from '@angular/forms';
import { UserAnnotation } from '@app/models/user-annotation';

@Component({
  selector: 'app-annotation-item',
  templateUrl: './annotation-item.component.html',
  styleUrls: ['./annotation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationItemComponent implements OnInit, OnChanges {
  @Input() annotation: UserAnnotation;
  @Input() occurrences = 0;
  @Input() hiddenAnnotations = [];
  @Input() highlighted: number = null;
  @Input() trackerRunning = false;
  @Input() trackerRunningOnSameTrack = false;
  @Input() pending = false;

  @Output() remove = new EventEmitter<number>();
  @Output() copy = new EventEmitter<Partial<Annotation>>();
  @Output() hide = new EventEmitter<number>();
  @Output() hideLabel = new EventEmitter<string>();
  @Output() show = new EventEmitter<number>();
  @Output() showLabel = new EventEmitter<string>();
  @Output() deleteButtonEngaged = new EventEmitter();
  @Output() deleteButtonDisengaged = new EventEmitter();
  @Output() markAsFalsePositive = new EventEmitter<{
    annotation: Annotation;
    isFalsePositive: boolean;
  }>();
  @Output() startTracking = new EventEmitter<Annotation>();

  hidden = false;
  holdCancel = new BehaviorSubject(false);
  deleteHoldProgress = 0;
  falsePositiveControl = new FormControl(false);

  ngOnInit(): void {
    if (this.hiddenAnnotations && this.hiddenAnnotations.length) {
      this.hidden = this.hiddenAnnotations.includes(this.annotation.id);
    }

    if (this.annotation) {
      this.falsePositiveControl.patchValue(this.annotation.isFalsePositive, {
        emitEvent: false,
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hiddenAnnotations && changes.hiddenAnnotations.currentValue) {
      this.hidden = this.hiddenAnnotations.includes(this.annotation.id);
    }

    if (this.annotation) {
      this.falsePositiveControl.patchValue(this.annotation.isFalsePositive, {
        emitEvent: false,
      });
    }
  }

  onHoldProgress(e): void {
    if (e < this.deleteHoldProgress) {
      this.holdCancel.next(true);
    }
    this.deleteHoldProgress = e;
    setTimeout(() => {
      this.holdCancel.next(false);
    }, 1000);
  }

  launchTracking(): void {
    this.startTracking.emit(this.annotation);
  }

  copyAnnotation(): void {
    const annotation = {
      shape: this.annotation.shape,
      label: this.annotation.label,
      duration: this.annotation.isOneShot
        ? Math.floor(1000 / 30)
        : this.annotation.duration,
      timestamp: this.annotation.timestamp,
      videoId: this.annotation.videoId,
    };
    this.copy.emit(annotation);
  }

  hideAnnotation(): void {
    this.hide.emit(this.annotation.id);
  }

  hideLabels(): void {
    this.hideLabel.emit(this.annotation.labelName);
  }

  showAnnotation(): void {
    this.show.emit(this.annotation.id);
  }

  showLabels(): void {
    this.showLabel.emit(this.annotation.labelName);
  }

  onFalsePositiveChange(isFalsePositive: boolean): void {
    this.markAsFalsePositive.emit({
      isFalsePositive,
      annotation: this.annotation,
    });
  }
}
