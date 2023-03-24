import { escapeRegExp } from '@app/annotations/helpers/base.helpers';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import {
  clearGroupUsers,
  clearGroupUsersFilter,
  clearGroupVideos,
  clearUsers,
  clearUsersFilter,
  clearVideoFilterOfCurrentVideoGroup,
  clearVideoGroupsFilter,
  clearVideosFilter,
  clearVideosOfCurrentVideoGroup,
  createGroupSuccess,
  loadAllGroupsSuccess,
  loadFilteredGroupUsersBatchSuccess,
  loadFilteredGroupVideosSuccess,
  loadFilteredUsersBatchSuccess,
  loadGroupBatchSuccess,
  loadGroupError,
  loadGroupSuccess,
  loadGroupUsersBatchSuccess,
  loadGroupUsersSuccess,
  loadGroupVideos,
  loadGroupVideosBatchSuccess,
  loadGroupVideosSuccess,
  loadUsersBatchWithExcludedIdsSuccess,
  loadUsersWithExcludedIdsSuccess,
  removeGroupSuccess,
  searchGroups,
  searchVideosByNameInCurrentVideoGroup,
  setFilterForGroupUsers,
  setFilterForVideosOfCurrentVideoGroup,
  setUsersFilter,
  setVideoGroup,
  stopSearchGroupVideos,
  updateGroupSuccess,
} from '@app/annotations/store/video-groups/video-groups.actions';
import {
  addVideoBookmarkSuccess,
  loadVideosBatchSuccess,
  loadVideosByExcludedIds,
  loadVideosSuccess,
  removeVideoBookmarkSuccess,
  removeVideoSuccess,
  searchVideosAndExcludeIds,
  searchVideosSuccess,
  setLabelGroupSuccess,
  videoUpdated,
} from '@app/annotations/store/video-groups/videos.actions';
import { setState } from '@app/helpers/ngrx.helpers';
import { Video } from '@app/videos/models/video.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { pullAll } from 'lodash';
import { loadVideoBookmarksIdsSuccess } from '@app/videos/store/videos/videos.actions';
import { VideosFilter } from '@app/annotations/models/videos-filter.model';
import { User } from '@app/models/user';

export interface GroupVideosState extends EntityState<Video> {
  filter: VideosFilter;
  isLoading: boolean;
  groupId: number;
  bookmarkIds: number[];
}

export interface GroupsState extends EntityState<VideoGroup> {
  filter: string;
}

export interface VideosState extends EntityState<Video> {
  filter: VideosFilter;
}

export interface UsersState extends EntityState<User> {
  filter: string;
}

export interface GroupUsersState extends EntityState<User> {
  filter: string;
}

export interface State {
  groups: GroupsState;
  groupVideos: GroupVideosState;
  videos: VideosState;
  groupUsers: GroupUsersState;
  users: UsersState;
}

export const videoGroupsAdapter: EntityAdapter<VideoGroup> = createEntityAdapter<
  VideoGroup
>({
  selectId: (group: VideoGroup) => group.id,
  sortComparer: false,
});

export const videosAdapter: EntityAdapter<Video> = createEntityAdapter<Video>({
  selectId: (video) => video.id,
  sortComparer: false,
});

export const groupUsersAdapter: EntityAdapter<User> = createEntityAdapter<User>(
  {
    selectId: (user) => user.id,
    sortComparer: false,
  },
);

export const usersAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: false,
});

export const initialState: State = {
  groups: videoGroupsAdapter.getInitialState({
    filter: null,
  }),
  videos: videosAdapter.getInitialState({
    filter: null,
  }),
  groupVideos: videosAdapter.getInitialState({
    isLoading: false,
    filter: null,
    groupId: null,
    bookmarkIds: [],
  }),
  groupUsers: groupUsersAdapter.getInitialState({
    filter: null,
  }),
  users: usersAdapter.getInitialState({
    filter: null,
  }),
};

