import {
  Action,
  combineReducers,
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import * as fromSvg from './reducers/svg.reducer';
import * as fromVideo from '@app/videos-store/video-player/video-player.reducer';
import * as fromAnnotations from './reducers/annotations.reducer';
import * as fromAnnotationLabels from '@app/annotations/store/annotation-labels';
import { toAnnotationWithLabel } from '@app/annotations/common/helpers/annotations.helper';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import { Annotation } from '@app/annotations/models/annotation.model';

export interface State {
  svg: fromSvg.State;
  annotations: fromAnnotations.State;
  video: fromVideo.State;
}

export const reducers = (state: State | undefined, action: Action): any =>
  combineReducers({
    svg: fromSvg.reducer,
    annotations: fromAnnotations.reducer,
    video: fromVideo.reducer,
  })(state, action);

export const getAnnotationsRootState = createFeatureSelector<State>(
  'annotations',
);

export const getAnnotationsState = createSelector(
  getAnnotationsRootState,
  (state: State): fromAnnotations.State => state.annotations,
);

export const getAllAnnotations = createSelector(
  getAnnotationsState,
  fromAnnotations.getAllAnnotations,
);

export const getTmpAnnotation = createSelector(
  getAnnotationsState,
  fromAnnotations.getTmpAnnotation,
);

export const getAnnotationToUpdate = createSelector(
  getAnnotationsState,
  fromAnnotations.getAnnotationToUpdate,
);

export const getAllAnnotationsWithLabels = createSelector(
  getAllAnnotations,
  fromAnnotationLabels.getAllLabels,
  (annotations, labels) =>
    annotations
      .map((annotation) => toAnnotationWithLabel(annotation)(labels))
      .filter((annotation) => annotation.label),
);

export const getSvgState = createSelector(
  getAnnotationsRootState,
  (state: State): fromSvg.State => state.svg,
);

export const getMode = createSelector(getSvgState, fromSvg.getMode);

export const getShape = createSelector(getSvgState, fromSvg.getShape);
export const getSvgOverlay = createSelector(getSvgState, fromSvg.getOverlay);

export const getVideoState = createSelector(
  getAnnotationsRootState,
  (state: State): fromVideo.State => {
    return state && state.video ? state.video : fromVideo.initialState;
  },
);

export const getCurrentVideoTime = createSelector(
  getVideoState,
  fromVideo.getCurrentTime,
);

export const isVideoPlaying = createSelector(
  getVideoState,
  fromVideo.isVideoPlaying,
);
export const getVideoDuration = createSelector(
  getVideoState,
  fromVideo.getDuration,
);

export const getVideoSize = createSelector(
  getVideoState,
  fromVideo.getVideoSize,
);

export const getAnnotationsByLabel = (
  label: Partial<AnnotationLabel>,
): MemoizedSelector<object, Annotation[]> =>
  createSelector(getAllAnnotationsWithLabels, (annotations) =>
    annotations.filter((a) => a.label && a.label.name === label.name),
  );

export const countAnnotationsByLabel = (
  label: Partial<AnnotationLabel>,
): MemoizedSelector<object, number> =>
  createSelector(
    getAnnotationsByLabel(label),
    (annotations) => annotations.length,
  );

export const getAnnotationsByLabelName = (
  labelName: string,
): MemoizedSelector<object, Annotation[]> =>
  createSelector(getAllAnnotations, (annotations) =>
    annotations.filter((a) => a.labelName === labelName),
  );
