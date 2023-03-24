import { VideosFilter } from '@app/annotations/models/videos-filter.model';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import {
  addVideoBookmarkSuccess,
  clear,
  clearFilter,
  clearVideoList,
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
import { setState } from '@app/helpers/ngrx.helpers';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

export interface State extends EntityState<Video> {
  currentId?: number;
  bookmarkIds: number[];
  isFiltering: boolean;
  filter?: VideosFilter;
}

export const videosAdapter = createEntityAdapter<Video>({
  selectId: (video: Video) => (video ? video.id : null), // entity's primary key selector
  sortComparer: false,
});

export const initialState = videosAdapter.getInitialState({
  currentId: null,
  bookmarkIds: [],
  isFiltering: false,
  filter: null,
});

export const reducer = createReducer<State>(
  initialState as State,

  /*
    VIDEOS
   */

  // LOAD
  on(loadSuccess, (state, { payload: video }) =>
    videosAdapter.upsertOne(video, state),
  ),
  on(loadAllSuccess, (state, { payload: videos }) =>
    videosAdapter.setAll(videos, state),
  ),
  on(loadBatchSuccess, (state, { payload: videos }) =>
    videosAdapter.addMany(videos, state),
  ),

  // SET
  on(setCurrentVideoId, (state, { payload: currentId }) =>
    setState<State>({ currentId }, state),
  ),

  // ADD
  on(videoAdded, (state, { payload: video }) =>
    videosAdapter.upsertOne(video, state),
  ),

  // UPDATE
  on(videoUpdated, (state, { payload: video }) =>
    videosAdapter.updateOne(
      {
        id: video.id,
        changes: video,
      },
      state,
    ),
  ),

  // REMOVE
  on(removeSuccess, (state, { payload: id }) =>
    videosAdapter.removeOne(id, state),
  ),

  // CLEAR
  on(clearVideoList, (state) => videosAdapter.setAll([], state)),

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
    BOOKMARKS
   */

  // LOAD
  on(loadVideoBookmarksIdsSuccess, (state, { payload: bookmarkIds }) =>
    setState<State>({ bookmarkIds }, state),
  ),

  // ADD
  on(addVideoBookmarkSuccess, (state, { payload: id }) =>
    setState<State>(
      {
        bookmarkIds: Array.from(new Set([...state.bookmarkIds, id])),
      },
      state,
    ),
  ),

  // REMOVE
  on(removeVideoBookmarkSuccess, (state, { payload: id }) =>
    setState<State>(
      {
        bookmarkIds: state.bookmarkIds.filter((bId) => bId !== id),
      },
      state,
    ),
  ),

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   FILTERS
   */

  // LOAD
  on(loadFilteredVideosSuccess, (state, { payload: videos }) =>
    // Here we are replacing the current videos with the response from the API
    // It might not be the best solution in terms of performances
    videosAdapter.addMany(videos, state),
  ),

  // SET
  on(setCurrentFilter, (state, { payload: filter }) =>
    setState<State>(
      {
        isFiltering: true,
        filter: filter,
      },
      state,
    ),
  ),

  // CLEAR
  on(clearFilter, (state) =>
    setState<State>(
      {
        filter: null,
        isFiltering: false,
      },
      state,
    ),
  ),

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   VIDEOS THUMBNAILS
   */

  on(thumbGenerated, (state, { payload: video }) =>
    videosAdapter.updateOne(
      {
        id: video.id,
        changes: { thumbnailUrl: video.thumbnailUrl },
      },
      state,
    ),
  ),

  /* ------------------------------------------------------------------------------------------------------------------ */

  /*
   STORE
   */
  on(clear, () => initialState as State),
);
