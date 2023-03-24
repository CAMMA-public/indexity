import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromAnnotationLabelGroups from './store.reducer';
import { State } from '@app/annotations/store/label-groups/label-groups.reducer';
import {
  addLabelsToGroup,
  createLabelGroup,
  loadAllLabelGroups,
  loadOneLabelGroup,
  removeLabelsFromGroup,
  removeOneLabelGroup,
  searchGroupLabels,
  searchLabelGroups,
} from '@app/annotations/store/label-groups/label-groups.actions';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { Observable } from 'rxjs';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

@Injectable()
export class LabelGroupsFacade {
  allLabelGroups$ = this.store.pipe(
    select(fromAnnotationLabelGroups.selectAllGroups),
  );

  filteredLabelGroups$ = this.store.pipe(
    select(fromAnnotationLabelGroups.selectFilteredGroups),
  );

  allLabelGroupsMap$ = this.store.pipe(
    select(fromAnnotationLabelGroups.selectGroupEntities),
  );

  isLoading$ = this.store.pipe(
    select(fromAnnotationLabelGroups.selectIsLoading),
  );

  groupsFilter$ = this.store.select(
    fromAnnotationLabelGroups.selectGroupsFilter,
  );

  groupLabelsFilter$ = this.store.pipe(
    select(fromAnnotationLabelGroups.selectGroupLabelsFilter),
  );

  constructor(private store: Store<State>) {}

  loadAll(): void {
    this.store.dispatch(loadAllLabelGroups());
  }

  loadOne(id: number): void {
    this.store.dispatch(loadOneLabelGroup({ payload: id }));
  }

  getGroupById(id): Observable<AnnotationLabelGroup> {
    return this.store.pipe(
      select(fromAnnotationLabelGroups.selectGroupById(id)),
    );
  }

  filterGroups(q?: string): void {
    this.store.dispatch(searchLabelGroups({ payload: q }));
  }

  filterGroupLabels(q: string): void {
    this.store.dispatch(searchGroupLabels({ payload: q }));
  }

  createGroup(group: AnnotationLabelGroup): void {
    this.store.dispatch(createLabelGroup({ payload: group }));
  }

  removeGroup(id: number): void {
    this.store.dispatch(removeOneLabelGroup({ payload: id }));
  }

  addToGroup(groupId: number, labelNames: string[]): void {
    this.store.dispatch(addLabelsToGroup({ payload: { groupId, labelNames } }));
  }

  getFilteredGroupLabels(groupId: number): Observable<AnnotationLabel[]> {
    return this.store.pipe(
      select(fromAnnotationLabelGroups.selectFilteredGroupLabels(groupId)),
    );
  }

  removeFromGroup(groupId: number, labelNames: string[]): void {
    this.store.dispatch(
      removeLabelsFromGroup({ payload: { groupId, labelNames } }),
    );
  }

  deleteGroup(id: number): void {
    this.store.dispatch(removeOneLabelGroup({ payload: id }));
  }
}
