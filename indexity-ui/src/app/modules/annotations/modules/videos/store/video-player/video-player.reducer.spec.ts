import * as fromVideo from './video-player.reducer';
import { initialState } from './video-player.reducer';
import {
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setVideoSize,
} from '@app/annotations/modules/videos/store/video-player/video-player.actions';

describe('Video Reducer', () => {
  it('should set init state when action is unknown', () => {
    const action = {} as any;
    const res = fromVideo.reducer(undefined, action);
    expect(res).toBe(fromVideo.initialState);
  });

  it('should set current time', () => {
    const currentTime = 1;
    const result = fromVideo.reducer(
      initialState,
      setCurrentTime({ payload: currentTime }),
    );
    expect(result.currentTime).toBe(currentTime);
  });

  it('should set duration', () => {
    const duration = 60;
    const result = fromVideo.reducer(
      initialState,
      setDuration({ payload: duration }),
    );
    expect(result.duration).toBe(duration);
  });

  it('should set size', () => {
    const size = {
      h: 720,
      w: 1280,
    };
    const result = fromVideo.reducer(
      initialState,
      setVideoSize({ payload: size }),
    );
    expect(result.videoSize).toEqual(size);
  });

  it('should set is playing', () => {
    const result = fromVideo.reducer(
      initialState,
      setIsPlaying({ payload: true }),
    );
    expect(result.isPlaying).toBe(true);
    const result2 = fromVideo.reducer(
      initialState,
      setIsPlaying({ payload: false }),
    );
    expect(result2.isPlaying).toBe(false);
  });

  describe('selections', () => {
    const state: fromVideo.State = {
      ...fromVideo.initialState,
      currentTime: 35,
      duration: 36,
      videoSize: {
        h: 0,
        w: 0,
      },
    };

    it('getCurrentTime', () => {
      expect(fromVideo.getCurrentTime(state)).toBe(state.currentTime);
    });

    it('getDuration', () => {
      expect(fromVideo.getDuration(state)).toBe(state.duration);
    });
  });
});
