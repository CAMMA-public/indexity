import * as fromLabelGroups from './label-groups.reducer';
import {
  Action,
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

export const reducers = (
  state: fromLabelGroups.State | undefined,
  action: Action,
): any => fromLabelGroups.reducer(state, action);

export const selectLabelGroupsFeatureState = createFeatureSelector<
  fromLabelGroups.State
>('labelGroups');

export const {
  selectAll: selectAllGroups,
  selectEntities: selectGroupEntities,
} = fromLabelGroups.adapter.getSelectors(selectLabelGroupsFeatureState);

export const selectIsLoading = createSelector(
  selectLabelGroupsFeatureState,
  fromLabelGroups.selectIsLoading,
);

export const selectGroupsFilter = createSelector(
  selectLabelGroupsFeatureState,
  fromLabelGroups.selectGroupsFilter,
);

export const selectGroupLabelsFilter = createSelector(
  selectLabelGroupsFeatureState,
  fromLabelGroups.selectGroupLabelsFilter,
);

export const selectGroupById = (
  id: number,
): MemoizedSelector<object, AnnotationLabelGroup> =>
  createSelector(selectGroupEntities, (groups) => groups[id]);

export const selectFilteredGroups = createSelector(
  selectGroupsFilter,
  selectAllGroups,
  fromLabelGroups.selectFilteredGroups,
);

export const selectFilteredGroupLabels = (
  groupId: number,
): MemoizedSelector<object, AnnotationLabel[]> =>
  createSelector(
    selectGroupLabelsFilter,
    selectGroupById(groupId),
    fromLabelGroups.selectFilteredGroupLabels,
  );
