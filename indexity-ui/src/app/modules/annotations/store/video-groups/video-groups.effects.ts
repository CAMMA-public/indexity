import { Injectable } from '@angular/core';
import { buildFiltersString } from '@app/annotations/helpers/base.helpers';
import { VideoBookmarksService } from '@app/videos/services/video-bookmarks.service';
import { InfoMessageService } from '@app/services/info-message.service';
import { VideoGroupsSocketService } from '@app/annotations/services/video-groups-socket.service';
import { VideoGroupsService } from '@app/annotations/services/video-groups.service';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { VideosSocketService } from '@app/annotations/services/videos-socket.service';
import {
  addVideosToGroup,
  createGroup,
  createGroupFailure,
  createGroupSuccess,
  loadAllGroups,
  loadAllGroupsSuccess,
  loadGroup,
  loadGroupBatchSuccess,
  loadGroupError,
  loadGroupSuccess,
  loadGroupVideos,
  loadGroupVideosBatch,
  loadGroupVideosBatchSuccess,
  loadGroupVideosSuccess,
  loadNextGroupBatch,
  removeGroup,
  removeGroupSuccess,
  removeVideosFromGroup,
  searchGroups,
  searchVideosByNameInCurrentVideoGroup,
  updateGroup,
  updateGroupSuccess,
  loadFilteredGroupVideosSuccess,
  loadGroupUsers,
  addUserToGroup,
  removeUserFromGroup,
  loadGroupUsersSuccess,
  loadGroupUsersBatch,
  loadGroupUsersBatchSuccess,
  loadFilteredGroupUsersBatch,
  loadFilteredGroupUsersBatchSuccess,
  loadUsersWithExcludedIds,
  loadUsersWithExcludedIdsSuccess,
  loadUsersBatchWithExcludedIds,
  loadUsersBatchWithExcludedIdsSuccess,
  loadFilteredUsersBatchSuccess,
  loadUsersBatchWithNameAndExcludedIds,
} from '@app/annotations/store/video-groups/video-groups.actions';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import {
  addVideoBookmark,
  addVideoBookmarkSuccess,
  loadNextVideoBatchByExcludedIds,
  loadVideoBookmarks,
  loadVideosBatchSuccess,
  loadVideosByExcludedIds,
  loadVideosSuccess,
  removeVideoBookmark,
  removeVideoBookmarkSuccess,
  removeVideoSuccess,
  searchVideosAndExcludeIds,
  searchVideosSuccess,
  setLabelGroup,
  setLabelGroupSuccess,
  setVideoAnnotationState,
  setVideoAnnotationStateFailure,
  videoUpdated,
} from '@app/annotations/store/video-groups/videos.actions';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';
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
import { loadVideoBookmarksIdsSuccess } from '@app/videos/store/videos/videos.actions';
import { UsersService } from '@app/annotations/services/users.service';

