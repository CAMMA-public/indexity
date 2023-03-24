import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as videoQuery from '@app/annotations/modules/videos/store/video-player/video-player.reducer';
import * as fromRoot from '@app/annotations-store';
import {
  clear,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setVideoSize,
} from './video-player.actions';

@Injectable()
export class VideoPlayerStoreFacade {
  currentTime$ = this.store.pipe(select(fromRoot.getCurrentVideoTime));

  isPlaying$ = this.store.pipe(select(fromRoot.isVideoPlaying));

  duration$ = this.store.pipe(select(fromRoot.getVideoDuration));

  size$ = this.store.pipe(select(fromRoot.getVideoSize));

  constructor(private store: Store<videoQuery.State>) {}

  setCurrentTime(currentTime: number): void {
    this.store.dispatch(setCurrentTime({ payload: Math.round(currentTime) }));
  }

  setDuration(duration: number): void {
    this.store.dispatch(setDuration({ payload: duration }));
  }

  setIsPlaying(isPlaying: boolean): void {
    this.store.dispatch(setIsPlaying({ payload: isPlaying }));
  }

  setVideoSize(videoSize: { h: number; w: number }): void {
    this.store.dispatch(setVideoSize({ payload: videoSize }));
  }

  clear(): void {
    this.store.dispatch(clear());
  }
}
