import { Injectable } from '@angular/core';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import * as fromVideoGroups from '@app/annotations/store/video-groups/index';
import {
  addUserToGroup,
  addVideosToGroup,
  clearGroupUsers,
  clearGroupUsersFilter,
  clearGroupVideos,
  clearUsers,
  clearUsersFilter,
  clearVideoFilterOfCurrentVideoGroup,
  clearVideoGroupsFilter,
  clearVideosOfCurrentVideoGroup,
  createGroup,
  loadAllGroups,
  loadFilteredGroupUsersBatch,
  loadGroup,
  loadGroupUsers,
  loadGroupUsersBatch,
  loadGroupVideos,
  loadGroupVideosBatch,
  loadNextGroupBatch,
  loadUsersBatchWithExcludedIds,
  loadUsersBatchWithNameAndExcludedIds,
  loadUsersWithExcludedIds,
  removeGroup,
  removeUserFromGroup,
  removeVideosFromGroup,
  searchGroups,
  searchVideosByNameInCurrentVideoGroup,
  setFilterForGroupUsers,
  setFilterForVideosOfCurrentVideoGroup,
  setUsersFilter,
  setVideoGroup,
  updateGroup,
} from '@app/annotations/store/video-groups/video-groups.actions';
import { State } from '@app/annotations/store/video-groups/video-groups.reducer';
import {
  addVideoBookmark,
  loadNextVideoBatchByExcludedIds,
  loadVideoBookmarks,
  loadVideosByExcludedIds,
  loadVideosSuccess,
  removeVideoBookmark,
  searchVideosAndExcludeIds,
  setVideoAnnotationState,
} from '@app/annotations/store/video-groups/videos.actions';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VideosFilter } from '@app/annotations/models/videos-filter.model';

@Injectable()
export class VideoGroupsStoreFacade {
  totalVideos$ = this.store.pipe(select(fromVideoGroups.getTotalVideos));
  totalVideoGroups$ = this.store.pipe(
    select(fromVideoGroups.getTotalVideoGroups),
  );
  totalGroupVideos$ = this.store.pipe(
    select(fromVideoGroups.getTotalGroupVideos),
  );
  videoGroup$ = this.store.pipe(select(fromVideoGroups.getVideoGroup));
  groupVideosIsLoading$ = this.store.pipe(
    select(fromVideoGroups.getGroupVideosIsLoading),
  );
  bookmarkedIds$ = this.store.pipe(select(fromVideoGroups.getBookmarkedIds));

  groupUsers$ = this.store.pipe(select(fromVideoGroups.getAllGroupUsers));
  totalGroupUsers$ = this.store.pipe(
    select(fromVideoGroups.getTotalGroupUsers),
  );

  users$ = this.store.pipe(select(fromVideoGroups.getAllUsers));
  totalUsers$ = this.store.pipe(select(fromVideoGroups.getTotalUsers));

  //// SEARCH / FILTER ////////////////////////////////////
  groupVideosIsFiltering$ = this.store.pipe(
    select(fromVideoGroups.groupVideosIsFiltering),
  );
  groupsFilter$ = this.store.pipe(select(fromVideoGroups.getGroupsFilter));
  videosFilter$ = this.store.pipe(select(fromVideoGroups.getVideosFilter));
  groupVideosFilter$ = this.store.pipe(
    select(fromVideoGroups.getGroupVideosFilter),
  );

  groupUsersFilter$ = this.store.pipe(
    select(fromVideoGroups.getGroupUsersFilter),
  );
  usersFilter$ = this.store.pipe(select(fromVideoGroups.getUsersFilter));

  filteredGroups$ = this.store.pipe(select(fromVideoGroups.getFilteredGroups));
  filteredVideos$ = this.store.pipe(select(fromVideoGroups.getAllVideos));
  filteredGroupVideos$ = this.store.pipe(
    select(fromVideoGroups.getAllGroupVideos),
  );

  /////////////////////////////////////////////

  constructor(private store: Store<State>) {}

  loadAllGroups(): void {
    this.store.dispatch(loadAllGroups({ payload: { offset: 0, limit: 15 } }));
  }

  loadGroup(id: number): void {
    this.store.dispatch(loadGroup({ payload: id }));
  }

  removeGroup(id: number): void {
    this.store.dispatch(removeGroup({ payload: id }));
  }

  loadGroupVideos(groupId: number): void {
    this.store.dispatch(loadGroupVideos({ payload: groupId }));
  }

  setVideoGroup(groupId: number): void {
    this.store.dispatch(setVideoGroup({ payload: groupId }));
  }

  createGroup(group: VideoGroup): void {
    this.store.dispatch(createGroup({ payload: group }));
  }

  updateGroup(group: Partial<VideoGroup>): void {
    this.store.dispatch(updateGroup({ payload: group }));
  }

  searchVideosAndExcludeIds(name: string, ids: number[]): void {
    this.store.dispatch(searchVideosAndExcludeIds({ payload: { name, ids } }));
  }

