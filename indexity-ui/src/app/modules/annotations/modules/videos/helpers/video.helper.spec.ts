import {
  getLowerPlaybackRate,
  getNextPlaybackRate,
  getUpperPlaybackRate,
  videoAnnotationProgressStateToLabel,
} from '@app/annotations/modules/videos/helpers/video.helpers';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';

describe('VideoHelper', () => {
  describe('videoAnnotationProgressStateToLabel', () => {
    it('should return NEW', () => {
      expect(
        videoAnnotationProgressStateToLabel(
          VIDEO_ANNOTATION_STATE.ANNOTATION_NOT_REQUIRED,
        ),
      ).toBe('NEW');
    });

    it('should return TODO', () => {
      expect(
        videoAnnotationProgressStateToLabel(
          VIDEO_ANNOTATION_STATE.ANNOTATION_PENDING,
        ),
      ).toBe('TODO');
    });

    it('should return DONE', () => {
      expect(
        videoAnnotationProgressStateToLabel(
          VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED,
        ),
      ).toBe('DONE');
    });

    it('should return DOING', () => {
      expect(
        videoAnnotationProgressStateToLabel(VIDEO_ANNOTATION_STATE.ANNOTATING),
      ).toBe('DOING');
    });

    it('should return an empty string', () => {
      expect(
        videoAnnotationProgressStateToLabel('test' as VIDEO_ANNOTATION_STATE),
      ).toBe('');
    });
  });

  describe('playback rates', () => {
    const rates = [0.2, 0.5, 1, 2, 3, 4];

    describe('getNextPlaybackRate', () => {
      it('should return the first index', () => {
        const current = 4;
        const expected = 0.2;
        expect(getNextPlaybackRate(rates, current)).toBe(expected);
      });

      it('should return the next index', () => {
        const current = 1;
        const expected = 2;
        expect(getNextPlaybackRate(rates, current)).toBe(expected);
      });
    });

    describe('getLowerPlaybackRate', () => {
      it('should return the first index', () => {
        const current = 0.2;
        const expected = 0.2;
        expect(getLowerPlaybackRate(rates, current)).toBe(expected);
      });

      it('should return the previous index', () => {
        const current = 4;
        const expected = 3;
        expect(getLowerPlaybackRate(rates, current)).toBe(expected);
      });
    });

    describe('getUpperPlaybackRate', () => {
      it('should return the last index', () => {
        const current = 4;
        const expected = 4;
        expect(getUpperPlaybackRate(rates, current)).toBe(expected);
      });

      it('should return the next index', () => {
        const current = 1;
        const expected = 2;
        expect(getUpperPlaybackRate(rates, current)).toBe(expected);
      });
    });
  });
});
