import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as settingsQuery from './settings.reducer';
import * as fromSettings from '@app/settings-store';

import { resetSettings, setSettings, setVideoHeight } from './settings.actions';
import { Settings } from '@app/models/settings';

@Injectable()
export class SettingsStoreFacade {
  settings$ = this.store.pipe(select(fromSettings.getSettings));
  annotationInterpolationSettings$ = this.store.pipe(
    select(fromSettings.getAnnotationInterpolationSettings),
  );

  constructor(private store: Store<settingsQuery.State>) {}

  setSettings(settings: Settings): void {
    this.store.dispatch(setSettings({ payload: settings }));
  }

  setVideoHeight(videoHeight: number): void {
    this.store.dispatch(setVideoHeight({ payload: videoHeight }));
  }

  resetSettings(): void {
    this.store.dispatch(resetSettings());
  }
}
