import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GenericGroup } from '@app/annotations/models/generic-group.model';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';

@Component({
  selector: 'app-video-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFormComponent implements OnInit, OnChanges {
  @Output() submit = new EventEmitter<GenericGroup>();
  @Output() canceled = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    annotationLabelGroupId: [undefined],
  });

  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: {
      videoGroup: VideoGroup;
      availableLabelGroups?: AnnotationLabelGroup[];
    },
    public dialogRef: MatDialogRef<GroupFormComponent>,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    if (this.data.videoGroup) {
      this.form.patchValue(this.data.videoGroup);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue) {
      this.form.patchValue(this.data.videoGroup);
    }
  }

  onSubmit(): void {
    const group = {
      ...this.data.videoGroup,
      ...this.form.value,
    };

    if (
      !this.data.availableLabelGroups ||
      !this.data.availableLabelGroups.length
    ) {
      delete group.annotationLabelGroupId;
    }

    delete group.annotationLabelGroup;
    this.dialogRef.close(group);
  }
}
