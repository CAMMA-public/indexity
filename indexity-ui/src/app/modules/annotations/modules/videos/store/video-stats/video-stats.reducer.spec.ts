import { VideoStats } from '@app/annotations/modules/videos/models/video.model';
import {
  loadVideoStatsSuccess,
  loadVideoStatSuccess,
} from '@app/annotations/modules/videos/store/video-stats/video-stats.actions';
import {
  initialState,
  reducer,
  videoStatsAdapter,
} from '@app/annotations/modules/videos/store/video-stats/video-stats.reducer';

describe('Video Stats reducer', () => {
  const stats: VideoStats[] = [
    {
      videoId: 1,
      annotationLabels: [],
      annotationsCount: 0,
      groupIds: [],
      users: [],
    },
    {
      videoId: 2,
      annotationLabels: [],
      annotationsCount: 0,
      groupIds: [],
      users: [],
    },
  ];

  const stat: VideoStats = {
    videoId: 3,
    annotationLabels: [],
    annotationsCount: 0,
    groupIds: [],
    users: [],
  };

  it('should load all stats with success', () => {
    const action = loadVideoStatsSuccess({ payload: stats });
    const newState = reducer(initialState, action);
    const total = videoStatsAdapter.getSelectors().selectTotal(newState.stats);

    expect(total).toEqual(stats.length);
  });

  it('should load one stats with success', () => {
    const action = loadVideoStatSuccess({ payload: stat });
    const newState = reducer(initialState, action);
    const total = videoStatsAdapter.getSelectors().selectTotal(newState.stats);

    expect(total).toEqual(1);
  });
});
