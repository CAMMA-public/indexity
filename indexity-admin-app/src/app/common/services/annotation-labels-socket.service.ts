import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { AnnotationLabel } from '../models/annotation-label.model';
import { ConfigurationService } from '../../configuration/configuration.service';

// This file is unused
@Injectable({
  providedIn: 'root',
})
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
