import {
  groupUsersAdapter,
  initialState,
  reducer,
  State,
  updateSuccess,
  usersAdapter,
  videoGroupsAdapter,
  videosAdapter,
} from './video-groups.reducer';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { Video } from '@app/videos/models/video.model';
import { setState } from '@app/helpers/ngrx.helpers';
import {
  addVideoBookmarkSuccess,
  removeVideoBookmarkSuccess,
  videoUpdated,
} from '@app/annotations/store/video-groups/videos.actions';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { loadVideoBookmarksIdsSuccess } from '@app/videos/store/videos/videos.actions';
import { User } from '@app/models/user';
import {
  clearGroupUsers,
  clearGroupUsersFilter,
  clearUsers,
  clearUsersFilter,
  loadFilteredGroupUsersBatchSuccess,
  loadFilteredUsersBatchSuccess,
  loadGroupUsersBatchSuccess,
  loadGroupUsersSuccess,
  loadUsersBatchWithExcludedIdsSuccess,
  loadUsersWithExcludedIdsSuccess,
  setFilterForGroupUsers,
  setUsersFilter,
} from '@app/annotations/store/video-groups/video-groups.actions';

describe('VideoGroup Reducer', () => {
  let state: State;

  beforeEach(() => {
    state = initialState;
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('update groups', () => {
    describe('Edit group information', () => {
      const group: VideoGroup = {
        id: 1,
        name: 'test',
        description: 'A test group.',
        userId: 1,
        videoIds: [],
        allowedUserIds: [],
      };
      const updatedGroup = {
        ...group,
        name: 'Updated test',
      };

      it('should not update videos list', () => {
        state = setState(
          {
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 1,
              },
              state.groupVideos,
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.videos.ids.length).toEqual(0);
        expect(state.groupVideos.ids.length).toEqual(0);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(state.videos.ids.length).toEqual(0);
        expect(state.groupVideos.ids.length).toEqual(0);
      });
    });

    describe('Add videos', () => {
      const group: VideoGroup = {
        id: 1,
        name: 'test',
        description: 'A test group.',
        userId: 1,
        videoIds: [],
        allowedUserIds: [],
      };
      const updatedGroup = {
        ...group,
        videoIds: [1],
      };
      const video: Video = {
        id: 1,
        url: 'storage/videos/000001_VID002.mp4',
        name: '000001_VID002.mp4',
        thumbnailUrl:
          'storage/video-thumbnails/000001_VID002.mp4_thumbnail.jpg',
        userId: 1,
        groupIds: [],
      };

      it('should not update videos list (groupId !== group.id)', () => {
        state = setState(
          {
            videos: videosAdapter.addOne(video, state.videos),
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 2,
              },
              state.groupVideos,
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.videos.ids.length).toEqual(1);
        expect(state.groupVideos.ids.length).toEqual(0);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.videos.ids.length).toEqual(1);
        expect(res.groupVideos.ids.length).toEqual(0);
      });

      it('should update videos list (groupId === group.id)', () => {
        state = setState(
          {
            videos: videosAdapter.addOne(video, state.videos),
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 1,
              },
              state.groupVideos,
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.videos.ids.length).toEqual(1);
        expect(state.groupVideos.ids.length).toEqual(0);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.videos.ids.length).toEqual(0);
        expect(res.groupVideos.ids.length).toEqual(1);
      });
    });

    describe('Remove videos', () => {
      const group: VideoGroup = {
        id: 1,
        name: 'test',
        description: 'A test group.',
        userId: 1,
        videoIds: [1],
        allowedUserIds: [],
      };
      const updatedGroup = {
        ...group,
        videoIds: [],
      };
      const video: Video = {
        id: 1,
        url: 'storage/videos/000001_VID002.mp4',
        name: '000001_VID002.mp4',
        thumbnailUrl:
          'storage/video-thumbnails/000001_VID002.mp4_thumbnail.jpg',
        userId: 1,
        groupIds: [],
      };

      it('should not update videos list (groupId !== group.id)', () => {
        state = setState(
          {
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 2,
              },
              videosAdapter.addOne(video, state.groupVideos),
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.videos.ids.length).toEqual(0);
        expect(state.groupVideos.ids.length).toEqual(1);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.videos.ids.length).toEqual(0);
        expect(res.groupVideos.ids.length).toEqual(1);
      });

      it('should update videos list (groupId === group.id)', () => {
        state = setState(
          {
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 1,
              },
              videosAdapter.addOne(video, state.groupVideos),
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.videos.ids.length).toEqual(0);
        expect(state.groupVideos.ids.length).toEqual(1);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.videos.ids.length).toEqual(1);
        expect(res.groupVideos.ids.length).toEqual(0);
      });
    });

    describe('Add users', () => {
      const user: User = {
        id: 1,
        name: 'user',
        email: 'user@user.com',
      };
      const group: VideoGroup = {
        id: 1,
        name: 'test',
        userId: 1,
        videoIds: [],
        allowedUserIds: [],
      };
      const updatedGroup = {
        ...group,
        name: 'updated test',
        allowedUserIds: [1],
      };

      it('should add the user to the group', () => {
        state = setState(
          {
            users: usersAdapter.addOne(user, state.users),
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 1,
              },
              state.groupVideos,
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.users.ids.length).toEqual(1);
        expect(state.groupUsers.ids.length).toEqual(0);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.users.ids.length).toEqual(0);
        expect(res.groupUsers.ids.length).toEqual(1);
      });

      it('should not add the user if the group changes (groupId !== group.id)', () => {
        state = setState(
          {
            users: usersAdapter.addOne(user, state.users),
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 2,
              },
              state.groupVideos,
            ),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.users.ids.length).toEqual(1);
        expect(state.groupUsers.ids.length).toEqual(0);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.users.ids.length).toEqual(1);
        expect(res.groupUsers.ids.length).toEqual(0);
      });
    });

    describe('Remove users', () => {
      const user: User = {
        id: 1,
        name: 'user',
        email: 'user@user.com',
      };
      const group: VideoGroup = {
        id: 1,
        name: 'test',
        userId: 1,
        videoIds: [],
        allowedUserIds: [1],
      };
      const updatedGroup = {
        ...group,
        name: 'updated test',
        videoIds: [],
        allowedUserIds: [],
      };

      it('should remove the user from the group', () => {
        state = setState(
          {
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 1,
              },
              state.groupVideos,
            ),
            groupUsers: usersAdapter.addOne(user, state.groupUsers),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.users.ids.length).toEqual(0);
        expect(state.groupUsers.ids.length).toEqual(1);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.users.ids.length).toEqual(1);
        expect(res.groupUsers.ids.length).toEqual(0);
      });

      it('should not remove the user if the group changes (groupId !== group.id)', () => {
        state = setState(
          {
            groups: videoGroupsAdapter.addOne(group, state.groups),
            groupVideos: setState(
              {
                groupId: 2,
              },
              state.groupVideos,
            ),
            groupUsers: usersAdapter.addOne(user, state.groupUsers),
          },
          state,
        );
        expect(state.groups.entities[1]).toEqual(group);
        expect(state.users.ids.length).toEqual(0);
        expect(state.groupUsers.ids.length).toEqual(1);
        const res = updateSuccess(updatedGroup, state);
        expect(res.groups.entities[1]).toEqual(updatedGroup);
        expect(res.users.ids.length).toEqual(0);
        expect(res.groupUsers.ids.length).toEqual(1);
      });
    });
  });

  describe('update group videos', () => {
    describe('bookmarks', () => {
      const mockVideoBookmarkIds = [8, 9];

      it('should populate bookmarks after load', () => {
        const action = loadVideoBookmarksIdsSuccess({
          payload: mockVideoBookmarkIds,
        });
        state = reducer(state, action);
        expect(state.groupVideos.bookmarkIds).toEqual(mockVideoBookmarkIds);
      });

      it('should add video bookmark', () => {
        const action = addVideoBookmarkSuccess({ payload: 14 });
        state = reducer(state, action);
        expect(state.groupVideos.bookmarkIds.includes(14)).toBeTruthy();
      });

      it('should remove video bookmark', () => {
        const action = removeVideoBookmarkSuccess({ payload: 14 });
        state = reducer(state, action);
        expect(state.groupVideos.bookmarkIds.includes(14)).toBeFalsy();
      });

      it('should not add video bookmark twice', () => {
        const action = addVideoBookmarkSuccess({ payload: 8 });
        state = reducer(state, action);
        expect(
          state.groupVideos.bookmarkIds.filter((id) => id === 8).length,
        ).toEqual(1);
      });
    });

    describe('video updated', () => {
      const video: Video = {
        id: 1,
        url: 'storage/videos/000001_VID002.mp4',
        name: '000001_VID002.mp4',
        thumbnailUrl:
          'storage/video-thumbnails/000001_VID002.mp4_thumbnail.jpg',
        userId: 1,
        groupIds: [],
        annotationState: null,
      };

      it('should update video annotation state', () => {
        state = setState(
          {
            groupVideos: videosAdapter.addOne(video, state.groupVideos),
          },
          state,
        );

        const action = videoUpdated({
          payload: {
            id: 1,
            annotationState: VIDEO_ANNOTATION_STATE.ANNOTATING,
          },
        });
        state = reducer(state, action);
        expect(state.groupVideos.entities[1].annotationState).toEqual(
          VIDEO_ANNOTATION_STATE.ANNOTATING,
        );
      });
    });
  });

  describe('Update group users', () => {
    const user: User = {
      id: 23,
      name: 'user',
      email: 'user@user.com',
    };
    const filter = 'filter';

    it('should load all users', () => {
      const action = loadGroupUsersSuccess({
        payload: [user],
      });
      state = reducer(state, action);
      expect(state.groupUsers.ids).toContain(user.id);
    });

    it('should add new users', () => {
      const action = loadGroupUsersBatchSuccess({
        payload: [user],
      });
      state = reducer(state, action);
      expect(state.groupUsers.ids).toContain(user.id);
    });

    it('should add new filtered users', () => {
      const action = loadFilteredGroupUsersBatchSuccess({
        payload: [user],
      });
      state = reducer(state, action);
      expect(state.groupUsers.ids).toContain(user.id);
    });

    it('should remove all users', () => {
      state = setState(
        {
          groupUsers: groupUsersAdapter.addOne(user, state.groupUsers),
        },
        state,
      );
      const action = clearGroupUsers();
      expect(state.groupUsers.ids).toContain(user.id);
      state = reducer(state, action);
      expect(state.groupUsers.ids).not.toContain(user.id);
    });

    it('should set filter for users', () => {
      const action = setFilterForGroupUsers({ payload: filter });
      state = reducer(state, action);
      expect(state.groupUsers.filter).toEqual(filter);
    });

    it('should remove filter for users', () => {
      state = setState(
        {
          groupUsers: setState({ filter }, state.groupUsers),
        },
        state,
      );
      const action = clearGroupUsersFilter();
      expect(state.groupUsers.filter).toEqual(filter);
      state = reducer(state, action);
      expect(state.groupUsers.filter).toEqual(null);
    });
  });

  describe('Update users', () => {
    const user: User = {
      id: 23,
      name: 'user',
      email: 'user@user.com',
    };
    const filter = 'filter';

    it('should load all users', () => {
      const action = loadUsersWithExcludedIdsSuccess({
        payload: [user],
      });
      state = reducer(state, action);
      expect(state.users.ids).toContain(user.id);
    });

    it('should add new users', () => {
      const action = loadUsersBatchWithExcludedIdsSuccess({
        payload: [user],
      });
      state = reducer(state, action);
      expect(state.users.ids).toContain(user.id);
    });

    it('should add new filtered users', () => {
      const action = loadFilteredUsersBatchSuccess({
        payload: [user],
      });
      state = reducer(state, action);
      expect(state.users.ids).toContain(user.id);
    });

    it('should remove all users', () => {
      state = setState(
        {
          users: usersAdapter.addOne(user, state.groupUsers),
        },
        state,
      );
      const action = clearUsers();
      expect(state.users.ids).toContain(user.id);
      state = reducer(state, action);
      expect(state.users.ids).not.toContain(user.id);
    });

    it('should set filter for users', () => {
      const action = setUsersFilter({ payload: filter });
      state = reducer(state, action);
      expect(state.users.filter).toEqual(filter);
    });

    it('should remove filter for users', () => {
      state = setState(
        {
          users: setState({ filter }, state.users),
        },
        state,
      );
      const action = clearUsersFilter();
      expect(state.users.filter).toEqual(filter);
      state = reducer(state, action);
      expect(state.users.filter).toEqual(null);
    });
  });
});