  loadVideosByExcludeIds(ids: number[]): void {
    this.store.dispatch(loadVideosByExcludedIds({ payload: ids }));
  }

  searchVideosByNameInCurrentVideoGroup(groupId: number, name?: string): void {
    this.store.dispatch(
      searchVideosByNameInCurrentVideoGroup({ payload: { groupId, name } }),
    );
  }

  searchGroups(q?: string): void {
    this.store.dispatch(searchGroups({ payload: q }));
  }

  clearGroupVideos(): void {
    this.store.dispatch(clearGroupVideos());
  }

  clearVideos(): void {
    this.store.dispatch(loadVideosSuccess({ payload: [] }));
  }

  clearVideosOfCurrentVideoGroup(): void {
    this.store.dispatch(clearVideosOfCurrentVideoGroup());
  }

  getGroupById(groupId: number): Observable<VideoGroup> {
    return this.store.pipe(select(fromVideoGroups.getGroupById(groupId)));
  }

  addVideosToGroup(groupId: number, videoIds: number[]): void {
    this.store.dispatch(addVideosToGroup({ payload: { groupId, videoIds } }));
  }

  removeVideosFromGroup(groupId: number, videoIds: number[]): void {
    this.store.dispatch(
      removeVideosFromGroup({ payload: { groupId, videoIds } }),
    );
  }

  loadNextVideoBatchByExcludedIds(ids: number[]): void {
    this.store.dispatch(loadNextVideoBatchByExcludedIds({ payload: { ids } }));
  }

  loadNextGroupVideosBatch(groupId: number): void {
    this.store.dispatch(loadGroupVideosBatch({ payload: { groupId } }));
  }

  loadNextGroupBatch(): void {
    this.store.dispatch(loadNextGroupBatch());
  }

  loadBookmarkedVideos(): void {
    this.store.dispatch(loadVideoBookmarks());
  }

  addVideoBookmark(videoId: number): void {
    this.store.dispatch(addVideoBookmark({ payload: videoId }));
  }

  removeVideoBookmark(videoId: number): void {
    this.store.dispatch(removeVideoBookmark({ payload: videoId }));
  }

  clearVideoGroupsFilter(): void {
    this.store.dispatch(clearVideoGroupsFilter());
  }

  clearVideoFilterFromCurrentVideoGroup(): void {
    this.store.dispatch(clearVideoFilterOfCurrentVideoGroup());
  }

  setVideoAnnotationState(
    videoId: number,
    state: VIDEO_ANNOTATION_STATE,
  ): void {
    this.store.dispatch(
      setVideoAnnotationState({ payload: { videoId, state } }),
    );
  }

  setFilterForVideosOfCurrentVideoGroup(filter: VideosFilter): void {
    this.store.dispatch(
      setFilterForVideosOfCurrentVideoGroup({ payload: filter }),
    );
  }

  /// GROUP USERS /////////////////////

  loadGroupUsers(groupId: number, limit?: number): void {
    this.store.dispatch(loadGroupUsers({ payload: { groupId, limit } }));
  }

  loadNextGroupUsersBatch(groupId: number): void {
    this.store.dispatch(loadGroupUsersBatch({ payload: { groupId } }));
  }

  loadNextFilteredGroupUsersBatch(groupId: number, name?: string): void {
    this.store.dispatch(
      loadFilteredGroupUsersBatch({ payload: { groupId, name } }),
    );
  }

  clearGroupUsers(): void {
    this.store.dispatch(clearGroupUsers());
  }

  addUserToGroup(groupId: number, userId: number): void {
    this.store.dispatch(addUserToGroup({ payload: { groupId, userId } }));
  }

  removeUserFromGroup(groupId: number, userId: number): void {
    this.store.dispatch(removeUserFromGroup({ payload: { groupId, userId } }));
  }

  setFilterForGroupUsers(filter: string): void {
    this.store.dispatch(setFilterForGroupUsers({ payload: filter }));
  }

  clearGroupUsersFilter(): void {
    this.store.dispatch(clearGroupUsersFilter());
  }

  /// USERS ///////////////////////////

  loadUsersWithout(userIds: number[], limit?: number): void {
    this.store.dispatch(
      loadUsersWithExcludedIds({ payload: { excludedIds: userIds, limit } }),
    );
  }

  loadNextUsersBatchWithout(userIds: number[]): void {
    this.store.dispatch(
      loadUsersBatchWithExcludedIds({ payload: { excludedIds: userIds } }),
    );
  }

  loadNextFilteredUsersBatchWithout(name: string, excludedIds: number[]): void {
    this.store.dispatch(
      loadUsersBatchWithNameAndExcludedIds({ payload: { name, excludedIds } }),
    );
  }

  clearUsers(): void {
    this.store.dispatch(clearUsers());
  }

  setUsersFilter(filter: string): void {
    this.store.dispatch(setUsersFilter({ payload: filter }));
  }

  clearUsersFilter(): void {
    this.store.dispatch(clearUsersFilter());
  }
}