export const updateSuccess = (group: VideoGroup, state: State): any => {
  if (state.groupVideos.groupId === group.id) {
    let videos = state.videos;
    let groupVideos = state.groupVideos;
    let users = state.users;
    let groupUsers = state.groupUsers;

    const oldVideoIds = state.groups.entities[group.id].videoIds.slice();
    const newVideoIds = group.videoIds.slice();
    const oldUserIds = state.groups.entities[group.id].allowedUserIds.slice();
    const newUserIds = group.allowedUserIds.slice();

    const removedVideoIds = pullAll(oldVideoIds, newVideoIds);
    const addedVideoIds = pullAll(newVideoIds, oldVideoIds);
    const removedUserIds = pullAll(oldUserIds, newUserIds);
    const addedUserIds = pullAll(newUserIds, oldUserIds);

    // remove videos from group and add to regular videos
    if (removedVideoIds.length) {
      const removedVideos = Object.values(
        state.groupVideos.entities,
      ).filter((video) => removedVideoIds.includes(video.id));
      videos = videosAdapter.addMany(removedVideos, videos);
      groupVideos = videosAdapter.removeMany(removedVideoIds, groupVideos);
    }

    // add videos to group and remove from regular videos
    if (addedVideoIds.length) {
      const addedVideos = Object.values(state.videos.entities).filter((video) =>
        addedVideoIds.includes(video.id),
      );
      videos = videosAdapter.removeMany(addedVideoIds, videos);
      groupVideos = videosAdapter.addMany(addedVideos, groupVideos);
    }

    // remove users from group and add to regular users
    if (removedUserIds.length) {
      const removedUsers = Object.values(
        state.groupUsers.entities,
      ).filter((user) => removedUserIds.includes(user.id));
      users = usersAdapter.addMany(removedUsers, users);
      groupUsers = groupUsersAdapter.removeMany(removedUserIds, groupUsers);
    }

    // add users to group and remove from regular users
    if (addedUserIds.length) {
      const addedUsers = Object.values(state.users.entities).filter((user) =>
        addedUserIds.includes(user.id),
      );
      users = usersAdapter.removeMany(addedUserIds, users);
      groupUsers = usersAdapter.addMany(addedUsers, groupUsers);
    }

    return setState(
      {
        groups: videoGroupsAdapter.updateOne(
          {
            id: group.id,
            changes: group,
          },
          state.groups,
        ),
        videos,
        groupVideos,
        users,
        groupUsers,
      },
      state,
    );
  }
  return setState(
    {
      groups: videoGroupsAdapter.updateOne(
        {
          id: group.id,
          changes: group,
        },
        state.groups,
      ),
    },
    state,
  );
};

