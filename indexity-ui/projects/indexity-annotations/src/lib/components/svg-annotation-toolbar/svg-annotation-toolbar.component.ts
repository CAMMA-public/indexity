import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CreationMode,
  DrawingMode,
  EditMode,
  Mode,
  NormalMode,
} from '../../models/mode';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { cutAnnotation } from '../../helpers/annotations.helper';
import { AnnotationShape } from '../../models/annotation-shape.model';
import { Annotation } from '../../models/annotation.model';
import { ToolbarShortcuts } from '../../models/toolbar-shortcuts.model';

@Component({
  selector: 'surg-svg-annotation-toolbar',
  templateUrl: './svg-annotation-toolbar.component.html',
  styleUrls: ['./svg-annotation-toolbar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgAnnotationToolbarComponent implements OnChanges {
  @Input() mode: Mode;
  @Input() shape: AnnotationShape;
  @Input() tmpSvgAnnotation: Annotation;
  @Input() videoTime: number;
  @Input() enableEditMode = true;
  @Input() annotationMinDuration = 1000 / 30;
  @Input() toolbarShortcuts: ToolbarShortcuts = {
    activateEditMode: 'KeyE',
    activateCreationMode: 'KeyC',
    activateDrawingMode: 'KeyD',
  };
  @Input() lockShortcuts = false;

  @Output() setMode = new EventEmitter<Mode>();
  @Output() setModeFailure = new EventEmitter<Mode>();
  @Output() setTmpAnnotation = new EventEmitter<Annotation>();
  @Output() updateAnnotation = new EventEmitter<Partial<Annotation>>();
  @Output() createAnnotation = new EventEmitter<Annotation>();

  @ViewChild('toggle', { static: true }) toggle: MatButtonToggleGroup;
  @ViewChild('cancelButton', { read: ElementRef }) cancelButton: ElementRef;
  @ViewChild('validateButton', { read: ElementRef }) validateButton: ElementRef;

  annotationEdited = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.mode &&
      changes.mode.currentValue !== changes.mode.previousValue
    ) {
      this.toggle.value = this.mode.name;
    }

    if (this.mode === EditMode && changes.tmpSvgAnnotation) {
      this.annotationEdited = false;
    }

    // If the annotation size changed
    if (
      this.mode === EditMode &&
      changes.shape &&
      !changes.tmpSvgAnnotation &&
      changes.shape.previousValue &&
      changes.shape.currentValue &&
      changes.shape.previousValue.positions &&
      Object.keys(changes.shape.previousValue.positions).length
    ) {
      this.annotationEdited = true;
    }
  }

  /**
   * Activate the annotation creation mode
   */
  activateAnnotationCreationMode(): void {
    if (this.mode.name !== CreationMode.name) {
      this.toggle.value = CreationMode.name;
      this.setMode.emit(CreationMode);
    }
  }

  /**
   * Activate the drawing mode so that the user can add new shapes on the video.
   */
  activateDrawingMode(): void {
    if (this.mode.name !== DrawingMode.name) {
      this.toggle.value = DrawingMode.name;
      this.setMode.emit(DrawingMode);
    }
  }

  /**
   * Activate the edit mode so that the user can update shapes on the video.
   */
  activateEditMode(): void {
    if (this.enableEditMode) {
      if (this.mode.name !== EditMode.name) {
        this.annotationEdited = false;
        this.toggle.value = EditMode.name;
        this.setMode.emit(EditMode);
      }
    } else {
      this.setModeFailure.emit(EditMode);
    }
  }

  /**
   * Destroy the last annotation and set the mode back to normal.
   */
  cancelSvgMode(): void {
    // continue to listen to keydown events with disabled button
    // see: https://bugzilla.mozilla.org/show_bug.cgi?id=706773
    this.cancelButton.nativeElement.blur();

    this.setMode.emit(NormalMode);
    this.toggle.value = NormalMode.name;
    this.setTmpAnnotation.emit();
  }

  /**
   * Set the mode back to normal.
   * Validate the annotations that were made during the drawing mode.
   * Reset the shape.
   */
  deactivateSvgMode(): void {
    // continue to listen to keydown events with disabled button
    // see: https://bugzilla.mozilla.org/show_bug.cgi?id=706773
    this.validateButton.nativeElement.blur();

    // validate spatial annotation
    if (this.tmpSvgAnnotation && this.mode === DrawingMode) {
      const duration = this.videoTime - this.tmpSvgAnnotation.timestamp;
      this.createAnnotation.emit({
        ...this.tmpSvgAnnotation,
        shape: this.shape,
        duration: Math.round(
          duration > this.annotationMinDuration
            ? duration
            : this.annotationMinDuration,
        ),
      });
    } else if (
      this.tmpSvgAnnotation &&
      this.mode === EditMode &&
      this.annotationEdited
    ) {
      if (this.tmpSvgAnnotation.isOneShot) {
        this.updateAnnotation.emit({
          id: this.tmpSvgAnnotation.id,
          videoId: this.tmpSvgAnnotation.videoId,
          shape: this.shape,
        });
      } else {
        this.updateAnnotation.emit({
          ...this.tmpSvgAnnotation,
          shape: this.shape,
        });
      }
    } else if (this.tmpSvgAnnotation && this.mode === CreationMode) {
      // validate temporal annotation
      const duration = this.videoTime - this.tmpSvgAnnotation.timestamp;
      this.createAnnotation.emit({
        ...this.tmpSvgAnnotation,
        duration: Math.round(
          duration > this.annotationMinDuration
            ? duration
            : this.annotationMinDuration,
        ),
      });
    }
    this.setMode.emit(NormalMode);
  }

  cutAnnotation(): void {
    if (this.tmpSvgAnnotation && this.mode === EditMode) {
      const splitAnnotation = cutAnnotation(
        this.tmpSvgAnnotation,
        this.videoTime,
      );
      const annotation1 = splitAnnotation[0];
      const annotation2 = splitAnnotation[1];
      if (
        splitAnnotation &&
        splitAnnotation.length === 2 &&
        annotation1 &&
        annotation2
      ) {
        this.createAnnotation.emit(annotation2);
        this.setTmpAnnotation.emit(annotation1);
        this.updateAnnotation.emit({
          id: this.tmpSvgAnnotation.id,
          videoId: this.tmpSvgAnnotation.videoId,
          duration: annotation1.duration,
          shape: annotation1.shape,
        });
      }
    }
  }

  disableCut(): boolean {
    const minDuration = Math.floor(this.annotationMinDuration);
    const duration1 = this.videoTime - this.tmpSvgAnnotation.timestamp;
    const duration2 =
      this.tmpSvgAnnotation.duration +
      this.tmpSvgAnnotation.timestamp -
      this.videoTime;
    return duration1 < minDuration || duration2 < minDuration;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event): void {
    if (this.lockShortcuts) {
      return;
    }

    if (event.key === 'Escape') {
      this.cancelSvgMode();
    } else if (event.key === 'Enter') {
      this.deactivateSvgMode();
    } else if (event.code === this.toolbarShortcuts.activateDrawingMode) {
      this.activateDrawingMode();
    } else if (event.code === this.toolbarShortcuts.activateCreationMode) {
      this.activateAnnotationCreationMode();
    } else if (event.code === this.toolbarShortcuts.activateEditMode) {
      this.activateEditMode();
    }
  }
}
