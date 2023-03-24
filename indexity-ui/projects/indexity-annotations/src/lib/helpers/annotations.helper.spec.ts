import * as annotationsHelper from './annotations.helper';
import { annotations } from '../mocks/mock-annotations-service';

describe('AnnotationHelper', () => {
  const svgOverlay = {
    top: 0,
    left: 0,
    width: 100,
    height: 200,
  };

  describe('isAt', () => {
    it('should return an array of 1 annotations', () => {
      const timestamp = 5000;
      const result = annotations.filter(annotationsHelper.isAt(timestamp));
      expect(result.length).toEqual(1);
      expect(annotationsHelper.isAt(timestamp)(annotations[4])).toBeTruthy();
      expect(result).toEqual([annotations[4]]);
    });

    it('should return an empty array', () => {
      const timestamp = 50000;
      const result = annotations.filter(annotationsHelper.isAt(timestamp));
      expect(annotationsHelper.isAt(timestamp)(annotations[4])).toBeFalsy();
      expect(result.length).toEqual(0);
      expect(result).toEqual([]);
    });
  });

  describe('getDescriptions', () => {
    it('should return an array of 3 strings', () => {
      const result = annotationsHelper.getDescriptions(annotations);
      expect(result.length).toEqual(3);
      expect(result).toEqual([
        'Preparation',
        'Calot Triangle Dissection',
        'Surgeon right hand using [Grasper]',
      ]);
    });
  });

  // describe('cutShape', () => {
  //   it('should cut the shape and get the last position', () => {
  //     const timestamp = 2500;
  //     const positions2 = {
  //       2533: {
  //         x: 20,
  //         y: 20,
  //         width: 20,
  //         height: 20
  //       }
  //     };
  //     const expectedFirstPart = {
  //       ...annotation.shape
  //     };
  //     const expectedLastPart = {
  //       ...annotation.shape,
  //       positions: positions2
  //     };
  //     const expected = [expectedFirstPart, expectedLastPart];
  //     const result = annotationsHelper.cutShape(annotation.shape, timestamp);
  //
  //     expect(result).toEqual(expected);
  //   });
  // });

  describe('getHeightInPixels', () => {
    it('should return the right amount of pixels', () => {
      const ratio = 50;
      const expected = 100;
      const res = annotationsHelper.getHeightInPixels(ratio, svgOverlay.height);
      expect(res).toEqual(expected);
    });
  });

  describe('getWidthInPixels', () => {
    it('should return the right amount of pixels', () => {
      const ratio = 50;
      const expected = 50;
      const res = annotationsHelper.getWidthInPixels(ratio, svgOverlay.width);
      expect(res).toEqual(expected);
    });
  });

  describe('getWidthInRatio', () => {
    it('should return the right percentage', () => {
      const pixels = 50;
      const expected = 50;
      const res = annotationsHelper.getWidthInRatio(pixels, svgOverlay.width);
      expect(res).toEqual(expected);
    });
  });

  describe('getHeightInRatio', () => {
    it('should return the right percentage', () => {
      const pixels = 100;
      const expected = 50;
      const res = annotationsHelper.getHeightInRatio(pixels, svgOverlay.height);
      expect(res).toEqual(expected);
    });
  });
});
