import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';

@Component({
  selector: 'app-annotation-label-item',
  templateUrl: './annotation-label-item.component.html',
  styleUrls: ['./annotation-label-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationLabelItemComponent implements OnInit {
  @Input() label: AnnotationLabel;

  ngOnInit(): void {
    //Do nothing.
  }
}
