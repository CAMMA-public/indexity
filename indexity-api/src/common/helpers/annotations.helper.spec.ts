import {
  rectifyPositions,
  removeDuplicatedPositions,
  addInterpolatedPositions,
  cleanAnnotation,
} from './annotations.helper';

import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { UserEntity } from '../../users/entities/user.entity';

describe('Annotations Helper', () => {
  it('should remove duplicated positions', () => {
    const positions = {
      2000: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
      2500: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
      3000: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
      3500: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
      4000: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777779,
      },
      4500: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
    };
    const expected = {
      2000: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
      4000: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777779,
      },
      4500: {
        x: 24.528301886792452,
        y: 32.0335429769392,
        width: 17.830188679245282,
        height: 17.77777777777778,
      },
    };
    const result = removeDuplicatedPositions(positions);
    expect(result).toEqual(expected);
  });

  describe('rectifyPositions', () => {
    it('should set x to 0', () => {
      const positions = {
        0: {
          x: -10,
          y: 10,
          width: 20,
          height: 10,
        },
      };
      const res = rectifyPositions(positions);
      const expected = {
        0: {
          x: 0,
          y: 10,
          width: 10,
          height: 10,
        },
      };
      expect(res.changed).toBeTruthy();
      expect(res.result).toEqual(expected);
    });

    it('should reduce width', () => {
      const positions = {
        0: {
          x: 100,
          y: 10,
          width: 10,
          height: 10,
        },
      };
      const res = rectifyPositions(positions);
      const expected = {
        0: {
          x: 100,
          y: 10,
          width: 0,
          height: 10,
        },
      };
      expect(res.changed).toBeTruthy();
      expect(res.result).toEqual(expected);
    });

    it('should set y to 0', () => {
      const positions = {
        0: {
          x: -10,
          y: -10,
          width: 20,
          height: 20,
        },
      };
      const res = rectifyPositions(positions);
      const expected = {
        0: {
          x: 0,
          y: 0,
          width: 10,
          height: 10,
        },
      };
      expect(res.changed).toBeTruthy();
      expect(res.result).toEqual(expected);
    });

    it('should reduce height', () => {
      const positions = {
        0: {
          x: -10,
          y: 80,
          width: 20,
          height: 30,
        },
      };
      const res = rectifyPositions(positions);
      const expected = {
        0: {
          x: 0,
          y: 80,
          width: 10,
          height: 20,
        },
      };
      expect(res.changed).toBeTruthy();
      expect(res.result).toEqual(expected);
    });

    it('should change nothing', () => {
      const positions = {
        0: {
          x: 0,
          y: 80,
          width: 10,
          height: 20,
        },
      };
      const res = rectifyPositions(positions);
      expect(res.changed).toBeFalsy();
      expect(res.result).toEqual(positions);
    });
  });

  describe('addInterpolatedPositions', () => {
    const fakePositions = {
      '0': { x: 0, y: 0, width: 100, height: 100 },
      '233': { x: 50, y: 50, width: 50, height: 50 },
    };
    const fakeDuration = 233;

    it('should return the annotation with more positions', () => {
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const nbPositions = Object.keys(fakePositions).length;
      const fakeStep = 100;

      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);
      const nbResultPositions = Object.keys(result.shape.positions).length;

      expect(nbResultPositions).toBeGreaterThan(nbPositions);
    });

    it('should respect the step', () => {
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.duration = fakeDuration;
      fakeAnnotationEntity.timestamp = 0;
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const fakeStep = 100;

      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);
      const timestamps = Object.keys(result.shape.positions);

      expect(timestamps).toEqual(['0', '100', '200', '233']);
    });

    it('should respect the duration', () => {
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.duration = 700;
      fakeAnnotationEntity.timestamp = 0;
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const fakeStep = 200;
      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);
      const timestamps = Object.keys(result.shape.positions);

      expect(timestamps[timestamps.length - 1]).toEqual(
        fakeAnnotationEntity.duration.toString(),
      );
    });

    it('should respect the duration when given a start timestamp', () => {
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.duration = 700;
      fakeAnnotationEntity.timestamp = 33;
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const fakeStep = 200;
      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);
      const timestamps = Object.keys(result.shape.positions);

      expect(timestamps[timestamps.length - 1]).toEqual(
        (
          fakeAnnotationEntity.duration + fakeAnnotationEntity.timestamp
        ).toString(),
      );
    });

    it('should use the last position to respect the duration', () => {
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.duration = 700;
      fakeAnnotationEntity.timestamp = 0;
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const fakeStep = 200;
      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);

      expect(result.shape.positions['700']).toEqual(fakePositions['233']);
    });

    it('should preserve the original positions', () => {
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.duration = 233;
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const fakeStep = 33;

      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);
      const timestamps = Object.keys(result.shape.positions);

      expect(timestamps).toContain('0');
      expect(timestamps).toContain('233');
      expect(result.shape.positions['0']).toEqual(fakePositions['0']);
      expect(result.shape.positions['233']).toEqual(fakePositions['233']);
    });

    it('should interpolate the positions', () => {
      const fakePositions = {
        '0': { x: 4, y: 6, width: 10, height: 1 },
        '30': { x: 16, y: 12, width: 13, height: 7 },
      };
      const expectedPositions = {
        '10': { x: 8, y: 8, width: 11, height: 3 },
        '20': { x: 12, y: 10, width: 12, height: 5 },
      };
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.duration = fakeDuration;
      fakeAnnotationEntity.shape = {
        positions: fakePositions,
      };
      const fakeStep = 10;

      const result = addInterpolatedPositions(fakeAnnotationEntity, fakeStep);
      expect(result.shape.positions['10']).toEqual(expectedPositions['10']);
      expect(result.shape.positions['20']).toEqual(expectedPositions['20']);
    });
  });

  it('should remove private user information', () => {
    const fakeAnnotationEntity = new AnnotationEntity();
    fakeAnnotationEntity.user = null;
    const undefinedUserResult = cleanAnnotation(fakeAnnotationEntity);
    expect(undefinedUserResult.user).toBeNull();

    fakeAnnotationEntity.user = new UserEntity();
    fakeAnnotationEntity.user.password = 'SecretHashPass';
    fakeAnnotationEntity.user.email = 'secret@mail.com';
    fakeAnnotationEntity.user.ipAddress = 'x.x.x.x';

    const result = cleanAnnotation(fakeAnnotationEntity);
    expect(result.user).toBeDefined();
    expect(result.user.password).toBeUndefined();
    expect(result.user.email).toBeUndefined();
    expect(result.user.ipAddress).toBeUndefined();
  });
});
