import { HttpService, Injectable, Type } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { config } from '../../config';
import { classToPlain } from 'class-transformer';
import { GenericCRUDService } from '../../common/services';
import { StructureTrackerEntity } from '../entities/structure-tracker.entity';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { STRUCTURE_TRACKER_STATUS } from '../dtos/tracker-status-msg-dto';

@Injectable()
export class StructureTrackerService extends GenericCRUDService<
  StructureTrackerEntity
> {
  private readonly _apiUrl = `${config.structureTrackerApi.host}:${config.structureTrackerApi.port}`;

  constructor(
    @InjectEntityManager() manager: EntityManager,
    private readonly http: HttpService,
    private readonly annotationsService: AnnotationsService,
  ) {
    super(manager);
  }

  protected get target(): Type<StructureTrackerEntity> {
    return StructureTrackerEntity;
  }

  track(annotation: AnnotationEntity): Promise<any> {
    return this.http
      .post(`${this._apiUrl}/track`, classToPlain(annotation))
      .toPromise()
      .then(res => res.data);
  }

  sendStatus(
    id: number,
    videoId: number,
    status: STRUCTURE_TRACKER_STATUS,
  ): void {
    if (Object.values(STRUCTURE_TRACKER_STATUS).includes(status)) {
      this.annotationsService.emitMessageInRoom({
        roomId: videoId,
        event: status,
        data: { annotationId: id },
      });
    }
  }
}
