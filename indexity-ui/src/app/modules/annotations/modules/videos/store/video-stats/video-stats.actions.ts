import { createAction, props } from '@ngrx/store';
import { VideoStats } from '@app/annotations/modules/videos/models/video.model';
import { VideoGroup } from '@app/annotations/models/video-group.model';

export const loadVideoStat = createAction(
  '[Video Stats] Load',
  props<{ payload: number }>(),
);

export const loadVideoStatSuccess = createAction(
  '[Video Stats] Load success',
  props<{ payload: VideoStats }>(),
);

export const loadVideoStats = createAction(
  '[Video Stats] Load multiple',
  props<{ payload: number[] }>(),
);

export const loadVideoStatsSuccess = createAction(
  // merges with existing results
  '[Video Stats] Load multiple success',
  props<{ payload: VideoStats[] }>(),
);

export const loadAllVideoStatsSuccess = createAction(
  // replaces existing results
  '[Video Stats] Load All success',
  props<{ payload: VideoStats[] }>(),
);

export const loadVideoStatsFailure = createAction(
  '[Video Stats] Load failure',
  props<{ payload: any }>(),
);

export const loadVideoGroups = createAction(
  '[Video Stats] Load video groups',
  props<{ payload: number[] }>(),
);

export const loadVideoGroupsSuccess = createAction(
  '[Video Stats] Load video groups success',
  props<{ payload: VideoGroup[] }>(),
);
