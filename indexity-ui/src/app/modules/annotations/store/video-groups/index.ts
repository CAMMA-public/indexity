import * as fromVideoGroups from './video-groups.reducer';
import {
  Action,
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { User } from '@app/models/user';

export const reducers = (
  state: fromVideoGroups.State | undefined,
  action: Action,
): any => fromVideoGroups.reducer(state, action);

export const getVideoGroupsFeatureState = createFeatureSelector<
  fromVideoGroups.State
>('videoGroups');

export const getGroupsSlice = createSelector(
  getVideoGroupsFeatureState,
  fromVideoGroups.getGroupsSlice,
);

export const getVideosSlice = createSelector(
  getVideoGroupsFeatureState,
  fromVideoGroups.getVideosSlice,
);

export const getGroupVideosSlice = createSelector(
  getVideoGroupsFeatureState,
  fromVideoGroups.getGroupVideosSlice,
);

export const getGroupUsersSlice = createSelector(
  getVideoGroupsFeatureState,
  fromVideoGroups.getGroupUsersSlice,
);

export const getUsersSlice = createSelector(
  getVideoGroupsFeatureState,
  fromVideoGroups.getUsersSlice,
);

//// selectors /////////////////////////////////////

export const {
  selectAll: getAllVideoGroups,
  selectEntities: getVideoGroupsEntities,
  selectTotal: getTotalVideoGroups,
} = fromVideoGroups.videoGroupsAdapter.getSelectors(getGroupsSlice);

export const {
  selectAll: getAllVideos,
  selectTotal: getTotalVideos,
} = fromVideoGroups.videosAdapter.getSelectors(getVideosSlice);

export const {
  selectAll: getAllGroupVideos,
  selectTotal: getTotalGroupVideos,
} = fromVideoGroups.videosAdapter.getSelectors(getGroupVideosSlice);

export const {
  selectAll: getAllGroupUsers,
  selectTotal: getTotalGroupUsers,
} = fromVideoGroups.groupUsersAdapter.getSelectors(getGroupUsersSlice);

export const {
  selectAll: getAllUsers,
  selectTotal: getTotalUsers,
} = fromVideoGroups.usersAdapter.getSelectors(getUsersSlice);

//// custom selectors /////////////////////////////////////

export const groupVideosIsFiltering = createSelector(
  getGroupVideosSlice,
  fromVideoGroups.groupVideosIsFiltering,
);

export const getGroupsFilter = createSelector(
  getGroupsSlice,
  (slice) => slice.filter,
);

export const getVideosFilter = createSelector(
  getVideosSlice,
  (slice) => slice.filter,
);

export const getGroupVideosFilter = createSelector(
  getGroupVideosSlice,
  (slice) => slice.filter,
);

export const getGroupUsersFilter = createSelector(
  getGroupUsersSlice,
  (slice) => slice.filter,
);

export const getUsersWithExcludedId = (
  excludedIds: number[],
): MemoizedSelector<object, User[]> =>
  createSelector(getAllUsers, (users) =>
    users.filter((u) => !excludedIds.includes(u.id)),
  );

export const getUsersFilter = createSelector(
  getUsersSlice,
  (slice) => slice.filter,
);

export const getFilteredGroups = createSelector(
  getGroupsFilter,
  getAllVideoGroups,
  (q, groups) => fromVideoGroups.getFilteredGroups(q)(groups),
);

export const getVideoGroup = createSelector(
  getGroupVideosSlice,
  getVideoGroupsEntities,
  (state, groups) => (state.groupId ? groups[state.groupId] : null),
);

export const getGroupVideosIsLoading = createSelector(
  getGroupVideosSlice,
  fromVideoGroups.getGroupVideosIsLoading,
);

export const getGroupById = (
  groupId: number,
): MemoizedSelector<object, VideoGroup> =>
  createSelector(getGroupsSlice, fromVideoGroups.getGroupById(groupId));

export const getBookmarkedIds = createSelector(
  getGroupVideosSlice,
  fromVideoGroups.getBookmarkedIds,
);
