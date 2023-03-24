import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from '@app/main-store';
import * as fromAnnotationLabels from './index';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import {
  clearAll,
  deleteLabel,
  fetchAllForVideo,
  fetchAllLabels,
  fetchLabel,
  fetchLabelSuccess,
  removeLabelSuccess,
  searchLabels,
  searchSuccess,
  createOneAndAddToGroup,
} from './annotation-labels.actions';
import { Observable } from 'rxjs';

@Injectable()
export class AnnotationLabelsStoreFacade {
  allLabels$ = this.store.pipe(select(fromAnnotationLabels.getAllLabels));

  searchResults$ = this.store.pipe(
    select(fromAnnotationLabels.getSearchResults),
  );

  constructor(private store: Store<State>) {}

  fetchAllForVideo(videoId: number): void {
    this.store.dispatch(fetchAllForVideo({ payload: videoId }));
  }

  fetchAll(): void {
    this.store.dispatch(fetchAllLabels({ opts: null }));
  }

  getLabel(name: string): Observable<AnnotationLabel> {
    return this.store.pipe(select(fromAnnotationLabels.getLabel(name)));
  }

  createLabelAndAddToGroup(label: AnnotationLabel, groupId: number): void {
    this.store.dispatch(
      createOneAndAddToGroup({ payload: { label, groupId } }),
    );
  }

  fetchLabel(name: string): void {
    return this.store.dispatch(fetchLabel({ payload: name }));
  }

  addLabel(label: AnnotationLabel): void {
    this.store.dispatch(fetchLabelSuccess({ payload: label }));
  }

  removeLabel(labelName: string): void {
    this.store.dispatch(removeLabelSuccess({ payload: labelName }));
  }

  search(q: string): void {
    return this.store.dispatch(searchLabels({ payload: q }));
  }

  deleteLabel(name: string): void {
    this.store.dispatch(deleteLabel({ payload: name }));
  }

  clearAll(): void {
    this.store.dispatch(clearAll());
  }

  clearSearchResults(): void {
    this.store.dispatch(searchSuccess({ payload: [] }));
  }
}
