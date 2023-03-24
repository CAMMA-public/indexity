import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AnnotationLabelGroupsService } from '@app/annotations/services/annotation-label-groups.service';
import {
  addLabelsToGroup,
  addLabelsToGroupSuccess,
  createLabelGroup,
  createLabelGroupSuccess,
  loadAllLabelGroups,
  loadAllLabelGroupsSuccess,
  loadOneLabelGroup,
  loadOneLabelGroupSuccess,
  removeLabelsFromGroup,
  removeOneLabelGroup,
  removeOneLabelGroupSuccess,
} from '@app/annotations/store/label-groups/label-groups.actions';
import { map, switchMap } from 'rxjs/operators';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';

@Injectable()
export class LabelGroupsEffects {
  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAllLabelGroups),
      switchMap(() =>
        this.labelGroupsService
          .fetchAll()
          .pipe(toPayload(), map(loadAllLabelGroupsSuccess)),
      ),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOneLabelGroup),
      extractPayload(),
      switchMap((id) =>
        this.labelGroupsService
          .fetchOne(id)
          .pipe(toPayload(), map(loadOneLabelGroupSuccess)),
      ),
    ),
  );

  createOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createLabelGroup),
      extractPayload(),
      switchMap((group) =>
        this.labelGroupsService
          .createOne(group)
          .pipe(toPayload(), map(createLabelGroupSuccess)),
      ),
    ),
  );

  removeOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeOneLabelGroup),
      extractPayload(),
      switchMap((id) =>
        this.labelGroupsService
          .removeOne(id)
          .pipe(toPayload(), map(removeOneLabelGroupSuccess)),
      ),
    ),
  );

  addToGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addLabelsToGroup),
      extractPayload(),
      switchMap(({ groupId, labelNames }) =>
        this.labelGroupsService
          .addLabels(groupId, labelNames)
          .pipe(toPayload(), map(addLabelsToGroupSuccess)),
      ),
    ),
  );

  removeFromGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeLabelsFromGroup),
      extractPayload(),
      switchMap(({ groupId, labelNames }) =>
        this.labelGroupsService
          .removeLabels(groupId, labelNames)
          .pipe(toPayload(), map(addLabelsToGroupSuccess)),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private labelGroupsService: AnnotationLabelGroupsService,
  ) {}
}
