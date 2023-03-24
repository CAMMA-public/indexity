import { isNull, range, cloneDeep } from 'lodash';

import { AnnotationEntity } from '../../annotations/entities/annotation.entity';

interface TimestampedPositions {
  [timestamp: string]: Position;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  timestamp: number;
  position: Position;
}

const FRAME_SIZE_IN_PERCENTS = 100;

export const rectifyPositions = (
  positions: TimestampedPositions,
): { changed: boolean; result: TimestampedPositions } => {
  const result: TimestampedPositions = {};
  let changed = false;
  Object.keys(positions).map(timestamp => {
    let x = positions[timestamp].x;
    let y = positions[timestamp].y;
    let width = positions[timestamp].width;
    let height = positions[timestamp].height;
    if (x < 0) {
      width = width + x;
      x = 0;
      changed = true;
    }
    if (y < 0) {
      height = height + y;
      y = 0;
      changed = true;
    }
    if (x + width > FRAME_SIZE_IN_PERCENTS) {
      width = FRAME_SIZE_IN_PERCENTS - x;
      changed = true;
    }
    if (y + height > FRAME_SIZE_IN_PERCENTS) {
      height = FRAME_SIZE_IN_PERCENTS - y;
      changed = true;
    }
    result[timestamp] = {
      x,
      y,
      width,
      height,
    };
  });
  return {
    changed,
    result,
  };
};

export const removeDuplicatedPositions = (
  positions: TimestampedPositions,
): TimestampedPositions => {
  let lastPosition: Position = null;
  const result: TimestampedPositions = {};
  Object.keys(positions).map(timestamp => {
    if (
      isNull(lastPosition) ||
      lastPosition.x !== positions[timestamp].x ||
      lastPosition.y !== positions[timestamp].y ||
      lastPosition.width !== positions[timestamp].width ||
      lastPosition.height !== positions[timestamp].height
    ) {
      result[timestamp] = positions[timestamp];
      lastPosition = positions[timestamp];
    }
  });
  return result;
};

// Interpolation of annotations

const linearInterpolation = (
  xA: number,
  yA: number,
  xB: number,
  yB: number,
  x: number,
): number => {
  return yA + (x - xA) * ((yB - yA) / (xB - xA));
};

const getPositionsBetween = (p1: Point, p2: Point, ts: number): Position => {
  if (p1.timestamp < ts && ts < p2.timestamp) {
    if (p1.timestamp === ts) {
      return p1.position;
    } else if (p2.timestamp === ts) {
      return p2.position;
    } else {
      const pos1 = p1.position;
      const pos2 = p2.position;

      const x = linearInterpolation(
        p1.timestamp,
        pos1.x,
        p2.timestamp,
        pos2.x,
        ts,
      );
      const y = linearInterpolation(
        p1.timestamp,
        pos1.y,
        p2.timestamp,
        pos2.y,
        ts,
      );
      const width = linearInterpolation(
        p1.timestamp,
        pos1.width,
        p2.timestamp,
        pos2.width,
        ts,
      );
      const height = linearInterpolation(
        p1.timestamp,
        pos1.height,
        p2.timestamp,
        pos2.height,
        ts,
      );

      return { x, y, width, height };
    }
  }
};

export const addInterpolatedPositions = (
  annotation: AnnotationEntity,
  step: number,
): AnnotationEntity => {
  if (!annotation.shape || !annotation.shape.positions) {
    return annotation;
  }
  const timestamps = Object.keys(annotation.shape.positions)
    .map(t => parseInt(t))
    .sort((a, b) => a - b);
  if (timestamps.length < 1) {
    return annotation;
  }
  const { positions } = annotation.shape;
  const newPositions = { ...positions };

  timestamps.map((currentTs, index, array) => {
    const currentPos = positions[currentTs.toString()];

    if (index === array.length - 1) {
      const lastTimestamp = annotation.timestamp + annotation.duration;
      const intermediateTs = range(currentTs + step, lastTimestamp, step);
      intermediateTs.map(t => {
        newPositions[t] = currentPos;
      });
      newPositions[lastTimestamp] = currentPos;
      return;
    }

    const nextTs = array[index + 1];
    const nextPos = positions[nextTs.toString()];
    const intermediateTs = range(currentTs + step, nextTs, step);

    intermediateTs.map(t => {
      const intermediatePos = getPositionsBetween(
        { timestamp: currentTs, position: currentPos },
        { timestamp: nextTs, position: nextPos },
        t,
      );
      if (intermediatePos) {
        newPositions[t] = intermediatePos;
      }
    });
  });

  const interpolatedAnnotation = cloneDeep(annotation);
  interpolatedAnnotation.shape.positions = newPositions;
  return interpolatedAnnotation;
};

/**
 * Removes private user information in annotation (password, ip address and email)
 * @param annotation - annotation to clean
 * @returns {AnnotationEntity} - cleaned annotation
 */
export const cleanAnnotation = (
  annotation: AnnotationEntity,
): AnnotationEntity => {
  if (!annotation.user) {
    return annotation;
  }
  const cleanedAnnotation = cloneDeep(annotation);
  delete cleanedAnnotation.user.password;
  delete cleanedAnnotation.user.ipAddress;
  delete cleanedAnnotation.user.email;

  return cleanedAnnotation;
};
