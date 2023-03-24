import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { createReducer, on } from '@ngrx/store';
import {
  addLabelsToGroupSuccess,
  createLabelGroup,
  createLabelGroupFailure,
  createLabelGroupSuccess,
  loadAllLabelGroups,
  loadAllLabelGroupsFailure,
  loadAllLabelGroupsSuccess,
  loadOneLabelGroup,
  loadOneLabelGroupFailure,
  loadOneLabelGroupSuccess,
  removeLabelsFromGroupSuccess,
  removeOneLabelGroup,
  removeOneLabelGroupFailure,
  removeOneLabelGroupSuccess,
  searchGroupLabels,
  searchLabelGroups,
  updateLabelGroup,
  updateLabelGroupFailure,
  updateLabelGroupSuccess,
} from '@app/annotations/store/label-groups/label-groups.actions';
import { escapeRegExp } from '@app/annotations/helpers/base.helpers';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';
import { setState } from '@app/helpers/ngrx.helpers';

export const adapter = createEntityAdapter<AnnotationLabelGroup>({
  selectId: (g) => g.id,
});

export interface State extends EntityState<AnnotationLabelGroup> {
  isLoading: boolean;
  groupLabelsFilter: string;
  groupsFilter?: string;
}

export const INIT_STATE: State = adapter.getInitialState({
  isLoading: false,
  groupLabelsFilter: undefined,
  groupsFilter: undefined,
});

export const reducer = createReducer(
  INIT_STATE,
  on(
    loadAllLabelGroups,
    createLabelGroup,
    updateLabelGroup,
    loadOneLabelGroup,
    removeOneLabelGroup,
    (state) => setState({ isLoading: true }, state),
  ),
  on(
    loadAllLabelGroupsSuccess,
    loadAllLabelGroupsFailure,
    createLabelGroupSuccess,
    createLabelGroupFailure,
    updateLabelGroupFailure,
    updateLabelGroupSuccess,
    loadOneLabelGroupFailure,
    loadOneLabelGroupSuccess,
    removeOneLabelGroupSuccess,
    removeOneLabelGroupFailure,
    (state) => setState({ isLoading: false }, state),
  ),
  on(
    addLabelsToGroupSuccess,
    removeLabelsFromGroupSuccess,
    (state, { payload: group }) =>
      adapter.updateOne(
        {
          id: group.id,
          changes: group,
        },
        state,
      ),
  ),
  on(loadAllLabelGroupsSuccess, (state, { payload: groups }) =>
    adapter.setAll(groups, state),
  ),
  on(loadOneLabelGroupSuccess, (state, { payload: group }) =>
    adapter.upsertOne(group, state),
  ),
  on(createLabelGroupSuccess, (state, { payload: group }) =>
    adapter.addOne(group, state),
  ),
  on(updateLabelGroupSuccess, (state, { payload: group }) =>
    adapter.upsertOne(group, state),
  ),
  on(removeOneLabelGroupSuccess, (state, { payload: group }) =>
    adapter.removeOne(group.id, state),
  ),
  on(searchLabelGroups, (state, { payload: q }) =>
    setState({ groupsFilter: q }, state),
  ),
  on(searchGroupLabels, (state, { payload: q }) =>
    setState({ groupLabelsFilter: q }, state),
  ),
);

export const selectIsLoading = (state: State): boolean => state.isLoading;
export const selectGroupsFilter = (state: State): string => state.groupsFilter;
export const selectGroupLabelsFilter = (state: State): string =>
  state.groupLabelsFilter;

const byNameAndDescription = (q: string) => (group: AnnotationLabelGroup) => {
  const nameMatch = group.name
    .toLowerCase()
    .match(`${escapeRegExp(q).toLowerCase()}.*`);
  const descrMatch =
    group.description && group.description.length
      ? group.description
          .toLowerCase()
          .match(`${escapeRegExp(q).toLowerCase()}.*`)
      : null;
  return nameMatch || descrMatch;
};

export const byName = (name: string) => (label: AnnotationLabel) =>
  label.name.toLowerCase().match(`${escapeRegExp(name).toLowerCase()}.*`);

export const selectFilteredGroups = (
  q: string,
  groups: AnnotationLabelGroup[],
): AnnotationLabelGroup[] =>
  q && q.length > 0 ? groups.filter(byNameAndDescription(q)) : groups;

export const selectFilteredGroupLabels = (
  q: string,
  group: AnnotationLabelGroup,
): AnnotationLabel[] =>
  group
    ? q && q.length > 0
      ? group.labels.filter(byName(q))
      : group.labels
    : [];
