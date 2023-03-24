import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  loadAllVideoStatsSuccess,
  loadVideoGroupsSuccess,
  loadVideoStat,
  loadVideoStats,
  loadVideoStatsFailure,
  loadVideoStatsSuccess,
  loadVideoStatSuccess,
} from '@app/annotations/modules/videos/store/video-stats/video-stats.actions';
import { catchError, concatMap, filter, map, switchMap } from 'rxjs/operators';
import { VideoStatsService } from '@app/annotations/services/video-stats.service';
import {
  clear,
  loadAllSuccess,
  loadSuccess,
  videoAdded,
} from '@app/annotations/modules/videos/store/videos/videos.actions';
import { of } from 'rxjs';
import { VideoGroupsService } from '@app/annotations/services/video-groups.service';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';

@Injectable()
export class VideoStatsEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoStat),
      extractPayload(),
      filter((p) => !!p),
      switchMap((id) =>
        this.videoStatsService
          .getStatsForVideo(id)
          .pipe(toPayload(), map(loadVideoStatSuccess)),
      ),
    ),
  );

  loadMultiple$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoStats),
      extractPayload(),
      filter((ids) => Boolean(ids && ids.length)),
      concatMap((ids) =>
        this.videoStatsService
          .getStats(ids)
          .pipe(toPayload(), map(loadVideoStatsSuccess)),
      ),
    ),
  );

  /// Synchronize with Videos side effects to fetch stats as videos arrive in the Store

  videoLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSuccess, videoAdded),
      extractPayload(),
      filter((p) => !!p),
      concatMap((video) =>
        this.videoStatsService.getStatsForVideo(video.id).pipe(
          toPayload(),
          map(loadVideoStatSuccess),
          catchError((err) => of(loadVideoStatsFailure(err.error))),
        ),
      ),
    ),
  );

  // videoBatchLoaded$ = createEffect(() => this.actions$.pipe(
  //   ofType(loadBatchSuccess),
  //   extractPayload(),
  //   filter(videos => Boolean(videos && videos.length)),
  //   concatMap(videos => this.videoStatsService.getStats(videos.map(v => v.id)).pipe(
  //     toPayload(),
  //     map(loadVideoStatsSuccess))
  //   )
  // ));

  allVideosLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAllSuccess),
      extractPayload(),
      filter((videos) => Boolean(videos && videos.length)),
      concatMap((videos) =>
        this.videoStatsService
          .getStats(videos.map((v) => v.id))
          .pipe(toPayload(), map(loadAllVideoStatsSuccess)),
      ),
    ),
  );

  videosClear$ = createEffect(() =>
    this.actions$.pipe(
      ofType(clear),
      map(() => loadAllVideoStatsSuccess({ payload: [] })),
    ),
  );

  loadVideoGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoStatSuccess),
      extractPayload(),
      map((stat) => stat.groupIds),
      filter((groupIds) => groupIds.length > 0),
      concatMap((groupIds) =>
        this.videoGroups
          .loadByIds(groupIds)
          .pipe(toPayload(), map(loadVideoGroupsSuccess)),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private videoStatsService: VideoStatsService,
    private videoGroups: VideoGroupsService,
  ) {}
}
