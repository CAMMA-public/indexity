import { VideoGroup } from '@app/annotations/models/video-group.model';
import { VideoAnnotationState } from '@app/models/user-video-annotation-state';
import { Video } from '@app/videos/models/video.model';
import { createAction, props } from '@ngrx/store';

export const searchVideosAndExcludeIds = createAction(
  '[VideosGroups - Videos] Search videos and exclude IDs',
  props<{ payload: { name: string; ids: number[] } }>(),
);

export const searchVideosSuccess = createAction(
  '[VideoGroups - Videos] Search Success',
  props<{ payload: Video[] }>(),
);

export const loadVideosByExcludedIds = createAction(
  '[VideoGroups - Videos] Load Videos by excluded IDs',
  props<{ payload: number[] }>(),
);

export const loadVideosBatchSuccess = createAction(
  '[VideoGroups - Videos] Load videos batch success',
  props<{ payload: Video[] }>(),
);

export const loadVideosSuccess = createAction(
  '[VideoGroups - Videos] Load videos success',
  props<{ payload: Video[] }>(),
);

export const loadNextVideoBatchByExcludedIds = createAction(
  '[VideoGroups - Videos] Load next video batch by excluded ids',
  props<{ payload: { ids: number[]; limit?: number } }>(),
);

export const setLabelGroup = createAction(
  '[videoGroups] Set label group',
  props<{
    payload: { videoGroupId: number; annotationLabelGroupId: number };
  }>(),
);

export const setLabelGroupSuccess = createAction(
  '[videoGroups] Set label group success',
  props<{ payload: VideoGroup }>(),
);

// following actions are duplicated and already exist as Videos actions
// they currently handle different slices of the store
// associated reducers, effects, selectors and tests are likely to be duplicated as well

export const setVideoAnnotationState = createAction(
  '[videoGroups - Videos] Set annotation state',
  props<{ payload: VideoAnnotationState }>(),
);

export const videoUpdated = createAction(
  '[videoGroups - Videos] Video updated',
  props<{ payload: Partial<Video> }>(),
);

export const setVideoAnnotationStateFailure = createAction(
  '[videoGroups - Videos] Set video annotation state failure',
  props<{ payload: string }>(),
);

export const loadVideoBookmarks = createAction(
  '[videoGroups - Videos] Load video bookmarks',
);

export const loadVideoBookmarksSuccess = createAction(
  '[videoGroups - Videos] Load video bookmarks success',
  props<{ payload: Video[] }>(),
);

export const addVideoBookmark = createAction(
  '[videoGroups - Videos] Add video bookmark',
  props<{ payload: number }>(),
);

export const addVideoBookmarkSuccess = createAction(
  '[videoGroups - Videos] Add video bookmark success',
  props<{ payload: number }>(),
);

export const removeVideoBookmark = createAction(
  '[videoGroups - Videos] Remove video bookmark',
  props<{ payload: number }>(),
);

export const removeVideoBookmarkSuccess = createAction(
  '[videoGroups - Videos] Remove video bookmark success',
  props<{ payload: number }>(),
);

export const removeVideoSuccess = createAction(
  '[videoGroups - Videos] Remove success',
  props<{ payload: number }>(),
);
