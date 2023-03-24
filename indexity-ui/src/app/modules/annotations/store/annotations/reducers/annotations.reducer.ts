import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { createReducer, on } from '@ngrx/store';
import {
  annotationCreated,
  annotationRemoved,
  annotationUpdated,
  clear,
  loadAllSuccess,
  loadAnnotationToUpdateSuccess,
  clearAnnotationToUpdate,
  setTmpAnnotation,
  updateTmpAnnotation,
} from '@app/annotations/store/annotations/actions/annotation.actions';
import { setState } from '@app/helpers/ngrx.helpers';

export interface State extends EntityState<Annotation> {
  tmpNewAnnotation: Annotation;
  annotationToUpdate: Annotation;
}

export const annotationsAdapter: EntityAdapter<Annotation> = createEntityAdapter<
  Annotation
>({
  selectId: (annotation: Annotation) => annotation.id, // entity's primary key selector
  sortComparer: false, // disable sorting for performance
});

export const initialState: State = annotationsAdapter.getInitialState({
  tmpNewAnnotation: undefined,
  annotationToUpdate: undefined,
});

export const reducer = createReducer<State>(
  initialState,
  on(loadAllSuccess, (state, { payload: annotation }) =>
    annotationsAdapter.setAll(annotation, state),
  ),
  on(loadAnnotationToUpdateSuccess, (state, { payload: annotation }) =>
    setState({ annotationToUpdate: annotation }, state),
  ),
  on(clearAnnotationToUpdate, (state) =>
    setState({ annotationToUpdate: initialState.annotationToUpdate }, state),
  ),
  on(annotationCreated, (state, { payload: annotation }) =>
    annotationsAdapter.addOne(annotation, state),
  ),
  on(annotationUpdated, (state, { payload: annotation }) =>
    annotationsAdapter.updateOne(
      { id: annotation.id, changes: annotation },
      state,
    ),
  ),
  on(annotationRemoved, (state, { payload: id }) => {
    if (state.tmpNewAnnotation && id === state.tmpNewAnnotation.id) {
      return annotationsAdapter.removeOne(id, {
        ...state,
        tmpNewAnnotation: undefined,
      });
    } else {
      return annotationsAdapter.removeOne(id, state);
    }
  }),
  on(setTmpAnnotation, (state, action) =>
    setState({ tmpNewAnnotation: action.payload }, state),
  ),

  on(updateTmpAnnotation, (state, { payload: tmpAnnotationUpdate }) =>
    setState(
      {
        tmpNewAnnotation: { ...state.tmpNewAnnotation, ...tmpAnnotationUpdate },
      },
      state,
    ),
  ),
  on(clear, () => initialState),
);

export const {
  selectAll: getAllAnnotations,
} = annotationsAdapter.getSelectors();

export const getTmpAnnotation = (state: State): Annotation =>
  state.tmpNewAnnotation;

export const getAnnotationToUpdate = (state: State): Annotation =>
  state.annotationToUpdate;
