import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import { createReducer, on } from '@ngrx/store';
import {
  clearAll,
  deleteLabel,
  fetchAllForVideoSuccess,
  fetchAllLabelsSuccess,
  fetchLabelSuccess,
  removeLabelSuccess,
  searchSuccess,
  updateLabelSuccess,
} from '@app/annotations/store/annotation-labels/annotation-labels.actions';
import { setState } from '@app/helpers/ngrx.helpers';

export interface State extends EntityState<AnnotationLabel> {
  searchResults: AnnotationLabel[];
}

export const annotationsLabelAdapter = createEntityAdapter<AnnotationLabel>({
  selectId: (label: AnnotationLabel) => label.name,
  sortComparer: false,
});

export const initialState: State = annotationsLabelAdapter.getInitialState({
  searchResults: [],
});

export const reducer = createReducer<State>(
  initialState,
  on(fetchAllForVideoSuccess, (state, { payload: labels }) =>
    annotationsLabelAdapter.setAll(labels, state),
  ),
  on(fetchLabelSuccess, (state, { payload: label }) =>
    annotationsLabelAdapter.addOne(label, state),
  ),
  on(updateLabelSuccess, (state, { payload: label }) =>
    annotationsLabelAdapter.updateOne(
      {
        id: label.name,
        changes: label,
      },
      state,
    ),
  ),
  on(searchSuccess, (state, { payload: searchResults }) =>
    setState({ searchResults }, state),
  ),
  on(removeLabelSuccess, (state, { payload: id }) =>
    annotationsLabelAdapter.removeOne(id, state),
  ),
  on(deleteLabel, (state, { payload: name }) =>
    setState(
      {
        searchResults: state.searchResults.filter((l) => l.name !== name),
      },
      state,
    ),
  ),
  on(fetchAllLabelsSuccess, (state, { payload: labels }) =>
    annotationsLabelAdapter.setAll(labels, state),
  ),
  on(clearAll, () =>
    annotationsLabelAdapter.getInitialState({
      searchResults: [],
    }),
  ),
);

export const {
  selectAll: getAllLabels,
} = annotationsLabelAdapter.getSelectors();

export const getSearchResults = (state: State): AnnotationLabel[] =>
  state.searchResults;
export const getLabelByName = (name: string) => (state: State) =>
  state.entities[name];
