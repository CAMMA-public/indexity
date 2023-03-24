import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as annotationsQuery from '../reducers/annotations.reducer';
import * as fromRoot from '../index';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { AnnotationLabelsStoreFacade } from '@app/annotations/store/annotation-labels/annotation-labels-store-facade.service';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import {
  annotationCreated,
  clear,
  createMany,
  createOne,
  joinRoom,
  leaveRoom,
  markAnnotationAsFalsePositive,
  removeAnnotation,
  setTmpAnnotation,
  trackAnnotation,
  update,
  loadAll,
  loadAnnotationToUpdate,
  clearAnnotationToUpdate,
  setSocketInterpolation,
} from '@app/annotations/store/annotations/actions/annotation.actions';

@Injectable()
export class AnnotationsStoreFacade {
  tmpAnnotation$ = this.store.pipe(select(fromRoot.getTmpAnnotation));
  annotationToUpdate$ = this.store.pipe(select(fromRoot.getAnnotationToUpdate));
  annotations$ = combineLatest([
    this.store.pipe(select(fromRoot.getAllAnnotationsWithLabels)),
    this.tmpAnnotation$,
  ]).pipe(
    map(([annotations, tmp]) =>
      tmp && !tmp.id ? [...annotations, tmp] : annotations,
    ),
  );

  constructor(
    private store: Store<annotationsQuery.State>,
    private annotationLabelsStoreFacade: AnnotationLabelsStoreFacade,
  ) {}

  clearAnnotations(): void {
    this.store.dispatch(clear());
  }

  loadAnnotations(
    videoId: number,
    withInterpolation: boolean,
    step: number,
  ): void {
    this.store.dispatch(
      loadAll({ payload: { videoId, withInterpolation, step } }),
    );
    this.store.dispatch(
      setSocketInterpolation({ payload: { withInterpolation, step } }),
    );
  }

  // TODO: add action to update multiple
  updateAnnotationsLabel(
    ids: number[],
    videoId: number,
    label: AnnotationLabel,
  ): void {
    ids.map((id) =>
      this.updateAnnotation({
        id,
        videoId,
        label,
      }),
    );
  }

  trackAnnotation(id: number): void {
    this.store.dispatch(trackAnnotation({ payload: id }));
  }

  setTmpAnnotation(annotation?: Annotation): void {
    // TODO: tmp labels management
    if (annotation && annotation.label) {
      const label = {
        ...annotation.label,
      };
      this.annotationLabelsStoreFacade.addLabel(label);
      this.store.dispatch(
        setTmpAnnotation({
          payload: {
            ...annotation,
            label,
          },
        }),
      );
    } else {
      this.store.dispatch(setTmpAnnotation({ payload: annotation }));
    }
  }

  loadAnnotationToUpdate(annotationId: number): void {
    this.store.dispatch(loadAnnotationToUpdate({ payload: annotationId }));
  }

  clearAnnotationToUpdate(): void {
    this.store.dispatch(clearAnnotationToUpdate());
  }

  createAnnotations(annotations: Array<Annotation>): void {
    this.store.dispatch(createMany({ payload: annotations }));
  }

  createAnnotation(annotation: Annotation): void {
    if (annotation && annotation.label && annotation.label.name) {
      annotation = {
        ...annotation,
        label: {
          ...annotation.label,
        },
      };
    }
    this.store.dispatch(createOne({ payload: annotation }));
  }

  annotationCreated(annotation: Annotation): void {
    this.store.dispatch(annotationCreated({ payload: annotation }));
  }

  updateAnnotation(
    annotation: Partial<Annotation>,
    withInterpolation = false,
    step?: number,
  ): void {
    if (annotation && annotation.label && annotation.label.name) {
      annotation = {
        ...annotation,
        label: {
          ...annotation.label,
        },
      };
    }
    this.store.dispatch(
      update({ payload: { annotation, withInterpolation, step } }),
    );
  }

  deleteAnnotation(id: number): void {
    this.store.dispatch(removeAnnotation({ payload: id }));
  }

  // TODO: delete multiple
  deleteAnnotations(ids: number[]): void {
    ids.map((id) => this.store.dispatch(removeAnnotation({ payload: id })));
  }

  joinRoom(id: number): void {
    this.store.dispatch(joinRoom({ payload: id }));
  }

  leaveRoom(id: number): void {
    this.store.dispatch(leaveRoom({ payload: id }));
  }

  getAnnotationsByLabel(label: AnnotationLabel): Observable<Annotation[]> {
    return this.store.pipe(select(fromRoot.getAnnotationsByLabel(label)));
  }

  countAnnotationsByLabel(label: AnnotationLabel): Observable<number> {
    return this.store.pipe(select(fromRoot.countAnnotationsByLabel(label)));
  }

  getAnnotationsByLabelName(labelName: string): Observable<Annotation[]> {
    return this.store.pipe(
      select(fromRoot.getAnnotationsByLabelName(labelName)),
    );
  }

  markAsFalsePositive(id, isFalsePositive = true): void {
    this.store.dispatch(
      markAnnotationAsFalsePositive({
        payload: { annotationId: id, isFalsePositive },
      }),
    );
  }
}
