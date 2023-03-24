import { Injectable } from '@angular/core';
import { Settings } from '@app/models/settings';

@Injectable()
export class LocalStorageService {
  localStoragePrefix = 'indexity-';
  localStorageVersionKey = `${this.localStoragePrefix}version`;
  version = 2;

  localStorageSettingsKey = `${this.localStoragePrefix}settings`;
  localStorageTimestampPrefix = `${this.localStoragePrefix}timestamp-`;

  constructor() {
    this.getVersion();
  }

  getVersion(): void {
    const storedVersion = localStorage.getItem(this.localStorageVersionKey);
    if (!storedVersion || +storedVersion < this.version) {
      this.clearStorage();
    }
  }

  getSettings(): Settings {
    const storedSettings = localStorage.getItem(this.localStorageSettingsKey);
    return storedSettings ? JSON.parse(storedSettings) : null;
  }

  saveSettings(settings: Settings): void {
    localStorage.setItem(
      this.localStorageSettingsKey,
      JSON.stringify(settings),
    );
    localStorage.setItem(this.localStorageVersionKey, this.version.toString());
  }

  setVideoHeight(videoHeight: number): void {
    const settings = this.getSettings();
    if (settings) {
      this.saveSettings({
        ...settings,
        videoHeight,
      });
    }
  }

  getVideoTime(videoId: number): number {
    return +localStorage.getItem(
      `${this.localStorageTimestampPrefix}${videoId}`,
    );
  }

  saveVideoTime(videoId: number, timestamp: number): void {
    if (timestamp > 0) {
      localStorage.setItem(
        `${this.localStorageTimestampPrefix}${videoId}`,
        timestamp.toString(),
      );
    } else {
      localStorage.removeItem(`${this.localStorageTimestampPrefix}${videoId}`);
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.localStorageSettingsKey);
  }
}
