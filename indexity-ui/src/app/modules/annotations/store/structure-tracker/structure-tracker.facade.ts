import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from './structure-tracker.reducer';
import { loadVideoStructureTrackers } from './structure-tracker.actions';
import * as structureTrackerQuery from './';
import { Observable } from 'rxjs';
import { Annotation } from '@app/annotations/models/annotation.model';
import { StructureTracker } from '@app/annotations/models/structure-tracker.model';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

@Injectable()
export class StructureTrackerFacade {
  constructor(private store: Store<State>) {}

  getStartedStructureTrackers(): Observable<StructureTracker[]> {
    return this.store.pipe(
      select(structureTrackerQuery.selectStartedStructureTrackers),
    );
  }

  getTrackedAnnotationIds(): Observable<number[]> {
    return this.store.pipe(
      select(structureTrackerQuery.selectTrackedAnnotationIds),
    );
  }

  getTrackedAnnotationLabelNames(): Observable<string[]> {
    return this.store.pipe(
      select(structureTrackerQuery.selectTrackedAnnotationLabelNames),
    );
  }

  getAnnotationsWithTrackerInfo(): Observable<Annotation[]> {
    return this.store.pipe(
      select(structureTrackerQuery.selectAnnotationsWithTrackerInfo),
    );
  }

  getLabelsWithTrackerInfo(): Observable<AnnotationLabel[]> {
    return this.store.pipe(
      select(structureTrackerQuery.selectLabelsWithTrackerInfo),
    );
  }

  loadVideoStructureTrackers(videoId: number): void {
    this.store.dispatch(loadVideoStructureTrackers({ payload: videoId }));
  }
}
