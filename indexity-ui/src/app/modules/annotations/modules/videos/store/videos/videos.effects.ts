import { Injectable } from '@angular/core';
import { VideoBookmarksService } from '@app/annotations/modules/videos/services/video-bookmarks.service';
import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import { InfoMessageService } from '@app/services/info-message.service';
import { SocketService } from '@app/annotations/services/socket.service';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { VideosSocketService } from '@app/annotations/services/videos-socket.service';
import { ConfigurationService } from 'angular-configuration-module';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';
import { logoutSuccess } from '@app/main-store/user/users.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  concatMap,
  exhaustMap,
  filter,
  map,
  pluck,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  addVideoBookmark,
  addVideoBookmarkSuccess,
  clear,
  load,
  loadAll,
  loadAllFailure,
  loadAllSuccess,
  loadBatch,
  loadBatchSuccess,
  loadFailure,
  loadFilteredVideosSuccess,
  loadSuccess,
  loadVideoBookmarkBatch,
  loadVideoBookmarks,
  loadVideoBookmarksIds,
  loadVideoBookmarksIdsSuccess,
  loadVideoBookmarksSuccess,
  loadVideosByIds,
  remove,
  removeFailure,
  removeSuccess,
  removeVideoBookmark,
  removeVideoBookmarkSuccess,
  searchVideosByAnnotationState,
  searchVideosByLabelName,
  searchVideosByName,
  setVideoAnnotationState,
  setVideoAnnotationStateFailure,
  thumbGenerated,
  updateFailure,
  updateVideo,
  videoAdded,
  videoUpdated,
} from './videos.actions';

@Injectable()
export class VideosEffects {
  constructor(
    private actions$: Actions,
    private videosApiService: VideosApiService,
    private videosFacade: VideosStoreFacade,
    private videosSocketService: VideosSocketService,
    private socketService: SocketService,
    private infoMessageService: InfoMessageService,
    private videoBookmarksService: VideoBookmarksService,
    private readonly configurationService: ConfigurationService,
  ) {}

  /*
   VIDEOS EFFECTS
   */

