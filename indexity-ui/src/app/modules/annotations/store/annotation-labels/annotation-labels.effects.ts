import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import {
  deleteLabel,
  deleteLabelSuccess,
  fetchAllForVideo,
  fetchAllForVideoSuccess,
  fetchAllLabels,
  fetchAllLabelsSuccess,
  fetchLabel,
  fetchLabelSuccess,
  searchFailure,
  searchLabels,
  searchSuccess,
  updateLabelSuccess,
  createOneAndAddToGroup,
} from './annotation-labels.actions';
import { of } from 'rxjs';
import { AnnotationLabelsSocketService } from '@app/annotations/services/annotation-labels-socket.service';
import { AnnotationLabelsService } from '@app/annotations/services/annotation-labels.service';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';
import { addLabelsToGroup } from '@app/annotations/store/label-groups/label-groups.actions';

@Injectable()
export class AnnotationLabelsEffects {
  fetchForVideo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchAllForVideo),
      extractPayload(),
      concatMap((videoId) =>
        this.annotationLabelsService
          .fetchForVideo(videoId)
          .pipe(toPayload(), map(fetchAllForVideoSuccess)),
      ),
    ),
  );

  searchLabels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchLabels),
      switchMap((q) =>
        this.annotationLabelsService.search(q.payload).pipe(
          toPayload(),
          map(searchSuccess),
          catchError((err) => of(searchFailure({ payload: err.error }))),
        ),
      ),
    ),
  );

  fetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchLabel),
      extractPayload(),
      concatMap((name) =>
        this.annotationLabelsService
          .fetch(name)
          .pipe(toPayload(), map(fetchLabelSuccess)),
      ),
    ),
  );

  fetchAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchAllLabels),
      switchMap(() =>
        this.annotationLabelsService
          .fetchAll()
          .pipe(toPayload(), map(fetchAllLabelsSuccess)),
      ),
    ),
  );

  createOneAndAddToGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createOneAndAddToGroup),
      extractPayload(),
      concatMap(({ label, groupId }) =>
        this.annotationLabelsService.createOne(label).pipe(
          map(() =>
            addLabelsToGroup({
              payload: { groupId, labelNames: [label.name] },
            }),
          ),
        ),
      ),
    ),
  );

  deleteLabel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteLabel),
      extractPayload(),
      switchMap((name) =>
        this.annotationLabelsService
          .removeLabel(name)
          .pipe(toPayload(), map(deleteLabelSuccess)),
      ),
    ),
  );

  //////////// SOCKETS //////////////////////////////////////////////////////

  @Effect()
  annotationLabelCreated$ = this.annotationLabelsSocket.labelCreated$.pipe(
    toPayload(),
    map((payload) => fetchLabelSuccess(payload)),
  );

  @Effect()
  annotationLabelUpdated$ = this.annotationLabelsSocket.labelUpdated$.pipe(
    toPayload(),
    map((payload) => updateLabelSuccess(payload)),
  );

  constructor(
    private actions$: Actions,
    private annotationLabelsSocket: AnnotationLabelsSocketService,
    private annotationLabelsService: AnnotationLabelsService,
  ) {}
}
