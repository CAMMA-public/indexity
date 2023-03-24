import * as fromStructureTracker from './structure-tracker.reducer';
import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { STRUCTURE_TRACKER_START } from '@app/annotations/models/annotation-socket-events';
import { getAllAnnotations } from '../annotations/index';
import { getAllLabels } from '../annotation-labels/index';
import { EntityState } from '@ngrx/entity';
import { StructureTracker } from '@app/annotations/models/structure-tracker.model';

export const reducers = (
  state: fromStructureTracker.State | undefined,
  action: Action,
): EntityState<StructureTracker> => fromStructureTracker.reducer(state, action);

export const selectStructureTrackerFeatureState = createFeatureSelector<
  fromStructureTracker.State
>('structureTracker');

export const {
  selectAll: selectAllStructureTrackers,
} = fromStructureTracker.trackersAdapter.getSelectors(
  selectStructureTrackerFeatureState,
);

export const selectStartedStructureTrackers = createSelector(
  selectAllStructureTrackers,
  (trackers) => trackers.filter((t) => t.status === STRUCTURE_TRACKER_START),
);

export const selectStartedStructureTrackerIds = createSelector(
  selectStartedStructureTrackers,
  (trackers) => trackers.map((t) => t.annotationId),
);

export const selectTrackedAnnotations = createSelector(
  selectStartedStructureTrackerIds,
  getAllAnnotations,
  (trackerIds, annotations) =>
    annotations.filter((annotation) => trackerIds.includes(annotation.id)),
);

export const selectTrackedAnnotationLabels = createSelector(
  selectTrackedAnnotations,
  (annotations) => annotations.map((annotation) => annotation.label),
);

export const selectTrackedAnnotationIds = createSelector(
  selectTrackedAnnotations,
  (annotations) => annotations.map((annotation) => annotation.id),
);

export const selectTrackedAnnotationLabelNames = createSelector(
  selectTrackedAnnotationLabels,
  (labels) => labels.map((label) => label.name),
);

export const selectAnnotationsWithTrackerInfo = createSelector(
  selectTrackedAnnotationLabelNames,
  getAllAnnotations,
  (trackerLabels, annotations) =>
    annotations.map((annotation) =>
      trackerLabels.includes(annotation.label.name)
        ? {
            ...annotation,
            label: {
              ...annotation.label,
              name: `${annotation.label.name} ‧ tracked`,
            },
          }
        : annotation,
    ),
);

export const selectLabelsWithTrackerInfo = createSelector(
  selectTrackedAnnotationLabelNames,
  getAllLabels,
  (trackedLabelNames, labels) =>
    labels.map((label) =>
      trackedLabelNames.includes(label.name)
        ? { ...label, name: `${label.name} ‧ tracked` }
        : label,
    ),
);
