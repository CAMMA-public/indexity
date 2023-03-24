import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Video } from '../models/video.model';
import { ConfigurationService } from '../../configuration/configuration.service';

// This file is unused
@Injectable({
  providedIn: 'root',
})
export class VideosSocketService extends Socket {
  videoCreated$ = this.fromEvent<Video>('video_created');
  videoUpdated$ = this.fromEvent<Partial<Video>>('video_updated');
  videoDeleted$ = this.fromEvent<number>('video_removed');
  videoThumbnailGenerated$ = this.fromEvent<Partial<Video>>(
    'video_thumbnail_generated',
  );

  constructor(private readonly configurationService: ConfigurationService) {
    super({
      url: `${configurationService.configuration.socketConfig.baseUrl}/videos`,
      options: {
        transports: configurationService.configuration.socketConfig.opts.transports.split(
          configurationService.configuration.separator,
        ),
      },
    });
  }
}
