import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { VideoStats } from '@app/annotations/modules/videos/models/video.model';
import { createReducer, on } from '@ngrx/store';
import {
  loadAllVideoStatsSuccess,
  loadVideoGroupsSuccess,
  loadVideoStatsSuccess,
  loadVideoStatSuccess,
} from '@app/annotations/modules/videos/store/video-stats/video-stats.actions';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { setState } from '@app/helpers/ngrx.helpers';

export const videoStatsAdapter = createEntityAdapter<VideoStats>({
  selectId: (stat) => stat.videoId,
});

export const videoGroupsAdapter = createEntityAdapter<VideoGroup>({
  selectId: (group) => group.id,
});

export type VideoStatsState = EntityState<VideoStats>;

export type VideoGroupsState = EntityState<VideoGroup>;

export interface State {
  stats: VideoStatsState;
  groups: VideoGroupsState;
}

export const initialState: State = {
  stats: videoStatsAdapter.getInitialState(),
  groups: videoGroupsAdapter.getInitialState(),
};

export const reducer = createReducer<State>(
  initialState,
  on(loadAllVideoStatsSuccess, (state, { payload: stats }) =>
    setState(
      {
        stats: videoStatsAdapter.setAll(stats, state.stats),
      },
      state,
    ),
  ),
  on(loadVideoStatSuccess, (state, { payload: stat }) =>
    setState(
      {
        stats: videoStatsAdapter.upsertOne(stat, state.stats),
      },
      state,
    ),
  ),
  on(loadVideoStatsSuccess, (state, { payload: stats }) =>
    setState(
      {
        stats: videoStatsAdapter.upsertMany(stats, state.stats),
      },
      state,
    ),
  ),
  on(loadVideoGroupsSuccess, (state, { payload: groups }) =>
    setState(
      {
        groups: videoGroupsAdapter.upsertMany(groups, state.groups),
      },
      state,
    ),
  ),
);

export const getStatsByVideoId = (id: number) => (state: VideoStatsState) =>
  state.entities[id];