  // LOAD

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(load),
      extractPayload(),
      switchMap((id) =>
        this.videosApiService.show(id).pipe(
          toPayload(),
          map(loadSuccess),
          catchError((error) => {
            let errorMessage = error.error.message;
            if (error.error.statusCode === 404) {
              errorMessage = 'Video not found.';
            }
            this.infoMessageService.setMessage(errorMessage, true);
            return of(loadFailure({ payload: error.error }));
          }),
        ),
      ),
    ),
  );

  loadAllVideos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAll),
      concatMap(() =>
        this.videosApiService.getVideos().pipe(
          toPayload(),
          map(loadAllSuccess),
          catchError((err) => {
            if (err.error && err.error.statusText) {
              this.infoMessageService.setMessage(err.error.statusText, false);
            }
            return of(loadAllFailure({ payload: err }));
          }),
        ),
      ),
    ),
  );

  loadBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBatch),
      pluck('limit'),
      withLatestFrom(this.videosFacade.videosTotal$, this.videosFacade.filter$),
      concatMap(([limit, offset]) =>
        this.videosApiService
          .getVideos({
            offset,
            limit,
          })
          .pipe(toPayload(), map(loadBatchSuccess)),
      ),
    ),
  );

  loadByIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideosByIds),
      extractPayload(),
      filter((ids) => Boolean(ids && ids.length)),
      switchMap((ids) =>
        this.videosApiService
          .loadVideosByIds(ids)
          .pipe(toPayload(), map(loadBatchSuccess)),
      ),
    ),
  );

  // SET

  setVideoAnnotationState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setVideoAnnotationState),
        extractPayload(),
        switchMap(({ videoId, state }) =>
          this.videosApiService.setAnnotationState(videoId, state).pipe(
            catchError((err) => {
              this.infoMessageService.setMessage(err.error.statusText, false);
              return of(setVideoAnnotationStateFailure(err));
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  // UPDATE

  update$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateVideo),
        concatMap(({ payload }) =>
          this.videosApiService.updateVideo(payload).pipe(
            catchError((error) => {
              this.infoMessageService.setMessage('Could not update the video');
              return of(updateFailure({ payload: error }));
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  // REMOVE

  remove$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(remove),
        concatMap(({ payload: id }) =>
          this.videosApiService.deleteVideo(id).pipe(
            catchError((error) => {
              this.infoMessageService.setMessage('Could not delete the video');
              return of(removeFailure({ payload: error }));
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   VIDEOS BOOKMARKS EFFECTS
   */

  // LOAD

  loadBookmarkedVideos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoBookmarks),
      map(loadVideoBookmarksSuccess),
    ),
  );

  loadVideoBookmarksIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoBookmarksIds),
      concatMap(() =>
        this.videoBookmarksService
          .getBookmarkIds()
          .pipe(toPayload(), map(loadVideoBookmarksIdsSuccess)),
      ),
    ),
  );

  loadBookmarkedVideoBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoBookmarkBatch),
      extractPayload(),
      withLatestFrom(this.videosFacade.videosTotal$),
      concatMap(([limit, offset]) =>
        this.videoBookmarksService
          .index({
            offset,
            limit,
          })
          .pipe(toPayload(), map(loadBatchSuccess)),
      ),
    ),
  );

  // ADD

  addVideoBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addVideoBookmark),
      extractPayload(),
      exhaustMap((id) =>
        this.videoBookmarksService.create(id).pipe(
          map((res) => res.videoId),
          toPayload(),
          map(addVideoBookmarkSuccess),
        ),
      ),
    ),
  );

  // REMOVE

  removeVideoBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeVideoBookmark),
      extractPayload(),
      exhaustMap((id) =>
        this.videoBookmarksService.remove(id).pipe(
          map((res) => res.videoId),
          toPayload(),
          map(removeVideoBookmarkSuccess),
        ),
      ),
    ),
  );

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   FILTER EFFECTS
   */

  // SEARCH

  searchByName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchVideosByName),
      extractPayload(),
      withLatestFrom(this.videosFacade.videosTotal$),
      switchMap(([name, offset]) =>
        this.videosApiService.searchByName(name, { offset }).pipe(
          toPayload(),
          map(loadFilteredVideosSuccess),
          catchError(() => of(loadFilteredVideosSuccess({ payload: [] }))),
        ),
      ),
    ),
  );

  searchByAnnotationState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchVideosByAnnotationState),
      extractPayload(),
      withLatestFrom(this.videosFacade.videosTotal$),
      switchMap(([annotationState, offset]) =>
        this.videosApiService
          .searchByAnnotationState(annotationState, { offset })
          .pipe(
            toPayload(),
            map(loadFilteredVideosSuccess),
            catchError(() => of(loadFilteredVideosSuccess({ payload: [] }))),
          ),
      ),
    ),
  );

  searchByLabelName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchVideosByLabelName),
      extractPayload(),
      switchMap((labelName) =>
        this.videosApiService.searchByLabelName(labelName).pipe(
          toPayload(),
          map(loadFilteredVideosSuccess),
          catchError(() => of(loadFilteredVideosSuccess({ payload: [] }))),
        ),
      ),
    ),
  );

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   STORE
   */

  clearStore$ = createEffect(() =>
    this.actions$.pipe(ofType(logoutSuccess), map(clear)),
  );

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   SOCKET
   */

  videoAdded$ = createEffect(() =>
    this.videosSocketService.videoCreated$.pipe(
      toPayload(),
      map((video) =>
        videoAdded({
          payload: {
            ...video.payload,
            url: `${this.configurationService.configuration.apiConfig.baseUrl}/videos/${video.payload.id}/media`,
          },
        }),
      ),
    ),
  );

  videoUpdated$ = createEffect(() =>
    this.videosSocketService.videoUpdated$.pipe(
      toPayload(),
      map((video) => videoUpdated({ payload: video.payload })),
    ),
  );

  thumbnailGenerated$ = createEffect(() =>
    this.videosSocketService.videoThumbnailGenerated$.pipe(
      toPayload(),
      map(thumbGenerated),
    ),
  );

  videoRemoved$ = createEffect(() =>
    this.videosSocketService.videoDeleted$.pipe(
      toPayload(),
      map(removeSuccess),
    ),
  );

  connected$ = createEffect(() =>
    this.socketService.connected$.pipe(
      map((connected) => {
        if (connected) {
          return loadAll({});
        } else {
          this.infoMessageService.setMessage('Socket disconnected.', false);
          return loadAllFailure({ payload: 'Socket disconnected.' });
        }
      }),
    ),
  );
}
