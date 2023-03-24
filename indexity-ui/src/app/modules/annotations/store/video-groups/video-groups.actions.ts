import { VideoGroup } from '@app/annotations/models/video-group.model';
import { Video } from '@app/videos/models/video.model';
import { createAction, props } from '@ngrx/store';
import { VideosFilter } from '@app/annotations/models/videos-filter.model';
import { User } from '@app/models/user';

export const loadAllGroups = createAction(
  '[VideoGroups] Load All',
  props<{ payload: { offset: number; limit?: number } }>(),
);

export const loadAllGroupsSuccess = createAction(
  '[VideoGroups] Load all success',
  props<{ payload: VideoGroup[] }>(),
);

export const createGroup = createAction(
  '[VideoGroups] Create',
  props<{ payload: VideoGroup }>(),
);

export const createGroupSuccess = createAction(
  '[VideoGroups] Create success',
  props<{ payload: VideoGroup }>(),
);

export const createGroupFailure = createAction(
  '[VideoGroups] Add one failure',
  props<{ payload: any }>(),
);

export const updateGroup = createAction(
  '[VideoGroups] Update group',
  props<{ payload: Partial<VideoGroup> }>(),
);

export const updateGroupSuccess = createAction(
  '[VideoGroups] Update group success',
  props<{ payload: VideoGroup }>(),
);

export const loadGroup = createAction(
  '[VideoGroups] Load group',
  props<{ payload: number }>(),
);

export const loadGroupSuccess = createAction(
  '[VideoGroups] Load group success',
  props<{ payload: VideoGroup }>(),
);

export const loadGroupError = createAction(
  '[VideoGroups] Load group error',
  props<{ payload: any }>(),
);

export const searchGroups = createAction(
  '[VideoGroups] Search',
  props<{ payload: string }>(),
);

export const removeGroup = createAction(
  '[VideoGroups] Remove group',
  props<{ payload: number }>(),
);

export const removeGroupSuccess = createAction(
  '[VideoGroups] Remove group success',
  props<{ payload: number }>(),
);

export const loadNextGroupBatch = createAction(
  '[Group Videos] Load group batch',
  ({ limit }: { limit: number } = { limit: 15 }) => ({ limit }),
);

export const loadGroupBatchSuccess = createAction(
  '[VideoGroups] Load batch success',
  props<{ payload: VideoGroup[] }>(),
);

export const addVideosToGroup = createAction(
  '[VideoGroups] Add videos',
  props<{ payload: { groupId: number; videoIds: number[] } }>(),
);

export const removeVideosFromGroup = createAction(
  '[VideoGroups] Remove videos',
  props<{ payload: { groupId: number; videoIds: number[] } }>(),
);

export const setVideoGroup = createAction(
  '[VideoGroups] Set video group',
  props<{ payload: number }>(),
);

//// GROUP VIDEOS ////////////////////////////////////////////////////////

export const loadGroupVideos = createAction(
  '[VideoGroups - Group videos] Load Group Videos',
  props<{ payload: number }>(),
);

export const loadGroupVideosSuccess = createAction(
  '[VideoGroups - Group videos] Load Group Videos Success',
  props<{ payload: Video[] }>(),
);

export const loadGroupVideosBatch = createAction(
  '[Group Videos] Load group videos batch',
  props<{ payload: { groupId: number; limit?: number } }>(),
);

export const loadGroupVideosBatchSuccess = createAction(
  '[Group Videos] Load group videos batch success',
  props<{ payload: Video[] }>(),
);

export const loadFilteredGroupVideosSuccess = createAction(
  '[VideoGroups filter] Load filtered group videos success',
  props<{ payload: Video[] }>(),
);

export const searchVideosByNameInCurrentVideoGroup = createAction(
  '[VideosGroups - Group videos] Search videos by name in current video group',
  props<{ payload: { groupId: number; name?: string } }>(),
);

export const stopSearchGroupVideos = createAction(
  '[VideosGroups - Group videos] Stop search group videos',
  props<{}>(),
);

