import { VIDEOS_FILTER_TYPE } from '@app/annotations/models/videos-filter.model';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import {
  addVideoBookmarkSuccess,
  clear,
  clearFilter,
  loadAllFailure,
  loadAllSuccess,
  loadBatchSuccess,
  loadFilteredVideosSuccess,
  loadSuccess,
  loadVideoBookmarksIdsSuccess,
  removeSuccess,
  removeVideoBookmarkSuccess,
  setCurrentFilter,
  setCurrentVideoId,
  thumbGenerated,
  videoAdded,
  videoUpdated,
} from '@app/annotations/modules/videos/store/videos/videos.actions';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import {
  initialState,
  reducer,
  State,
} from '@app/videos/store/videos/videos.reducer';

describe('Videos State', () => {
  const videos: Video[] = [
    {
      id: 8,
      name: 'video01.mp4',
      thumbnailUrl: 'samples/video01.mp4_thumbnail.jpg',
      url: 'samples/video01.mp4',
      annotationState: VIDEO_ANNOTATION_STATE.ANNOTATION_PENDING,
    },
    {
      id: 9,
      name: 'video02.mp4',
      thumbnailUrl: 'samples/video02.mp4_thumbnail.jpg',
      url: 'samples/video02.mp4',
      annotationState: VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED,
    },
    {
      id: 14,
      name: 'video07.mp4',
      thumbnailUrl: 'samples/video07.mp4_thumbnail.jpg',
      url: 'samples/video07.mp4',
      stats: {
        annotationLabels: [{ name: 'label1', color: 'red', type: 'structure' }],
        annotationsCount: 1,
        users: [],
        groupIds: [],
        videoId: 14,
      },
    },
  ];

  const mockVideoBookmarkIds = [8, 9];

  describe('Videos entity reducer', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });

    it('should populate entities from the array', () => {
      const entities = {
        8: videos[0],
        9: videos[1],
        14: videos[2],
      };
      const action = loadAllSuccess({ payload: videos });
      const state = reducer(initialState, action);
      expect(state.entities).toEqual(entities);
    });

    it('should populate one video in the store', () => {
      const entities = {
        8: videos[0],
      };
      const action = loadSuccess({ payload: videos[0] });
      const state = reducer(initialState, action);
      expect(state.entities).toEqual(entities);
    });

    it('should load a batch of videos in the store', () => {
      const entities = {
        8: videos[0],
        9: videos[1],
      };
      const action = loadBatchSuccess({ payload: [videos[0], videos[1]] });
      const state = reducer(initialState, action);
      expect(state.entities).toEqual(entities);
    });

    it('should reset the store to the initial state', () => {
      let state = reducer(initialState, loadAllSuccess({ payload: videos }));
      const action = clear();
      state = reducer(state, action);
      expect(state).toEqual(initialState);
    });

    it('should return the initial state', () => {
      const action = loadAllFailure({ payload: 'Failed to load videos' });
      const state = reducer(initialState, action);
      expect(state.entities).toEqual(initialState.entities);
    });

    it('should set the current id', () => {
      const id = 1;
      const action = setCurrentVideoId({ payload: id });
      const state = reducer(initialState, action);
      expect(state.currentId).toEqual(id);
    });

    it('should add a video', () => {
      const video = {
        id: 151,
        name: '4aea88fe-f755-459a-8928-26aafadbd582.mp4',
        thumbnailUrl:
          'samples/4aea88fe-f755-459a-8928-26aafadbd582.mp4_thumbnail.jpg',
        url: 'samples/4aea88fe-f755-459a-8928-26aafadbd582.mp4',
      };
      const action = videoAdded({ payload: video });
      const state = reducer(initialState, action);
      const expectedEntities = {
        151: video,
      };
      expect(state.entities).toEqual(expectedEntities);
    });

    it('should update a video', () => {
      const action = loadAllSuccess({ payload: videos });
      const state = reducer(initialState, action);
      const video = {
        ...videos[0],
        name: '4aea88fe-f755-459a-8928-26aafadbd582.mp4',
      };
      const updateAction = videoUpdated({ payload: video });
      const newState = reducer(state, updateAction);
      const expectedEntities = {
        8: video,
        9: videos[1],
        14: videos[2],
      };
      expect(newState.entities).toEqual(expectedEntities);
    });

    it('should remove a video', () => {
      const action = loadAllSuccess({ payload: videos });
      const state = reducer(initialState, action);
      const removeAction = removeSuccess({ payload: 8 });
      const newState = reducer(state, removeAction);
      const expectedEntities = {
        9: videos[1],
        14: videos[2],
      };
      expect(newState.entities).toEqual(expectedEntities);
    });

    it('should update video thumbnailUrl', () => {
      const video = {
        id: 151,
        name: '4aea88fe-f755-459a-8928-26aafadbd582.mp4',
        thumbnailUrl: null,
        url: 'samples/4aea88fe-f755-459a-8928-26aafadbd582.mp4',
      };
      const action = videoAdded({ payload: video });
      const state = reducer(initialState, action);
      expect(state.entities[151].thumbnailUrl).toBeNull();

      const videoWithThumbnail = {
        ...video,
        thumbnailUrl:
          'samples/4aea88fe-f755-459a-8928-26aafadbd582.mp4_thumbnail.jpg',
      };
      const action2 = thumbGenerated({ payload: videoWithThumbnail });
      const state2 = reducer(state, action2);
      expect(state2.entities[151].thumbnailUrl).toBe(
        videoWithThumbnail.thumbnailUrl,
      );
    });
  });

  describe('Video filters', () => {
    let state: State;

    beforeEach(() => {
      const action = loadAllSuccess({ payload: videos });
      state = reducer(initialState, action);
    });

    it('should load filtered videos', () => {
      const action = loadFilteredVideosSuccess({
        payload: [videos[0]],
      });
      const newState = reducer(state, action);
      expect(newState.entities[8]).toEqual(videos[0]);
    });

    it('should set the current filter', () => {
      const mockFilter = {
        type: VIDEOS_FILTER_TYPE.BY_NAME,
        param: 'video01',
      };
      const action = setCurrentFilter({
        payload: mockFilter,
      });
      const newState = reducer(state, action);
      expect(newState.filter).toEqual(mockFilter);
    });

    it('should clear the filter', () => {
      const action = clearFilter();
      const newState = reducer(state, action);
      expect(newState.filter).toBeNull();
      expect(newState.isFiltering).toBeFalse();
    });
  });

  describe('Video Bookmarks reducer', () => {
    let state: State;

    beforeEach(() => {
      const action = loadAllSuccess({ payload: videos });
      state = reducer(initialState, action);
    });

    it('should populate bookmarks after load', () => {
      const action = loadVideoBookmarksIdsSuccess({
        payload: mockVideoBookmarkIds,
      });
      state = reducer(state, action);
      expect(state.bookmarkIds).toEqual(mockVideoBookmarkIds);
    });

    it('should add video bookmark', () => {
      const action = addVideoBookmarkSuccess({ payload: 14 });
      state = reducer(state, action);
      expect(state.bookmarkIds.includes(14)).toBeTruthy();
    });

    it('should remove video bookmark', () => {
      const action = removeVideoBookmarkSuccess({ payload: 14 });
      state = reducer(state, action);
      expect(state.bookmarkIds.includes(14)).toBeFalsy();
    });

    it('should not add video bookmark twice', () => {
      const action = addVideoBookmarkSuccess({ payload: 8 });
      state = reducer(state, action);
      expect(state.bookmarkIds.filter((id) => id === 8).length).toEqual(1);
    });
  });
});
