import { uniq } from 'lodash';
import {
  buildEventTypes,
  TimelineEvent,
  TimelineEventType,
} from 'ngx-event-timeline';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';

export const isAt = (timestamp: number) => (annotation: Annotation) =>
  annotation.timestamp <= timestamp &&
  annotation.timestamp + annotation.duration >= timestamp;

export const getDescriptions = (
  annotations: Array<Annotation>,
): Array<string> =>
  uniq(
    annotations
      .filter((annotation) => annotation.category !== 'svg')
      .map((annotation) => annotation.description),
  );

export const fitInVideo = (
  annotation: Annotation,
  videoDuration: number,
): Annotation => {
  const duration =
    annotation.timestamp + annotation.duration > videoDuration
      ? videoDuration - annotation.timestamp
      : annotation.duration;
  return {
    ...annotation,
    duration,
  };
};

export const updateAnnotationTimestamp = (
  annotation: Annotation,
  newTimestamp: number,
): Annotation => {
  if (annotation.category !== 'svg') {
    return {
      ...annotation,
      timestamp: newTimestamp,
    };
  } else {
    const difference = newTimestamp - annotation.timestamp;
    const newPositions = {};
    const positions = annotation.shape.positions;
    Object.keys(positions).map((timestamp) => {
      newPositions[+timestamp + difference] = positions[timestamp];
    });
    return {
      ...annotation,
      timestamp: newTimestamp,
      shape: {
        ...annotation.shape,
        positions: newPositions,
      },
    };
  }
};

export const normalizeOneFrameAnnotations = (
  annotations: Array<Annotation>,
  videoDuration: number,
  timelineWidth: number,
): any => {
  return annotations.map((a) => {
    if (a.isOneShot) {
      return {
        ...a,
        duration: (6 * videoDuration) / timelineWidth,
      };
    } else {
      return a;
    }
  });
};

export const mapToTimelineEvent = (
  annotation: Annotation,
  eventType: string = annotation.category,
): TimelineEvent => {
  return {
    id: annotation.id,
    eventType,
    title: annotation.label ? annotation.label.name : annotation.description,
    timestamp: annotation.timestamp,
    duration: annotation.duration,
  };
};

export const getSvgEvents = (annotations: Annotation[]): TimelineEvent[] => {
  return annotations
    .map((annotation) => mapToTimelineEvent(annotation, annotation.label.name))
    .sort((a, b) => ('' + a.eventType).localeCompare(b.eventType));
};

export const getEventType = (annotation: Annotation): string => {
  let eventType = annotation.category;
  if (annotation.category === 'svg' && annotation.label.name.length) {
    eventType = annotation.label.name;
  }
  return eventType;
};

export const mapEventTypesWithColor = (
  events: Array<TimelineEvent>,
  labels: Array<AnnotationLabel>,
): TimelineEventType[] => {
  const eventTypes = buildEventTypes(events);
  return eventTypes.map((eventType) => {
    const label = labels.find(
      (l) => eventType.type.toLowerCase() === l.name.toLowerCase(),
    );
    if (label) {
      eventType.color = label.color;
    }
    return eventType;
  });
};

export const toAnnotationWithLabel = (annotation: Annotation) => (
  labels: AnnotationLabel[],
): Annotation => {
  return {
    ...annotation,
    label: labels.find((l) => l.name === annotation.labelName),
  };
};

export const getAnnotationsToSelect = (
  lastSelectedId: number,
  selectedAnnotations: number[],
  annotations: Annotation[],
): number[] => {
  const lastSelected = annotations.find((a) => a.id === lastSelectedId);
  if (lastSelected && lastSelected.labelName) {
    const selection = annotations
      .filter(
        (a) =>
          !selectedAnnotations.includes(a.id) &&
          a.labelName === lastSelected.labelName,
      )
      .map((a) => a.id);
    // if there is still annotations with the same label to select, select them all, otherwise unselect label
    if (selection.length) {
      return uniq([...selectedAnnotations, ...selection]);
    } else {
      return annotations
        .filter(
          (a) =>
            selectedAnnotations.includes(a.id) &&
            a.labelName !== lastSelected.labelName,
        )
        .map((a) => a.id);
    }
  }
  return selectedAnnotations;
};
