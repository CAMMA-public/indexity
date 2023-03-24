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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { fitInVideo } from '@app/annotations/helpers/annotations.helper';
import { Annotation } from '@app/annotations/models/annotation.model';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { msToTime } from '@app/annotations/helpers/base.helpers';
import { ConfigurationService } from 'angular-configuration-module';
import { Settings } from '@app/models/settings';
import { InfoMessageService } from '@app/services/info-message.service';

@Component({
  selector: 'app-annotations-tools',
  templateUrl: './annotations-tools.component.html',
  styleUrls: ['./annotations-tools.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationsToolsComponent implements OnInit, OnChanges {
  @Input() videoDuration = 0;
  @Input() video: Video;
  @Input() annotations: Array<Annotation> = [];
  @Input() settings: Settings;
  exportAnnotationsFileName = '';

  @Output() createAnnotations = new EventEmitter<Array<Annotation>>();

  jsonAnnotations;

  get videoDownloadLink(): string {
    return `${
      this.configurationService.configuration.apiConfig.baseUrl
    }/videos/${this.video.id}/media?token=${localStorage.getItem(
      'accessToken',
    )}`;
  }

  constructor(
    private sanitizer: DomSanitizer,
    private readonly configurationService: ConfigurationService,
    private infoMessageService: InfoMessageService,
  ) {}

  ngOnInit(): void {
    if (this.video) {
      this.exportAnnotationsFileName = `${this.video.id}-${this.video.name}-annotations.json`;
    }
    if (this.annotations) {
      this.jsonAnnotations = this.sanitizer.bypassSecurityTrustUrl(
        `data:text/json;charset=UTF-8,${encodeURIComponent(
          JSON.stringify(this.annotations),
        )}`,
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.video && changes.video.currentValue) {
      this.exportAnnotationsFileName = `${this.video.id}-${this.video.name}-annotations.json`;
    }

    if (changes.annotations && changes.annotations.currentValue) {
      this.jsonAnnotations = this.getSanitizedJson(
        changes.annotations.currentValue,
      );
    }
  }

  getSanitizedJson(object: any): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(
      `data:text/json;charset=UTF-8,${encodeURIComponent(
        JSON.stringify(object),
      )}`,
    );
  }

  async uploadAnnotations(event): Promise<void> {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onerror = (e) => {
        console.error(e);
      };
      reader.onloadend = async () => {
        const annotations = await this.getAnnotationsFromJson(
          reader.result as string,
        );
        if (annotations.length) {
          this.createAnnotations.emit(annotations);
        }
      };
      reader.readAsText(file);
    }
  }

  exists(annotation: Annotation): boolean {
    return Boolean(
      this.annotations.find(
        (a) =>
          annotation.timestamp === a.timestamp &&
          annotation.duration === a.duration &&
          annotation.label.name === a.label.name,
      ),
    );
  }

  async confirmAnnotationCreation(annotation: Annotation): Promise<boolean> {
    const confirm = await this.infoMessageService.setConfirm(
      'Duplicate annotation',
      `This annotation already exists, do you want to create it anyway?

        timestamp: ${msToTime(annotation.timestamp)}
        duration: ${msToTime(annotation.duration)}
        label: ${annotation.label.name}`,
    );
    return confirm;
  }

  async getAnnotationsFromJson(json: string): Promise<Array<Annotation>> {
    const annotations: Array<Annotation> = JSON.parse(json);
    if (Array.isArray(annotations)) {
      const cleanedAnnotations = annotations
        .filter((annotation) => annotation.timestamp <= this.videoDuration)
        .map((annotation) => {
          delete annotation.id;
          delete annotation.labelName;
          delete annotation.userId;
          delete annotation.user;
          return {
            ...fitInVideo(annotation, this.videoDuration),
            videoId: this.video.id,
          };
        });
      // intermediate step needed since filter is synchronous (no use of await)
      const filterResults = await Promise.all(
        cleanedAnnotations.map(async (a) => {
          return {
            annotation: a,
            filter:
              !this.exists(a) || (await this.confirmAnnotationCreation(a)),
          };
        }),
      );
      return filterResults
        .filter(({ annotation, filter }) => filter)
        .map(({ annotation }) => annotation);
    } else {
      return [];
    }
  }
}
