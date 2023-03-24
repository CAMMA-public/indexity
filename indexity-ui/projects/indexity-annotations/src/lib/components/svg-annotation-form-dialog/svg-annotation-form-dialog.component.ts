import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnnotationLabel } from '../../models/annotation-label.model';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// @dynamic
@Component({
  selector: 'surg-svg-annotation-form-dialog',
  templateUrl: './svg-annotation-form-dialog.component.html',
  styleUrls: ['./svg-annotation-form-dialog.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgAnnotationFormDialogComponent implements OnInit {
  labelControl = new FormControl();
  labelTypeControl = new FormControl('structure');
  color = '#b31111';
  labels$: Observable<AnnotationLabel[]>;

  canEditType = true;

  queryChanges$: Observable<string>;
  selectedExisting = false;
  annotationLabelTypes = [
    { name: 'Action', value: 'action' },
    { name: 'Event', value: 'event' },
    { name: 'Phase', value: 'phase' },
    { name: 'Structure', value: 'structure' },
  ];

  constructor(
    public dialogRef: MatDialogRef<SvgAnnotationFormDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: {
      labels$: Observable<Array<AnnotationLabel>>;
      suggestedLabelGroup?: AnnotationLabelGroup;
      currentLabel: AnnotationLabel;
      enableDelete?: boolean;
      allowedLabelTypes?: Array<string>;
      deleteLabelHandler?: (label: string) => void;
    },
  ) {}

  ngOnInit(): void {
    const current = this.data.currentLabel || {
      name: '',
      type: this.data.allowedLabelTypes
        ? this.data.allowedLabelTypes.includes('structure')
          ? 'structure'
          : 'action'
        : 'structure',
      color: '#007aff',
    };

    if (this.data.currentLabel) {
      this.canEditType = false;
    }

    this.labelControl.setValue(current.name);
    this.labelTypeControl.setValue(current.type);
    if (current.color && current.color.length > 0) {
      this.color = current.color;
    }

    if (this.data.allowedLabelTypes && this.data.allowedLabelTypes.length > 0) {
      this.labels$ = this.data.labels$.pipe(
        map((labels) =>
          labels.filter((l) => this.data.allowedLabelTypes.includes(l.type)),
        ),
      );
      this.annotationLabelTypes = this.annotationLabelTypes.filter((lt) =>
        this.data.allowedLabelTypes.includes(lt.value),
      );
      this.labelTypeControl.setValue(current.type);
    } else {
      this.labels$ = this.data.labels$;
    }
    this.queryChanges$ = this.labelControl.valueChanges.pipe(
      startWith(current.name),
      debounceTime(300),
      distinctUntilChanged(),
    );
  }

  onLabelSelect(change): void {
    this.labelControl.setValue(change.source.value.name);
    this.color = change.source.value.color;
  }

  closeDialog(obj): void {
    this.dialogRef.close(obj);
  }

  onColorChange(e): void {
    this.color = e;
  }

  onAutoCompleteSelected(e: MatAutocompleteSelectedEvent): void {
    const label = e.option.value;
    this.selectedExisting = true;
    this.labelTypeControl.setValue(label.type);
    this.color = label.color;
  }

  @HostListener('keydown', ['$event'])
  onSpace(e): void {
    e.stopPropagation();
  }

  onDeleteClick(e, label: string): void {
    e.stopPropagation();
    e.preventDefault();
    if (this.data.deleteLabelHandler && this.data.enableDelete) {
      this.data.deleteLabelHandler(label);
    }
  }
}
