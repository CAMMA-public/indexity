import { uniq } from 'lodash-es';
import { AnnotationShape } from '../models/annotation-shape.model';
import { Annotation } from '../models/annotation.model';

/**
 * Returns true if an annotation is supposed to appear at a timestamp
 */
export const isAt = (timestamp: number) => (annotation: Annotation) =>
  annotation.timestamp <= timestamp &&
  annotation.timestamp + annotation.duration >= timestamp;

export const getNextTimestamp = (time: number, fps: number): number => {
  return (time * 1000 + (1 / fps) * 1000) / 1000;
};

/**
 * Cut shape at timestamp and return cut parts in an array
 */
export const cutShape = (
  shape: AnnotationShape,
  timestamp: number,
): [AnnotationShape, AnnotationShape] => {
  const positions = {
    ...shape.positions,
  };

  // first part
  const timestamps1 = Object.keys(positions).filter((t) => +t <= timestamp);
  const positions1 = {};
  timestamps1.map((t) => {
    positions1[t] = positions[t];
  });
  const lastTimestamp = timestamps1.sort().pop();
  const lastPosition = positions1[lastTimestamp];

  // second part
  const timestamps2 = Object.keys(positions).filter((t) => +t >= timestamp);
  const positions2 = {};
  timestamps2.map((t) => (positions2[t] = positions[t]));
  if (timestamps2.length > 0) {
    const firstTimestamp = timestamps2[0];
    const firstPosition = positions2[firstTimestamp];
    positions1[firstTimestamp] = firstPosition;
    positions2[lastTimestamp] = lastPosition;
  } else {
    positions2[timestamp + 10] = lastPosition;
  }

  // result
  const shape1 = {
    positions: positions1,
  };
  const shape2 = {
    positions: positions2,
  };
  return [shape1, shape2];
};

/**
 * Cut annotation at timestamp and return cut parts in an array
 */
export const cutAnnotation = (
  annotation: Annotation,
  timestamp: number,
): [Annotation, Annotation] => {
  const shapes = cutShape(annotation.shape, timestamp);
  const duration1 = timestamp - annotation.timestamp;
  const annotation1 = {
    ...annotation,
    shape: shapes[0],
    duration: duration1,
  };
  const duration2 = annotation.duration + annotation.timestamp - timestamp;
  const annotation2 = {
    ...annotation,
    id: null,
    timestamp: timestamp + 10,
    shape: shapes[1],
    duration: duration2,
  };
  return [annotation1, annotation2];
};

/**
 *
 */
export const getDescriptions = (
  annotations: Array<Annotation>,
): Array<string> =>
  uniq(
    annotations
      .filter((annotation) => annotation.category !== 'svg')
      .map((annotation) => annotation.description),
  );

/**
 * Translate rectangle height ratio to pixels.
 * @returns The height in pixels
 */
export const getHeightInPixels = (
  percent: number,
  overlayHeight: number,
): number => {
  return (percent * overlayHeight) / 100;
};

/**
 * Translate rectangle width ratio to pixels.
 * @returns The width in pixels
 */
export const getWidthInPixels = (
  percent: number,
  overlayWidth: number,
): number => {
  return (percent * overlayWidth) / 100;
};

/**
 * Translate rectangle width in pixels to ratio.
 * @returns Ratio of width (between 0 and 100)
 */
export const getWidthInRatio = (
  pixels: number,
  overlayWidth: number,
): number => {
  return (pixels / overlayWidth) * 100;
};

/**
 * Translate rectangle height in pixels to ratio.
 * @returns Ratio of height (between 0 and 100)
 */
export const getHeightInRatio = (
  pixels: number,
  overlayHeight: number,
): number => {
  return (pixels / overlayHeight) * 100;
};
