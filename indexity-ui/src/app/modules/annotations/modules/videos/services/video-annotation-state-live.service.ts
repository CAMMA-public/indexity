import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ConfigurationService } from 'angular-configuration-module';
import { VideoAnnotationState } from '@app/models/user-video-annotation-state';

@Injectable()
export class VideoAnnotationStateLiveService extends Socket {
  videoAnnotationStateUpdated$ = this.fromEvent<VideoAnnotationState>(
    'video_annotation_state_create_success',
  );
  videoAnnotationStateCreated$ = this.fromEvent<VideoAnnotationState>(
    'video_annotation_state_update_success',
  );
  videoAnnotationStateDeleted$ = this.fromEvent<VideoAnnotationState>(
    'video_annotation_state_delete_success',
  );

  constructor(private readonly configurationService: ConfigurationService) {
    super({
      url: `${configurationService.configuration.socketConfig.baseUrl}/video-annotation-states`,
      options: {
        transports: configurationService.configuration.socketConfig.opts.transports.split(
          configurationService.configuration.separator,
        ),
      },
    });
  }
}
