import {
  initialState,
  reducer,
  getAnnotationInterpolationSettings,
} from './settings.reducer';
import {
  resetSettings,
  setSettings,
} from '@app/annotations/store/settings/settings.actions';

describe('Settings Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('SetSettings', () => {
    it('should set the settings', () => {
      const settings = {
        activateJsonExport: true,
        showLabels: true,
        activateJsonImport: true,
        activateAnnotationInterpolation: false,
        annotationInterpolationStep: 30,
        frameStep: 15,
        videoHeight: 480,
      };
      const action = setSettings({ payload: settings });
      const state = reducer(initialState, action);
      expect(state.settings).toEqual(settings);
    });

    it('should reset the settings', () => {
      const settings = {
        activateJsonExport: true,
        showLabels: true,
        activateJsonImport: true,
        activateAnnotationInterpolation: false,
        annotationInterpolationStep: 30,
        frameStep: 15,
        videoHeight: 480,
      };
      const action = setSettings({ payload: settings });
      const state = reducer(initialState, action);
      expect(state.settings).toEqual(settings);

      const resetAction = resetSettings();
      const resetState = reducer(state, resetAction);
      expect(resetState.settings).toEqual(initialState.settings);
    });
  });

  describe('selectors', () => {
    const settings = {
      activateJsonExport: true,
      showLabels: true,
      activateJsonImport: true,
      activateAnnotationInterpolation: true,
      annotationInterpolationStep: 30,
      frameStep: 15,
      videoHeight: 480,
    };

    it('getAnnotationInterpolationSettings', () => {
      const expected = {
        activateAnnotationInterpolation: true,
        annotationInterpolationStep: 30,
      };
      expect(getAnnotationInterpolationSettings(settings)).toEqual(expected);
    });
  });
});
