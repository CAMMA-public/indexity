import { AnnotationShape } from '@app/annotations/common/models/annotation-shape.model';
import { createReducer, on } from '@ngrx/store';
import {
  clear,
  setMode,
  setOverlay,
  setShape,
} from '@app/annotations/store/annotations/actions/svg.actions';
import { Mode, NormalMode } from '@app/annotations/modules/videos/models/mode';
import { setState } from '@app/helpers/ngrx.helpers';

export interface State {
  mode: Mode;
  shape: AnnotationShape;
  overlay: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

const initialShape: AnnotationShape = {
  positions: {},
};

export const initialState: State = {
  mode: NormalMode,
  shape: initialShape,
  overlay: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

export const reducer = createReducer<State>(
  initialState,
  on(setMode, (state, { payload: mode }) => setState({ mode }, state)),
  on(setOverlay, (state, { payload: overlay }) => setState({ overlay }, state)),
  on(setShape, (state, action) =>
    setState(
      {
        shape: action.payload ? action.payload : { ...initialState.shape },
      },
      state,
    ),
  ),
  on(clear, () => initialState),
);

export const getMode = (state: State): Mode => state.mode;
export const getShape = (state: State): AnnotationShape => state.shape;
export const getOverlay = (
  state: State,
): { top: number; left: number; width: number; height: number } =>
  state.overlay;
