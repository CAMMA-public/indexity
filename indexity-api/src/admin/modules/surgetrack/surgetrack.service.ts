import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { VideosService } from '../../../videos/services/videos.service';
import { VideoEntity } from '../../../videos/entities/video.entity';
import xml2js from 'xml2js';
import { getActions, getPhases } from './surgetrack.helpers';
import { UserEntity } from '../../../users/entities/user.entity';
import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';

export interface ParsedImportPayload {
  video: VideoEntity;
  contents: any;
}

@Injectable()
export class SurgetrackService {
  xmlParser = new xml2js.Parser();

  constructor(private videosService: VideosService) {}

  async handleXMLFile(file, videoId?: number): Promise<ParsedImportPayload> {
    const type = file.mimetype;

    if (type !== 'application/xml') {
      throw new UnprocessableEntityException('File is not in XML format');
    }
    const name = `${file.originalname.replace(/\.[^/.]+$/, '')}.mp4`;

    try {
      let video: VideoEntity;
      if (videoId) {
        video = await this.videosService.getOne({ id: videoId });
      } else {
        video = await this.videosService.getOne({ name });
      }
      const parsedContents = await this.xmlParser.parseStringPromise(
        file.buffer.toString(),
      );
      return {
        video,
        contents: parsedContents,
      };
    } catch (e) {
      throw new NotFoundException(
        `Video not found in DB, please upload video named ${name}`,
      );
    }
  }

  buildAnnotationSet(
    parsedXML,
    video: VideoEntity,
    user: UserEntity,
  ): AnnotationEntity[] {
    if (parsedXML) {
      const phases = getPhases(
        parsedXML.iSPM.data[0].phase_list[0].phase,
      ).map(a => ({ ...a, userId: user.id, videoId: video.id }));

      const actions = getActions(
        parsedXML.iSPM.data[0].action_list[0].action,
      ).map(a => ({ ...a, userId: user.id, videoId: video.id }));

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      return [...actions, ...phases];
    }
  }
}
