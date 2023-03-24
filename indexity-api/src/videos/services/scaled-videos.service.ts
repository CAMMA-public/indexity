import { Injectable, Type } from '@nestjs/common';
import { VideosService } from './videos.service';
import {
  GenericCreateService,
  GenericDeleteService,
  GenericUpdateService,
} from '../../common/services';
import { applyMixins } from '../../common/helpers';
import { ScaledVideoEntity } from '../entities/scaled-video.entity';

@Injectable()
export class ScaledVideosService extends VideosService {
  protected get target(): Type<ScaledVideoEntity> {
    return ScaledVideoEntity;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export interface ScaledVideosService
  extends GenericCreateService<ScaledVideoEntity>,
    GenericUpdateService<ScaledVideoEntity>,
    GenericDeleteService<ScaledVideoEntity> {}

applyMixins(ScaledVideosService, [
  GenericCreateService,
  GenericUpdateService,
  GenericDeleteService,
]);