export const reducer = createReducer(
  initialState,
  on(loadAllGroupsSuccess, (state, { payload: videoGroups }) =>
    setState(
      {
        groups: videoGroupsAdapter.setAll(videoGroups, state.groups),
      },
      state,
    ),
  ),

  on(loadGroupSuccess, (state, { payload: videoGroup }) =>
    setState(
      {
        groups: videoGroupsAdapter.upsertOne(videoGroup, state.groups),
      },
      state,
    ),
  ),

  on(loadGroupError, (state, { payload: error }) =>
    setState(
      {
        groupVideos: setState(
          {
            groupId: null,
          },
          state.groupVideos,
        ),
      },
      state,
    ),
  ),

  on(removeGroupSuccess, (state, { payload: id }) =>
    setState(
      {
        groups: videoGroupsAdapter.removeOne(id, state.groups),
        groupVideos: setState(
          {
            groupId:
              state.groupVideos.groupId === id
                ? null
                : state.groupVideos.groupId,
          },
          state.groupVideos,
        ),
      },
      state,
    ),
  ),

  on(loadGroupVideos, (state) =>
    setState(
      {
        groupVideos: setState({ isLoading: true }, state.groupVideos),
      },
      state,
    ),
  ),

  on(searchVideosByNameInCurrentVideoGroup, loadVideosByExcludedIds, (state) =>
    setState(
      {
        groupVideos: {
          ...state.groupVideos,
          isLoading: false,
        },
      },
      state,
    ),
  ),
  on(
    searchVideosSuccess,
    loadVideosBatchSuccess,
    loadGroupVideosBatchSuccess,
    stopSearchGroupVideos,
    (state) =>
      setState(
        {
          groupVideos: {
            ...state.groupVideos,
            isLoading: false,
          },
        },
        state,
      ),
  ),

  on(loadGroupVideosSuccess, (state, { payload: videos }) =>
    setState(
      {
        groupVideos: setState(
          { isLoading: false },
          videosAdapter.setAll(videos, state.groupVideos),
        ),
      },
      state,
    ),
  ),

  on(loadVideosSuccess, (state, { payload: videos }) =>
    setState(
      {
        videos: setState(
          { filter: state.videos.filter },
          videosAdapter.setAll(videos, state.videos),
        ),
      },
      state,
    ),
  ),

  on(loadVideosBatchSuccess, (state, { payload: videos }) =>
    setState(
      {
        videos: videosAdapter.upsertMany(videos, state.videos),
      },
      state,
    ),
  ),

  on(createGroupSuccess, (state, { payload: group }) =>
    setState(
      {
        groups: videoGroupsAdapter.addOne(group, state.groups),
      },
      state,
    ),
  ),
  on(updateGroupSuccess, (state, { payload: group }): any =>
    updateSuccess(group, state),
  ),

  on(loadGroupBatchSuccess, (state, { payload: groups }) =>
    setState(
      {
        groups: videoGroupsAdapter.upsertMany(groups, state.groups),
      },
      state,
    ),
  ),
  on(searchGroups, (state, { payload: q }) =>
    setState(
      {
        groups: setState({ filter: q }, state.groups),
      },
      state,
    ),
  ),

  on(searchVideosAndExcludeIds, (state, { payload: { name } }) =>
    setState(
      {
        videos: setState({ filter: name }, state.videos),
      },
      state,
    ),
  ),

  on(searchVideosSuccess, (state, { payload: videos }) =>
    setState(
      {
        videos: videosAdapter.setAll(videos, state.videos),
      },
      state,
    ),
  ),

  on(loadGroupVideosBatchSuccess, (state, { payload: videos }) =>
    setState(
      {
        groupVideos: videosAdapter.addMany(videos, state.groupVideos),
      },
      state,
    ),
  ),
  on(loadFilteredGroupVideosSuccess, (state, { payload: videos }) =>
    setState(
      {
        groupVideos: setState(
          { isLoading: false },
          videosAdapter.upsertMany(videos, state.groupVideos),
        ),
      },
      state,
    ),
  ),

  on(setVideoGroup, (state, { payload: groupId }) =>
    setState(
      {
        groupVideos: setState({ groupId }, state.groupVideos),
      },
      state,
    ),
  ),

  on(setLabelGroupSuccess, (state, { payload: videoGroup }) =>
    setState(
      {
        groups: videoGroupsAdapter.updateOne(
          { id: videoGroup.id, changes: videoGroup },
          state.groups,
        ),
      },
      state,
    ),
  ),

  on(clearGroupVideos, (state) =>
    setState(
      {
        groupVideos: videosAdapter.getInitialState({
          isLoading: false,
          filter: null,
          groupId: null,
          bookmarkIds: [],
        }),
      },
      state,
    ),
  ),
  on(clearVideosOfCurrentVideoGroup, (state) =>
    setState(
      {
        groupVideos: videosAdapter.removeAll(state.groupVideos),
      },
      state,
    ),
  ),
  on(clearVideoFilterOfCurrentVideoGroup, (state) =>
    setState(
      {
        groupVideos: {
          ...state.groupVideos,
          filter: null,
        },
      },
      state,
    ),
  ),
  on(videoUpdated, (state, { payload: video }) =>
    setState(
      {
        groupVideos: videosAdapter.updateOne(
          {
            id: video.id,
            changes: video,
          },
          state.groupVideos,
        ),
      },
      state,
    ),
  ),
  on(loadVideoBookmarksIdsSuccess, (state, { payload: bookmarkIds }) =>
    setState(
      {
        groupVideos: setState(
          {
            bookmarkIds,
          },
          state.groupVideos,
        ),
      },
      state,
    ),
  ),
  on(addVideoBookmarkSuccess, (state, { payload: id }) =>
    setState(
      {
        groupVideos: setState(
          {
            bookmarkIds: Array.from(
              new Set([...state.groupVideos.bookmarkIds, id]),
            ),
          },
          state.groupVideos,
        ),
      },
      state,
    ),
  ),
  on(removeVideoBookmarkSuccess, (state, { payload: id }) =>
    setState(
      {
        groupVideos: setState(
          {
            bookmarkIds: state.groupVideos.bookmarkIds.filter(
              (bId) => bId !== id,
            ),
          },
          state.groupVideos,
        ),
      },
      state,
    ),
  ),
  on(removeVideoSuccess, (state, { payload: id }) =>
    setState(
      {
        groupVideos: videosAdapter.removeOne(id, state.groupVideos),
      },
      state,
    ),
  ),
  on(clearVideosFilter, (state) =>
    setState(
      {
        videos: {
          ...state.videos,
          filter: null,
        },
      },
      state,
    ),
  ),
  on(setFilterForVideosOfCurrentVideoGroup, (state, { payload: filter }) =>
    setState(
      {
        groupVideos: {
          ...state.groupVideos,
          filter,
        },
      },
      state,
    ),
  ),
  on(clearVideoGroupsFilter, (state) =>
    setState(
      {
        groups: {
          ...state.groups,
          filter: null,
        },
      },
      state,
    ),
  ),

  //// GROUP USERS ////////////////////////////

  on(loadGroupUsersSuccess, (state: State, { payload: users }) =>
    setState(
      {
        groupUsers: groupUsersAdapter.setAll(users, state.groupUsers),
      },
      state,
    ),
  ),
  on(
    loadGroupUsersBatchSuccess,
    loadFilteredGroupUsersBatchSuccess,
    (state: State, { payload: users }) =>
      setState(
        {
          groupUsers: groupUsersAdapter.upsertMany(users, state.groupUsers),
        },
        state,
      ),
  ),
  on(clearGroupUsers, (state: State) =>
    setState(
      {
        groupUsers: groupUsersAdapter.removeAll(state.groupUsers),
      },
      state,
    ),
  ),
  on(setFilterForGroupUsers, (state, { payload: filter }) =>
    setState(
      {
        groupUsers: setState({ filter }, state.groupUsers),
      },
      state,
    ),
  ),
  on(clearGroupUsersFilter, (state) =>
    setState(
      {
        groupUsers: setState({ filter: null }, state.groupUsers),
      },
      state,
    ),
  ),
  //// USERS ////////////////////////////
  on(loadUsersWithExcludedIdsSuccess, (state, { payload: users }) =>
    setState(
      {
        users: usersAdapter.setAll(users, state.users),
      },
      state,
    ),
  ),
  on(
    loadUsersBatchWithExcludedIdsSuccess,
    loadFilteredUsersBatchSuccess,
    (state, { payload: users }) =>
      setState(
        {
          users: usersAdapter.upsertMany(users, state.users),
        },
        state,
      ),
  ),
  on(clearUsers, (state) =>
    setState(
      {
        users: usersAdapter.removeAll(state.users),
      },
      state,
    ),
  ),
  on(setUsersFilter, (state, { payload: filter }) =>
    setState(
      {
        users: setState({ filter }, state.users),
      },
      state,
    ),
  ),
  on(clearUsersFilter, (state) =>
    setState({ users: setState({ filter: null }, state.users) }, state),
  ),
);

