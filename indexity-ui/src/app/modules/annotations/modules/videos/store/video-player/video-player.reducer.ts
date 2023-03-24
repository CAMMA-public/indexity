import { createReducer, on } from '@ngrx/store';
import {
  clear,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setVideoSize,
} from '@app/annotations/modules/videos/store/video-player/video-player.actions';
import { setState } from '@app/helpers/ngrx.helpers';

export interface State {
  currentTime: number;
  duration: number;
  videoSize: {
    h: number;
    w: number;
  };
  isPlaying: boolean;
}

export const initialState: State = {
  currentTime: 0,
  duration: 1,
  videoSize: {
    h: 0,
    w: 0,
  },
  isPlaying: false,
};

export const reducer = createReducer<State>(
  initialState,
  on(setCurrentTime, (state, { payload: currentTime }) =>
    setState({ currentTime }, state),
  ),
  on(setIsPlaying, (state, { payload: isPlaying }) =>
    setState({ isPlaying }, state),
  ),
  on(setDuration, (state, { payload: duration }) =>
    setState({ duration }, state),
  ),
  on(setVideoSize, (state, { payload: videoSize }) =>
    setState({ videoSize }, state),
  ),
  on(clear, () => initialState),
);

export const getCurrentTime = (state: State): number => state.currentTime;
export const getDuration = (state: State): number => state.duration;
export const getVideoSize = (state: State): { h: number; w: number } =>
  state.videoSize;
export const isVideoPlaying = (state: State): boolean => state.isPlaying;
