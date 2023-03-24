import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { VideoGroup } from '@app/annotations/models/video-group.model';

@Component({
  selector: 'app-ontology-item',
  templateUrl: './ontology-item.component.html',
  styleUrls: ['./ontology-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyItemComponent {
  @Input() group: AnnotationLabelGroup;
  @Input() userCanManage = false;

  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() videoGroupClick = new EventEmitter<VideoGroup>();

  onVideoGroupClick(e: Event, g: VideoGroup): void {
    e.preventDefault();
    e.stopPropagation();
    this.videoGroupClick.emit(g);
  }

  onGroupManage(e: Event, id: number): void {
    e.stopPropagation();
    this.edit.emit(id);
  }
}
