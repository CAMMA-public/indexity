import { VideosFilter } from '@app/annotations/models/videos-filter.model';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { VideoAnnotationState } from '@app/models/user-video-annotation-state';
import { createAction, props } from '@ngrx/store';

/*
 VIDEOS ACTIONS
 */

// LOAD

export const load = createAction('[Videos] Load', props<{ payload: number }>());

export const loadSuccess = createAction(
  '[Videos] Load Success',
  props<{ payload: Video }>(),
);

export const loadFailure = createAction(
  '[Videos] Load failure',
  props<{ payload: any }>(),
);

// LOAD ALL

export const loadAll = createAction(
  '[Videos] Load All',
  props<{ payload?: { offset: number; limit?: number } }>(),
);

export const loadAllSuccess = createAction(
  '[Videos] Load all success',
  props<{ payload: Video[] }>(),
);

export const loadAllFailure = createAction(
  '[Videos] Load all failure',
  props<{ payload: any }>(),
);

// LOAD BATCH

export const loadBatch = createAction(
  '[Videos] Load batch',
  ({ limit }: { limit: number } = { limit: 15 }) => ({ limit }),
);

export const loadBatchSuccess = createAction(
  '[Videos] Load batch success',
  props<{ payload: Video[] }>(),
);

// LOAD BY IDS

export const loadVideosByIds = createAction(
  '[Videos] Load by IDs',
  props<{ payload: number[] }>(),
);

// SET

export const setCurrentVideoId = createAction(
  '[Videos] Set current video id',
  props<{ payload: number }>(),
);

export const setVideoAnnotationState = createAction(
  '[Videos] Set annotation state',
  props<{ payload: VideoAnnotationState }>(),
);

export const setVideoAnnotationStateFailure = createAction(
  '[Videos] Set video annotation state failure',
  props<{ payload: string }>(),
);

// ADD

export const videoAdded = createAction(
  '[Videos] Video added',
  props<{ payload: Video }>(),
);

// UPDATE

export const updateVideo = createAction(
  '[Videos] Update video',
  props<{ payload: Partial<Video> }>(),
);

export const videoUpdated = createAction(
  '[Videos] Video updated',
  props<{ payload: Partial<Video> }>(),
);

export const updateFailure = createAction(
  '[Videos] Update failure',
  props<{ payload: any }>(),
);

// REMOVE

export const remove = createAction(
  '[Videos] Remove',
  props<{ payload: number }>(),
);

export const removeSuccess = createAction(
  '[Videos] Remove success',
  props<{ payload: number }>(),
);

export const removeFailure = createAction(
  '[Videos] Remove Failure',
  props<{ payload: any }>(),
);

// CLEAR

export const clearVideoList = createAction('[Videos] Clear videos list');

/* ------------------------------------------------------------------------------------------------------------------ */

/*
 VIDEOS BOOKMARKS ACTIONS
 */

// LOAD VIDEOS BOOKMARKS

export const loadVideoBookmarks = createAction(
  '[Videos bookmarks] Load video bookmarks',
);
export const loadVideoBookmarksSuccess = createAction(
  '[Videos bookmarks] Load video bookmarks success',
);

export const loadVideoBookmarksIds = createAction(
  '[Videos bookmarks] Load video bookmarks ids',
);

export const loadVideoBookmarksIdsSuccess = createAction(
  '[Videos bookmarks] Load video bookmarks ids success',
  props<{ payload: number[] }>(),
);

export const loadVideoBookmarkBatch = createAction(
  '[Videos bookmarks] Load video bookmarks batch',
  props<{ payload: number }>(),
);

// ADD VIDEOS BOOKMARKS

export const addVideoBookmark = createAction(
  '[Videos bookmarks] Add video bookmark',
  props<{ payload: number }>(),
);

export const addVideoBookmarkSuccess = createAction(
  '[Videos bookmarks] Add video bookmark success',
  props<{ payload: number }>(),
);

// REMOVE VIDEOS BOOKMARKS

export const removeVideoBookmark = createAction(
  '[Videos bookmarks] Remove video bookmark',
  props<{ payload: number }>(),
);

export const removeVideoBookmarkSuccess = createAction(
  '[Videos bookmarks] Remove video bookmark success',
  props<{ payload: number }>(),
);

/* ------------------------------------------------------------------------------------------------------------------ */

/*
 VIDEO FILTERS
 */

// LOAD FILTERED VIDEOS

export const loadFilteredVideosSuccess = createAction(
  '[Videos filter] Load filtered videos success',
  props<{ payload: Video[] }>(),
);

// SET

export const setCurrentFilter = createAction(
  '[Videos filter] Set current filter',
  props<{ payload: VideosFilter }>(),
);

// SEARCH

export const searchVideosByName = createAction(
  '[Videos filter] Search by name',
  props<{ payload: string }>(),
);

export const searchVideosByAnnotationState = createAction(
  '[Videos filter] Search by annotations state',
  props<{ payload: string }>(),
);

export const searchVideosByLabelName = createAction(
  '[Videos filter] Search by label name',
  props<{ payload: string }>(),
);

// CLEAR

export const clearFilter = createAction('[Videos filter] Clear filter');

/* ------------------------------------------------------------------------------------------------------------------ */

/*
 VIDEOS THUMBNAILS
 */

export const thumbGenerated = createAction(
  '[Videos thumbnail] Thumb generated',
  props<{ payload: Partial<Video> }>(),
);

/* ------------------------------------------------------------------------------------------------------------------ */

/*
 STORE
 */

export const clear = createAction('[Videos] Clear'); // Will trigger the full video store cleaning.
