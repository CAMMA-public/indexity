import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

@Component({
  selector: 'app-label-item',
  templateUrl: './label-item.component.html',
  styleUrls: ['./label-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelItemComponent implements OnInit {
  @Input() label: AnnotationLabel;
  @Input() groupEditMode = false;
  @Input() isInGroup = false;

  @Output() addToGroup = new EventEmitter<string>();
  @Output() removeFromGroup = new EventEmitter<string>();

  ngOnInit(): void {
    // Do nothing.
  }
}
