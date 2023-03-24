import { Injectable } from '@angular/core';
import {BehaviorSubject, EMPTY, timer} from 'rxjs';
import {PlayerState} from '../models/player';
import {distinctUntilChanged, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {TimelineStoreService} from './timeline-store.service';
import {nextEvent} from '../helpers';

@Injectable()
export class TimelinePlayerService {

  private readonly PLAYER_STEP = 10;

  private _playerState = new BehaviorSubject(PlayerState.PAUSED);
  playerState$ = this._playerState.asObservable().pipe(
    shareReplay(1),
    distinctUntilChanged()
  );

  readonly isPlaying$ = this.playerState$.pipe(
    map(state => state === PlayerState.PLAYING)
  );

  get playerState (): PlayerState {
    return this._playerState.getValue();
  }

  playerClock$ = this.playerState$.pipe(
    switchMap( state =>
      state === PlayerState.PLAYING ?
        timer(0, this.PLAYER_STEP) :
        EMPTY
    ),
    tap(_ => {
      this.timelineStore.currentTimestamp = this.timelineStore.currentTimestamp + this.PLAYER_STEP;
      if (this.timelineStore.currentTimestamp >= this.timelineStore.totalTime) {
        this.pause();
      }
    })
  );

  constructor(private timelineStore: TimelineStoreService) {
    this.playerClock$.subscribe();
  }

  play() {
    if (this.timelineStore.currentTimestamp === this.timelineStore.totalTime) {
      this.rewind();
    }
    this._playerState.next(PlayerState.PLAYING);
  }

  pause() {
    this._playerState.next(PlayerState.PAUSED);
  }

  tmpPause() {
    this._playerState.next(PlayerState.TMP_PAUSED);
  }

  rewind() {
    this.timelineStore.currentTimestamp = 0;
  }

  forwardNext() {
    const ts = this.timelineStore.currentTimestamp;
    const event = nextEvent(this.timelineStore.timelineEvents, ts);
    if (event) {
      this.timelineStore.currentTimestamp = event.timestamp + 1;
    }
  }

}