export const getGroupsSlice = (state: State): GroupsState => state.groups;
export const getVideosSlice = (state: State): VideosState => state.videos;
export const getGroupVideosSlice = (state: State): GroupVideosState =>
  state.groupVideos;
export const getGroupUsersSlice = (state: State): GroupUsersState =>
  state.groupUsers;
export const getUsersSlice = (state: State): UsersState => state.users;

export const getGroupVideosIsLoading = (state: State['groupVideos']): boolean =>
  state.isLoading;

export const videosIsFiltering = (state: VideosState): boolean =>
  !!(state.filter && state.filter.param.length);

export const groupVideosIsFiltering = (state: GroupVideosState): boolean =>
  !!(state.filter && state.filter.param.length);

///////////////////////////////////

const byNameAndDescription = (q: string) => (group: VideoGroup) => {
  const nameMatch = group.name
    .toLowerCase()
    .match(`${escapeRegExp(q).toLowerCase()}.*`);
  const descrMatch =
    group.description && group.description.length
      ? group.description
          .toLowerCase()
          .match(`${escapeRegExp(q).toLowerCase()}.*`)
      : null;
  return nameMatch || descrMatch;
};

export const getFilteredGroups = (q: string) => (groups: VideoGroup[]) =>
  q && q.length > 0 ? groups.filter(byNameAndDescription(q)) : groups;

/////////////////////////////////////////////////////////////

export const getGroupById = (groupId: number) => (state: GroupsState) =>
  state.entities[groupId];

export const getBookmarkedIds = (state: GroupVideosState): number[] =>
  state.bookmarkIds;
