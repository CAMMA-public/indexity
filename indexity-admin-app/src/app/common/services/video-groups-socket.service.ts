import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { VideoGroup } from '../models/video-groups.model';
import { ConfigurationService } from '../../configuration/configuration.service';

// this file is unused
@Injectable({
  providedIn: 'root',
})
export class VideoGroupsSocketService extends Socket {
  videoGroupCreated$ = this.fromEvent<VideoGroup>('video_group_created');
  videoGroupRemoved$ = this.fromEvent<number>('video_group_removed');
  videoGroupUpdated$ = this.fromEvent<VideoGroup>('video_group_updated');

  constructor(private readonly configurationService: ConfigurationService) {
    super({
      url: `${configurationService.configuration.socketConfig.baseUrl}/video-groups`,
      options: {
        transports: configurationService.configuration.socketConfig.opts.transports.split(
          configurationService.configuration.separator,
        ),
      },
    });
  }
}
