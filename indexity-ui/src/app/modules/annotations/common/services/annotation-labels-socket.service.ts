import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ConfigurationService } from 'angular-configuration-module';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import { map } from 'rxjs/operators';

@Injectable()
export class AnnotationLabelsSocketService extends Socket {
  labelUpdated$ = this.fromEvent<{
    id: number;
    updatedAnnotationLabel: AnnotationLabel;
  }>('annotation_label_update_success').pipe(
    map((message) => message.updatedAnnotationLabel),
  );
  labelCreated$ = this.fromEvent<{
    id: number;
    createdAnnotationLabel: AnnotationLabel;
  }>('annotation_label_create_success').pipe(
    map((message) => message.createdAnnotationLabel),
  );

  constructor(private readonly configurationService: ConfigurationService) {
    super({
      url: `${configurationService.configuration.socketConfig.baseUrl}/annotation-labels`,
      options: {
        transports: configurationService.configuration.socketConfig.opts.transports.split(
          configurationService.configuration.separator,
        ),
      },
    });
  }
}
