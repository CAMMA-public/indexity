import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, concatMap } from 'rxjs/operators';
import {
  structureTrackerStart,
  structureTrackerSuccess,
  structureTrackerFailure,
  loadVideoStructureTrackers,
  loadVideoStructureTrackersSuccess,
} from './structure-tracker.actions';
import { AnnotationsSocketService } from '../../common/services/annotations-socket.service';
import { StructureTrackerService } from '@app/annotations/services/structure-tracker.service';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';

@Injectable()
export class StructureTrackerEffects {
  loadVideoStructureTrackers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoStructureTrackers),
      extractPayload(),
      concatMap((videoId) =>
        this.structureTrackerService
          .getVideoStructureTrackers(videoId)
          .pipe(toPayload(), map(loadVideoStructureTrackersSuccess)),
      ),
    ),
  );

  //////////////// SOCKETS //////////////////////////////////////

  structureTrackerStart$ = createEffect(() =>
    this.annotationsSocketService.structureTrackerStart$.pipe(
      map(({ annotationId }) =>
        structureTrackerStart({ payload: annotationId }),
      ),
    ),
  );

  structureTrackerSuccess$ = createEffect(() =>
    this.annotationsSocketService.structureTrackerSuccess$.pipe(
      map(({ annotationId }) =>
        structureTrackerSuccess({ payload: annotationId }),
      ),
    ),
  );

  structureTrackerFailure$ = createEffect(() =>
    this.annotationsSocketService.structureTrackerFailure$.pipe(
      map(({ annotationId }) =>
        structureTrackerFailure({ payload: annotationId }),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private annotationsSocketService: AnnotationsSocketService,
    private structureTrackerService: StructureTrackerService,
  ) {}
}