export const clearGroupVideos = createAction(
  '[VideoGroup - Group videos] Clear group videos',
);

export const clearVideosFilter = createAction(
  '[VideoGroup - Videos] Clear videos filter',
);

export const clearVideosOfCurrentVideoGroup = createAction(
  '[VideoGroup - Videos] Clear videos from current video group',
);

export const clearVideoFilterOfCurrentVideoGroup = createAction(
  '[VideoGroup - Videos] Clear video filter of current video group',
);

export const setFilterForVideosOfCurrentVideoGroup = createAction(
  '[VideoGroups filter] Set filter for videos of current video group',
  props<{ payload: VideosFilter }>(),
);

export const clearVideoGroupsFilter = createAction(
  '[VideoGroup - Videos] Clear video groups filter',
);

//// USERS ///////////////////////////////////////////////////////////////////

export const loadUsersWithExcludedIds = createAction(
  '[Users] Load users with excluded IDs',
  props<{ payload: { excludedIds: number[]; limit?: number } }>(),
);

export const loadUsersWithExcludedIdsSuccess = createAction(
  '[Users] Load users with excluded IDs success',
  props<{ payload: User[] }>(),
);

export const loadUsersBatchWithExcludedIds = createAction(
  '[Users] Load users batch with excluded IDs',
  props<{ payload: { excludedIds: number[]; limit?: number } }>(),
);

export const loadUsersBatchWithExcludedIdsSuccess = createAction(
  '[Users] Load users batch with excluded IDs success',
  props<{ payload: User[] }>(),
);

export const loadUsersBatchWithNameAndExcludedIds = createAction(
  '[Users] Load users batch with name and excluded IDs ',
  props<{ payload: { name: string; excludedIds: number[] } }>(),
);

export const loadFilteredUsersBatchSuccess = createAction(
  '[Users] Load filtered users success',
  props<{ payload: User[] }>(),
);

export const clearUsers = createAction('[Users] Clear');

export const setUsersFilter = createAction(
  '[Users] Set filter',
  props<{ payload: string }>(),
);

export const clearUsersFilter = createAction('[Users] Clear filter');

//// GROUP USERS /////////////////////////////////////////////////////////////

export const loadGroupUsers = createAction(
  '[VideoGroup - Users] Load Group Users',
  props<{ payload: { groupId: number; limit?: number } }>(),
);

export const loadGroupUsersSuccess = createAction(
  '[VideoGroup - Users] Load Group Users Success',
  props<{ payload: User[] }>(),
);

export const loadGroupUsersBatch = createAction(
  '[VideoGroup - Users] Load Group Users Batch',
  props<{ payload: { groupId: number; limit?: number } }>(),
);

export const loadGroupUsersBatchSuccess = createAction(
  '[VideoGroup - Users] Load Group Users Batch Success',
  props<{ payload: User[] }>(),
);

export const loadFilteredGroupUsersBatch = createAction(
  '[VideoGroup - Users] Load Filtered Group Users Batch',
  props<{ payload: { groupId: number; name?: string; limit?: number } }>(),
);

export const loadFilteredGroupUsersBatchSuccess = createAction(
  '[VideoGroup - Users] Load Filtered Group Users Batch Success',
  props<{ payload: User[] }>(),
);

export const clearGroupUsers = createAction(
  '[VideoGroup - Users] Clear Group Users',
);

export const addUserToGroup = createAction(
  '[VideoGroup - Users] Add user',
  props<{ payload: { groupId: number; userId: number } }>(),
);

export const removeUserFromGroup = createAction(
  '[VideoGroup - Users] Remove user',
  props<{ payload: { groupId: number; userId: number } }>(),
);

export const setFilterForGroupUsers = createAction(
  '[VideoGroup - Users] Set filter',
  props<{ payload: string }>(),
);

export const clearGroupUsersFilter = createAction(
  '[VideoGroup - Users] Clear filter',
);

/////////////////////////////////////////////////////////////////

export const clear = createAction('[VideoGroups] Clear');
