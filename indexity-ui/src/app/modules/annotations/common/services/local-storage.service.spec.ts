import { LocalStorageService } from '@app/annotations/common/services/local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const settings = {
    activateJsonExport: true,
    showLabels: true,
    activateJsonImport: true,
    activateAnnotationInterpolation: false,
    annotationInterpolationStep: 30,
    frameStep: 15,
    videoHeight: 480,
  };

  beforeEach(() => {
    service = new LocalStorageService();
    service.version = 1;
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVersion', () => {
    beforeEach(() => localStorage.clear());

    it('should clear settings (no version)', () => {
      localStorage.setItem(
        service.localStorageSettingsKey,
        JSON.stringify(settings),
      );
      service.getVersion();
      expect(localStorage.getItem(service.localStorageSettingsKey)).toBeNull();
    });

    it('should clear settings (version update)', () => {
      service.saveSettings(settings);
      service.version = 2;
      service.getVersion();
      expect(localStorage.getItem(service.localStorageSettingsKey)).toBeNull();
    });

    it('should not clear settings', () => {
      service.saveSettings(settings);
      service.getVersion();
      expect(localStorage.getItem(service.localStorageSettingsKey)).toEqual(
        JSON.stringify(settings),
      );
    });
  });

  describe('getSettings', () => {
    beforeEach(() => localStorage.clear());

    it('should return null', () => {
      const res = service.getSettings();
      expect(res).toBeNull();
    });

    it('should return parsed settings', () => {
      service.saveSettings(settings);
      const res = service.getSettings();
      expect(res).toEqual(settings);
    });
  });

  describe('saveSettings', () => {
    beforeEach(() => localStorage.clear());

    it('should set the current version', () => {
      service.version = 2;
      service.saveSettings(settings);
      expect(+localStorage.getItem(service.localStorageVersionKey)).toBe(
        service.version,
      );
    });

    it('should update settings', () => {
      expect(localStorage.getItem(service.localStorageSettingsKey)).toBeNull();
      service.saveSettings(settings);
      expect(localStorage.getItem(service.localStorageSettingsKey)).toEqual(
        JSON.stringify(settings),
      );
    });
  });

  describe('setVideoHeight', () => {
    beforeEach(() => localStorage.clear());

    it('should update settings', () => {
      const videoHeight = 600;
      const expected = JSON.stringify({
        ...settings,
        videoHeight,
      });
      expect(localStorage.getItem(service.localStorageSettingsKey)).toBeNull();
      service.saveSettings(settings);
      expect(localStorage.getItem(service.localStorageSettingsKey)).toEqual(
        JSON.stringify(settings),
      );
      service.setVideoHeight(videoHeight);
      expect(localStorage.getItem(service.localStorageSettingsKey)).toEqual(
        expected,
      );
    });
  });

  describe('Video Time', () => {
    beforeEach(() => localStorage.clear());

    it('should update video time', () => {
      const videoId = 1;
      const timestamp = 1000;
      const key = `${service.localStorageTimestampPrefix}${videoId}`;
      expect(localStorage.getItem(key)).toBeNull();
      service.saveVideoTime(videoId, timestamp);
      expect(localStorage.getItem(key)).toBe(timestamp.toString());
    });

    it('should get video time', () => {
      const videoId = 1;
      const timestamp = 1000;
      expect(service.getVideoTime(videoId)).toBe(0);
      service.saveVideoTime(videoId, timestamp);
      expect(service.getVideoTime(videoId)).toBe(timestamp);
    });
  });

  describe('clearStorage', () => {
    it('should clear settings', () => {
      service.saveSettings(settings);
      service.clearStorage();
      expect(localStorage.getItem(service.localStorageSettingsKey)).toBeNull();
    });
  });
});
