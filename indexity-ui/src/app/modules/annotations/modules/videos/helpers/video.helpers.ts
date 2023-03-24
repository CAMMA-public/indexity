import { VideoGroup } from '@app/annotations/models/video-group.model';
import { VideoStats } from '@app/annotations/modules/videos/models/video.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';

export const videoAnnotationProgressStateToLabel = (
  state: VIDEO_ANNOTATION_STATE,
): string => {
  switch (state) {
    case VIDEO_ANNOTATION_STATE.ANNOTATION_NOT_REQUIRED:
      return 'NEW';
    case VIDEO_ANNOTATION_STATE.ANNOTATION_PENDING:
      return 'TODO';
    case VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED:
      return 'DONE';
    case VIDEO_ANNOTATION_STATE.ANNOTATING:
      return 'DOING';
    default:
      return '';
  }
};

export const getLowerPlaybackRate = (
  rates: number[],
  current: number,
): number => {
  const index = rates.findIndex((value) => value === current);
  if (index === 0) {
    return rates[0];
  } else {
    return rates[index - 1];
  }
};

export const getUpperPlaybackRate = (
  rates: number[],
  current: number,
): number => {
  const index = rates.findIndex((value) => value === current);
  if (index === rates.length - 1) {
    return rates[rates.length - 1];
  } else {
    return rates[index + 1];
  }
};

export const getNextPlaybackRate = (
  rates: number[],
  current: number,
): number => {
  const index = rates.findIndex((value) => value === current);
  if (index === rates.length - 1) {
    return rates[0];
  } else {
    return rates[index + 1];
  }
};

export const isBetweenIndexes = (
  index1: number,
  index2: number,
  currentIndex: number,
): boolean => {
  return (
    (index2 >= index1 && currentIndex <= index2 && currentIndex >= index1) ||
    (currentIndex >= index2 && currentIndex <= index1)
  );
};

export const getSelectionOnShiftClick = (
  firstClickedEl: number,
  videos: number[],
  videoClicked: number,
): number[] => {
  if (firstClickedEl) {
    const videoIndex = videos.findIndex((v) => v === videoClicked);
    const shiftElIndex = videos.findIndex((v) => v === firstClickedEl);
    return videos.filter((v, index) =>
      isBetweenIndexes(shiftElIndex, videoIndex, index),
    );
  } else {
    return [videoClicked];
  }
};

const statGroupReducer = (groups: VideoGroup[]) => (
  acc: { [videoId: number]: VideoGroup[] },
  stat: VideoStats,
) => ({
  ...acc,
  [stat.videoId]: groups.filter((g) => stat.groupIds.includes(g.id)),
});

export const mapGroupsToVideos = (
  stats: VideoStats[],
  groups: VideoGroup[],
): { [p: number]: VideoGroup[] } => stats.reduce(statGroupReducer(groups), {});
