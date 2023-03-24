import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-upload-videos-button',
  templateUrl: './upload-videos-button.component.html',
  styleUrls: ['./upload-videos-button.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadVideosButtonComponent {
  @Input() inProgress = false;
  @Output() upload = new EventEmitter<FormData>();

  onFilesChange(event): void {
    const files = event.target.files;
    const formData: FormData = new FormData();
    Object.keys(files).map((key) => {
      formData.append('files', files[key], files[key].name);
    });
    this.upload.emit(formData);
  }
}