@Injectable()
export class VideoGroupsEffects {
  createGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(createGroup),
        extractPayload(),
        exhaustMap((group) =>
          this.videoGroups.addOne(group).pipe(
            catchError((err) => {
              if (err.error && err.error.statusText) {
                this.infoMessageService.setMessage(err.error.statusText, false);
              }
              return of(createGroupFailure({ payload: err.error }));
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  updateGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateGroup),
        extractPayload(),
        exhaustMap((group) => this.videoGroups.updateOne(group)),
      ),
    { dispatch: false },
  );

  loadAllGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAllGroups),
      extractPayload(),
      concatMap((opts) =>
        this.videoGroups
          .getMany(opts)
          .pipe(toPayload(), map(loadAllGroupsSuccess)),
      ),
    ),
  );

  loadGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroup),
      extractPayload(),
      concatMap((id) =>
        this.videoGroups.getOne(id).pipe(
          toPayload(),
          map(loadGroupSuccess),
          catchError((error) => {
            let errorMessage = error.error.message;
            if (error.error.statusCode === 404) {
              errorMessage = 'Group not found.';
            }
            this.infoMessageService.setMessage(errorMessage, true);
            return of(loadGroupError({ payload: error.error }));
          }),
        ),
      ),
    ),
  );

  removeGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeGroup),
        extractPayload(),
        exhaustMap((groupId) => this.videoGroups.removeOne(groupId)),
      ),
    { dispatch: false },
  );

  searchGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchGroups),
      extractPayload(),
      filter((q) => q && q.length > 0),
      switchMap((q) =>
        this.videoGroups
          .search(q)
          .pipe(toPayload(), map(loadGroupBatchSuccess)),
      ),
    ),
  );

  loadNextGroupBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNextGroupBatch),
      pluck('limit'),
      withLatestFrom(this.videoGroupsFacade.totalVideoGroups$),
      concatMap(([limit, offset]) =>
        this.videoGroups
          .getMany({
            offset,
            limit,
          })
          .pipe(toPayload(), map(loadGroupBatchSuccess)),
      ),
    ),
  );

  setLabelGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setLabelGroup),
      extractPayload(),
      concatMap(({ annotationLabelGroupId, videoGroupId: id }) =>
        this.videoGroups
          .updateOne({ id, annotationLabelGroupId })
          .pipe(toPayload(), map(setLabelGroupSuccess)),
      ),
    ),
  );

  //////////////////////////////////////////////////////////////////////////

  loadGroupVideos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroupVideos),
      extractPayload(),
      concatMap((id) =>
        this.videoGroups
          .getVideos(id)
          .pipe(toPayload(), map(loadGroupVideosSuccess)),
      ),
    ),
  );

  addVideosToGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addVideosToGroup),
        extractPayload(),
        concatMap(({ groupId, videoIds }) =>
          this.videoGroups.addVideos(groupId, videoIds),
        ),
      ),
    { dispatch: false },
  );

  removeVideosFromGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeVideosFromGroup),
        extractPayload(),
        concatMap(({ groupId, videoIds }) =>
          this.videoGroups.removeVideos(groupId, videoIds),
        ),
      ),
    { dispatch: false },
  );

  /////////////////////////////////////////////////////////////////////////////////

  loadVideosByExcludedIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideosByExcludedIds),
      extractPayload(),
      switchMap((ids) =>
        this.videosApiService
          .getVideos({ offset: 0, limit: 15 }, buildFiltersString(ids))
          .pipe(toPayload(), map(loadVideosSuccess)),
      ),
    ),
  );

  loadNextVideoBatchByExcludedIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNextVideoBatchByExcludedIds),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalVideos$),
      concatMap(([{ ids, limit }, totalVideos]) =>
        this.videosApiService
          .getVideos({ offset: totalVideos, limit }, buildFiltersString(ids))
          .pipe(toPayload(), map(loadVideosBatchSuccess)),
      ),
    ),
  );

  searchVideosAndExcludeIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchVideosAndExcludeIds),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalVideos$),
      switchMap(([{ ids, name }, totalVideos]) =>
        this.videosApiService
          .getVideos(
            { offset: totalVideos, limit: 15 },
            buildFiltersString(ids, name),
          )
          .pipe(toPayload(), map(searchVideosSuccess)),
      ),
    ),
  );

  //// GROUP USERS ////////////////////////////////////////////////////////////

  loadGroupUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroupUsers),
      extractPayload(),
      concatMap(({ groupId, limit }) =>
        this.videoGroups
          .getUsers(groupId, { offset: 0, limit })
          .pipe(toPayload(), map(loadGroupUsersSuccess)),
      ),
    ),
  );

  loadNextGroupUsersBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroupUsersBatch),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalGroupUsers$),
      concatMap(([{ groupId, limit }, totalGroupUsers]) =>
        this.videoGroups
          .getUsers(groupId, { offset: totalGroupUsers, limit })
          .pipe(toPayload(), map(loadGroupUsersBatchSuccess)),
      ),
    ),
  );

  loadNextFilteredGroupUsersBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFilteredGroupUsersBatch),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalGroupUsers$),
      switchMap(([{ groupId, limit, name }, totalGroupUsers]) =>
        this.videoGroups
          .searchUsersByName(groupId, { offset: totalGroupUsers, limit }, name)
          .pipe(toPayload(), map(loadFilteredGroupUsersBatchSuccess)),
      ),
    ),
  );

  addUserToGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addUserToGroup),
        extractPayload(),
        concatMap(({ groupId, userId }) =>
          this.videoGroups.addUser(groupId, userId),
        ),
      ),
    { dispatch: false },
  );

  removeUserFromGroup$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeUserFromGroup),
        extractPayload(),
        concatMap(({ groupId, userId }) =>
          this.videoGroups.removeUser(groupId, userId),
        ),
      ),
    { dispatch: false },
  );

  //// USERS //////////////////////////////////////////////////////////////

  loadUsersWithExcludedIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsersWithExcludedIds),
      extractPayload(),
      concatMap(({ limit, excludedIds }) =>
        this.usersService
          .getMany({ offset: 0, limit }, excludedIds)
          .pipe(toPayload(), map(loadUsersWithExcludedIdsSuccess)),
      ),
    ),
  );

  loadUsersBatchWithExcludedIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsersBatchWithExcludedIds),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalUsers$),
      concatMap(([{ limit, excludedIds }, totalUsers]) =>
        this.usersService
          .getMany({ offset: totalUsers, limit }, excludedIds)
          .pipe(toPayload(), map(loadUsersBatchWithExcludedIdsSuccess)),
      ),
    ),
  );

  loadUsersBatchWithNameAndExcludedIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsersBatchWithNameAndExcludedIds),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalUsers$),
      switchMap(([{ name, excludedIds }, totalUsers]) =>
        this.usersService
          .searchUsersByName(
            { offset: totalUsers, limit: 15 },
            name,
            excludedIds,
          )
          .pipe(toPayload(), map(loadFilteredUsersBatchSuccess)),
      ),
    ),
  );

  ////////////////////////////////////////////////////////////////////////

  loadNextGroupVideosBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroupVideosBatch),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalGroupVideos$),
      concatMap(([{ groupId, limit }, totalVideos]) =>
        this.videoGroups
          .getVideos(groupId, { offset: totalVideos, limit })
          .pipe(toPayload(), map(loadGroupVideosBatchSuccess)),
      ),
    ),
  );

  searchVideosByName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchVideosByNameInCurrentVideoGroup),
      extractPayload(),
      withLatestFrom(this.videoGroupsFacade.totalGroupVideos$),
      switchMap(([{ groupId, name }, totalVideos]) =>
        this.videoGroups
          .searchVideosByName(groupId, { offset: totalVideos, limit: 15 }, name)
          .pipe(toPayload(), map(loadFilteredGroupVideosSuccess)),
      ),
    ),
  );

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

  loadVideoBookmarks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVideoBookmarks),
      concatMap(() =>
        this.videoBookmarksService
          .getBookmarkIds()
          .pipe(toPayload(), map(loadVideoBookmarksIdsSuccess)),
      ),
    ),
  );

  createVideoBookmark$ = createEffect(() =>
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

  videoRemoved$ = createEffect(() =>
    this.videosSocketService.videoDeleted$.pipe(
      toPayload(),
      map(removeVideoSuccess),
    ),
  );

  //////// SOCKET /////////

  groupAdded$ = createEffect(() =>
    this.videoGroupsSocketService.videoGroupCreated$.pipe(
      toPayload(),
      map(createGroupSuccess),
    ),
  );

  groupUpdated$ = createEffect(() =>
    this.videoGroupsSocketService.videoGroupUpdated$.pipe(
      toPayload(),
      map(updateGroupSuccess),
    ),
  );

  groupRemoved$ = createEffect(() =>
    this.videoGroupsSocketService.videoGroupRemoved$.pipe(
      toPayload(),
      map(removeGroupSuccess),
    ),
  );

  videoUpdated$ = createEffect(() =>
    this.videosSocketService.videoUpdated$.pipe(
      toPayload(),
      map((video) => videoUpdated({ payload: video.payload })),
    ),
  );

  //////////////////////////////////

  constructor(
    private actions$: Actions,
    private videoGroups: VideoGroupsService,
    private videoGroupsFacade: VideoGroupsStoreFacade,
    private videosApiService: VideosApiService,
    private infoMessageService: InfoMessageService,
    private videoBookmarksService: VideoBookmarksService,
    private videoGroupsSocketService: VideoGroupsSocketService,
    private videosSocketService: VideosSocketService,
    private usersService: UsersService,
  ) {}
}
