import { VideoGroup } from '@app/annotations/models/video-group.model';
import { VideosFilter } from '@app/annotations/models/videos-filter.model';
import {
  Video,
  VideoStats,
} from '@app/annotations/modules/videos/models/video.model';
import {
  Action,
  combineReducers,
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import * as fromVideoStats from './video-stats/video-stats.reducer';
import * as fromVideos from './videos/videos.reducer';

export interface State {
  videos: fromVideos.State;
  videoStats: fromVideoStats.State;
}

export const reducers = (state: State | undefined, action: Action): any =>
  combineReducers({
    videos: fromVideos.reducer,
    videoStats: fromVideoStats.reducer,
  })(state, action);

/*
 VIDEOS
 */

export const getVideosFeatureState = createFeatureSelector<State>('videos');

export const getVideosState = createSelector(
  getVideosFeatureState,
  (state) => state.videos,
);

export const {
  selectAll: getAllVideos,
  selectEntities: getVideoEntities,
  selectTotal: getVideosTotal,
} = fromVideos.videosAdapter.getSelectors(getVideosState);

export const getCurrentVideoId = createSelector(
  getVideosState,
  (state: fromVideos.State): number => state.currentId,
);

export const getVideo = createSelector(
  getVideoEntities,
  getCurrentVideoId,
  (videos, videoId) => videoId && videos[videoId],
);

export const getVideoById = (id: number): MemoizedSelector<object, Video> =>
  createSelector(getVideosState, (state) => state.entities[id]);

/* ---------------------------------------------------------------------------------------------------------------- */

/*
 VIDEOS STATS
 */

export const getVideoStatsRootState = createSelector(
  getVideosFeatureState,
  (state) => state.videoStats,
);

export const getVideoStatsState = createSelector(
  getVideoStatsRootState,
  (state) => state.stats,
);
export const getVideoStatsGroupsState = createSelector(
  getVideoStatsRootState,
  (state) => state.groups,
);

export const {
  selectAll: getAllVideoStats,
  selectTotal: getTotalVideoStats,
  selectEntities: getVideoStatsEntities,
} = fromVideoStats.videoStatsAdapter.getSelectors(getVideoStatsState);

export const {
  selectAll: getAllVideoStatsGroups,
  selectEntities: getVideoStatsGroupsEntities,
} = fromVideoStats.videoGroupsAdapter.getSelectors(getVideoStatsGroupsState);

export const getStatsByVideoId = (
  id: number,
): MemoizedSelector<object, VideoStats> =>
  createSelector(getVideoStatsState, fromVideoStats.getStatsByVideoId(id));

export const getVideoStatsGroupsByIds = (
  ids: number[],
): MemoizedSelector<object, VideoGroup[]> =>
  createSelector(getAllVideoStatsGroups, (groups) =>
    groups.filter((g) => ids.includes(g.id)),
  );

/* ---------------------------------------------------------------------------------------------------------------- */

/*
 VIDEOS BOOKMARKS
 */

export const getBookmarkIds = (state: fromVideos.State): Array<number> =>
  state.bookmarkIds;

export const getBookmarkedVideos = createSelector(
  getVideosState,
  (state: fromVideos.State): Video[] =>
    getBookmarkIds(state)
      .map((id) => state.entities[id])
      .filter((v) => !!v),
);

export const getBookmarkedVideosTotal = createSelector(
  getVideosState,
  (state: fromVideos.State): number => getBookmarkIds(state).length,
);

/* ---------------------------------------------------------------------------------------------------------------- */

/*
 VIDEOS FILTER
 */

export const getFilter = (state: fromVideos.State): VideosFilter =>
  state.filter;

export const getVideosFilter = createSelector(getVideosState, getFilter);
