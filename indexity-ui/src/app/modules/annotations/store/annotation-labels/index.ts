import * as fromAnnotationLabels from './annotation-labels.reducer';
import {
  Action,
  combineReducers,
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

export interface State {
  annotationLabels: fromAnnotationLabels.State;
}

export const reducers = (state: State | undefined, action: Action): any =>
  combineReducers({
    annotationLabels: fromAnnotationLabels.reducer,
  })(state, action);

export const getAnnotationLabelsRootState = createFeatureSelector<State>(
  'annotationLabels',
);
export const getAnnotationLabelsState = createSelector(
  getAnnotationLabelsRootState,
  (state) => state.annotationLabels,
);
export const getAllLabels = createSelector(
  getAnnotationLabelsState,
  fromAnnotationLabels.getAllLabels,
);
export const getSearchResults = createSelector(
  getAnnotationLabelsState,
  fromAnnotationLabels.getSearchResults,
);
export const getLabel = (
  name: string,
): MemoizedSelector<object, AnnotationLabel> =>
  createSelector(
    getAnnotationLabelsState,
    fromAnnotationLabels.getLabelByName(name),
  );
