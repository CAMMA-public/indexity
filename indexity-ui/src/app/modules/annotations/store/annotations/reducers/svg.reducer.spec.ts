import * as fromSvg from './svg.reducer';
import { DrawingMode, NormalMode } from '../../../modules/videos/models/mode';
import { setMode, setOverlay, setShape } from '../actions/svg.actions';

describe('Svg Reducer', () => {
  const shape = {
    positions: {
      100: {
        x: 14,
        y: 22,
        width: 10,
        height: 10,
      },
    },
  };

  it('should set init state when action is unknown', () => {
    const action = {} as any;
    const res = fromSvg.reducer(undefined, action);
    expect(res).toBe(fromSvg.initialState);
  });

  it('should set shape', () => {
    const result = fromSvg.reducer(
      fromSvg.initialState,
      setShape({ payload: shape }),
    );
    expect(result.shape).toBe(shape);
  });

  it('should set overlay', () => {
    const overlay = {
      top: 0,
      left: 0,
      width: 720,
      height: 480,
    };
    const result = fromSvg.reducer(
      fromSvg.initialState,
      setOverlay({ payload: overlay }),
    );
    expect(result.overlay).toEqual(overlay);
  });

  it('should reset shape', () => {
    let result = fromSvg.reducer(
      fromSvg.initialState,
      setShape({ payload: shape }),
    );
    expect(result.shape).toBe(shape);
    result = fromSvg.reducer(result, setShape({}));
    expect(result.shape).toEqual(fromSvg.initialState.shape);
  });

  it('should set normal mode', () => {
    const result = fromSvg.reducer(
      fromSvg.initialState,
      setMode({ payload: NormalMode }),
    );
    expect(result.mode).toBe(NormalMode);
  });

  it('should set drawing mode', () => {
    const result = fromSvg.reducer(
      fromSvg.initialState,
      setMode({ payload: DrawingMode }),
    );
    expect(result.mode).toBe(DrawingMode);
  });

  describe('selections', () => {
    const state: fromSvg.State = {
      ...fromSvg.initialState,
      mode: DrawingMode,
      shape: {
        positions: {},
      },
    };

    it('getMode', () => {
      expect(fromSvg.getMode(state)).toBe(state.mode);
    });

    it('getShape', () => {
      expect(fromSvg.getShape(state)).toBe(state.shape);
    });
  });
});
