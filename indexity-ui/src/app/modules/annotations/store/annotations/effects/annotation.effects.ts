import { Injectable } from '@angular/core';

import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import {
  concatMap,
  flatMap,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  AnnotationCreateSuccessEvent,
  AnnotationUpdateSuccessEvent,
} from '@app/annotations/common/models/annotation-events.model';
import {
  annotationCreated,
  annotationRemoved,
  annotationUpdated,
  clear,
  createMany,
  createOne,
  joinRoom,
  leaveRoom,
  loadAll,
  loadAllSuccess,
  loadAnnotationToUpdate,
  loadAnnotationToUpdateSuccess,
  markAnnotationAsFalsePositive,
  removeAnnotation,
  trackAnnotation,
  update,
  setSocketInterpolation,
} from '../actions/annotation.actions';
import { AnnotationsService } from '@app/annotations/services/annotations.service';
import { AnnotationsSocketService } from '@app/annotations/services/annotations-socket.service';
import {
  fetchAllForVideo,
  fetchLabel,
} from '@app/annotation-labels-store/annotation-labels.actions';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';
import * as fromSettings from './../../settings';
import { Store } from '@ngrx/store';

@Injectable()
export class AnnotationEffects {
  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAll),
      extractPayload(),
      concatMap(({ videoId, withInterpolation, step }) =>
        this.annotationsService
          .listAnnotations(videoId, withInterpolation, step)
          .pipe(toPayload(), map(loadAllSuccess)),
      ),
    ),
  );

  loadAnnotationToUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAnnotationToUpdate),
      extractPayload(),
      concatMap((annotationId) =>
        this.annotationsService
          .loadAnnotation(annotationId, false, null)
          .pipe(toPayload(), map(loadAnnotationToUpdateSuccess)),
      ),
    ),
  );

  create$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(createOne),
        extractPayload(),
        concatMap((annotation) => this.annotationsService.create(annotation)),
      ),
    { dispatch: false },
  );

  createMultiple$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(createMany),
        extractPayload(),
        concatMap((annotations) =>
          this.annotationsService.createMultiple(annotations),
        ),
      ),
    { dispatch: false },
  );

  removeOne$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeAnnotation),
        extractPayload(),
        concatMap((id) => this.annotationsService.remove(id)),
      ),
    { dispatch: false },
  );

  update$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(update),
        extractPayload(),
        concatMap(({ annotation, withInterpolation, step }) =>
          this.annotationsService.update(annotation, withInterpolation, step),
        ),
      ),
    { dispatch: false },
  );

  markAsFalsePositive$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(markAnnotationAsFalsePositive),
        extractPayload(),
        switchMap(({ annotationId: id, isFalsePositive }) =>
          this.annotationsService.update({
            id,
            isFalsePositive,
          }),
        ),
      ),
    { dispatch: false },
  );

  track$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(trackAnnotation),
        pluck('payload'),
        switchMap((id) => this.annotationsService.track(id)),
      ),
    { dispatch: false },
  );

  //////////////// SOCKETS //////////////////////////////////////

  annotationUpdated$ = createEffect(() =>
    this.annotationsSocketService.annotationUpdateSuccess$.pipe(
      concatMap((a: AnnotationUpdateSuccessEvent) => [
        fetchLabel({ payload: a.updatedAnnotation.labelName }),
        annotationUpdated({ payload: a.updatedAnnotation }),
      ]),
    ),
  );

  annotationAdded$ = createEffect(() =>
    this.annotationsSocketService.annotationCreateSuccess$.pipe(
      // TODO: flatMap
      concatMap((a: AnnotationCreateSuccessEvent) => [
        fetchLabel({ payload: a.createdAnnotation.labelName }),
        annotationCreated({ payload: a.createdAnnotation }),
      ]),
    ),
  );

  annotationDestroyed$ = createEffect(() =>
    this.annotationsSocketService.annotationDeleteSuccess$.pipe(
      map((action) => action.deletedAnnotation.id),
      toPayload(),
      map(annotationRemoved),
    ),
  );

  joinRoom$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(joinRoom),
        extractPayload(),
        tap((roomId) => this.annotationsSocketService.join(roomId)),
      ),
    { dispatch: false },
  );

  setSocketInterpolation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setSocketInterpolation),
        extractPayload(),
        tap(({ withInterpolation, step }) =>
          this.annotationsSocketService.setInterpolation(
            withInterpolation,
            step,
          ),
        ),
      ),
    { dispatch: false },
  );

  leaveRoom$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(leaveRoom),
        extractPayload(),
        tap((roomId) => this.annotationsSocketService.leave(roomId)),
      ),
    { dispatch: false },
  );

  roomJoined$ = createEffect(() =>
    this.annotationsSocketService.registerRoomSuccess$.pipe(
      withLatestFrom(this.store$.select(fromSettings.getSettings)),
      flatMap(([action, settings]) => [
        fetchAllForVideo({ payload: action.roomId }),
        loadAll({
          payload: {
            videoId: action.roomId,
            withInterpolation: settings.activateAnnotationInterpolation,
            step: settings.annotationInterpolationStep,
          },
        }),
        setSocketInterpolation({
          payload: {
            withInterpolation: settings.activateAnnotationInterpolation,
            step: settings.annotationInterpolationStep,
          },
        }),
      ]),
    ),
  );

  @Effect()
  roomLeft$ = createEffect(() =>
    this.annotationsSocketService.leaveRoomSuccess$.pipe(map(() => clear())),
  );

  constructor(
    private actions$: Actions,
    private store$: Store<fromSettings.State>,
    private annotationsService: AnnotationsService,
    private annotationsSocketService: AnnotationsSocketService,
  ) {}
}
