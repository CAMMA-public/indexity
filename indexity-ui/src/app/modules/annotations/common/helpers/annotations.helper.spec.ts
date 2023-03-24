import * as annotationsHelper from './annotations.helper';
import {
  getAnnotationsToSelect,
  getEventType,
  mapEventTypesWithColor,
  mapToTimelineEvent,
} from './annotations.helper';
import { buildEventTypes } from 'ngx-event-timeline';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

const annotations: Array<Annotation> = [
  {
    category: 'action',
    description: 'Event',
    duration: 96,
    id: 1,
    videoId: 73,
    timestamp: 0,
    isOneShot: false,
  },
  {
    category: 'phase',
    description: 'Calot Triangle Dissection',
    duration: 629,
    id: 2,
    videoId: 73,
    timestamp: 97,
    isOneShot: false,
  },
  {
    category: 'action',
    description: 'Surgeon right hand using [Grasper]',
    duration: 29,
    id: 8,
    videoId: 73,
    timestamp: 43,
    isOneShot: false,
  },
  {
    category: 'action',
    description: 'Surgeon right hand using [Grasper]',
    duration: 2,
    id: 9,
    videoId: 73,
    timestamp: 74,
    isOneShot: false,
  },
  {
    id: 11,
    videoId: 4,
    label: {
      color: '#b31111',
      name: '',
      type: 'structure',
    },
    category: 'svg',
    shape: {
      positions: {
        0: {
          x: 10,
          y: 10,
          width: 15,
          height: 15,
        },
        1: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
        },
      },
    },
    duration: 1,
    timestamp: 0,
    isOneShot: false,
  },
  {
    id: 12,
    videoId: 4,
    category: 'svg',
    label: {
      color: '#b31111',
      name: 'description',
      type: 'structure',
    },
    shape: {
      positions: {
        0: {
          x: 10,
          y: 10,
          width: 15,
          height: 15,
        },
        1: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
        },
      },
    },
    duration: 33,
    timestamp: 0,
    isOneShot: true,
  },
];

describe('Annotations Helper', () => {
  describe('isAt', () => {
    it('should return an array of 1 annotations', () => {
      const result = annotations.filter(annotationsHelper.isAt(100));
      expect(result.length).toEqual(1);
      expect(annotationsHelper.isAt(100)(annotations[1])).toBeTruthy();
      expect(result).toEqual([annotations[1]]);
    });

    it('should return an empty array', () => {
      const result = annotations.filter(annotationsHelper.isAt(1000));
      expect(annotationsHelper.isAt(1000)(annotations[1])).toBeFalsy();
      expect(result.length).toEqual(0);
      expect(result).toEqual([]);
    });
  });

  describe('getDescriptions', () => {
    it('should return an array of 3 strings', () => {
      const result = annotationsHelper.getDescriptions(annotations);
      expect(result.length).toEqual(3);
      expect(result).toEqual([
        'Event',
        'Calot Triangle Dissection',
        'Surgeon right hand using [Grasper]',
      ]);
    });
  });

  describe('getSvgEvents', () => {
    // TODO: figure out what this function was supposed to accomlish
    // it('should return an array of 3 strings', () => {
    //   const result = annotationsHelper.getSvgEvents(annotations);
    //   const expected = [
    //     {
    //       id: annotations[4].id,
    //       eventType: annotations[4].label.name,
    //       title: annotations[4].label.name,
    //       timestamp: annotations[4].timestamp,
    //       duration: annotations[4].duration
    //     },
    //     {
    //       id: annotations[5].id,
    //       eventType: annotations[5].label.name,
    //       title: annotations[5].label.name,
    //       timestamp: annotations[5].timestamp,
    //       duration: annotations[5].duration
    //     }
    //   ];
    //   expect(result.length).toEqual(2);
    //   expect(result).toEqual(expected);
    // });
  });

  describe('fitInVideo', () => {
    it('should set duration to 70', () => {
      const duration = 70;
      const result = annotationsHelper.fitInVideo(annotations[0], duration);
      expect(result.duration).toEqual(duration);
    });

    it('should not change duration', () => {
      const duration = 100;
      const result = annotationsHelper.fitInVideo(annotations[0], duration);
      expect(result.duration).toEqual(annotations[0].duration);
    });
  });

  describe('updateAnnotationTimestamp', () => {
    it('should update timestamp', () => {
      const newTs = 2;
      const result = annotationsHelper.updateAnnotationTimestamp(
        annotations[2],
        newTs,
      );
      expect(result.timestamp).toEqual(newTs);
    });

    it('should update timestamp and positions', () => {
      const newTs = 2;
      const result = annotationsHelper.updateAnnotationTimestamp(
        annotations[4],
        newTs,
      );
      expect(result.timestamp).toEqual(newTs);
      expect(result.shape.positions[newTs]).toEqual(
        annotations[4].shape.positions[0],
      );
      expect(result.shape.positions[3]).toEqual(
        annotations[4].shape.positions[1],
      );
    });
  });

  describe('normalizeOneFrameAnnotations', () => {
    it('should normalize one frame annotation', () => {
      const duration = 1000;
      const result = annotationsHelper.normalizeOneFrameAnnotations(
        annotations,
        duration,
        1000,
      );
      expect(result[5].duration).toBe(6);
    });
  });

  describe('mapToTimelineEvent', () => {
    it('should set given eventType', () => {
      const eventType = 'test';
      const annotation = annotations[4];
      const res = mapToTimelineEvent(annotation, eventType);
      const expected = {
        id: annotation.id,
        eventType,
        title: annotation.label.name,
        timestamp: annotation.timestamp,
        duration: annotation.duration,
      };
      expect(res).toEqual(expected);
    });
    it('should set category as eventType', () => {
      const annotation = annotations[0];
      const res = mapToTimelineEvent(annotation);
      const expected = {
        id: annotation.id,
        eventType: annotation.category,
        title: annotation.description,
        timestamp: annotation.timestamp,
        duration: annotation.duration,
      };
      expect(res).toEqual(expected);
    });
  });

  describe('getEventType', () => {
    describe('phase', () => {
      it('should return category', () => {
        const category = 'phase';
        const result = getEventType({
          category,
          timestamp: 0,
          duration: 1000,
          isOneShot: false,
          videoId: 2,
        });
        expect(result).toBe(category);
      });
    });

    describe('svg', () => {
      it('should return category', () => {
        // no description
        const result = getEventType(annotations[4]);
        expect(result).toBe(annotations[4].category);
      });
      it('should return label name', () => {
        const result = getEventType(annotations[5]);
        expect(result).toBe(annotations[5].label.name);
      });
    });
  });

  describe('mapEventTypesWithColor', () => {
    const labels: AnnotationLabel[] = [
      {
        name: 'sdsdf',
        color: '#5811b3',
        type: 'structure',
      },
      {
        name: 'erdtgg',
        color: '#b31111',
        type: 'structure',
      },
    ];

    it('should not change the color', () => {
      const events = [
        {
          id: 440,
          eventType: 'phase',
          title: 'phase',
          timestamp: 78451,
          duration: 2091,
        },
      ];
      const result = mapEventTypesWithColor(events, labels);
      const expected = buildEventTypes(events);
      expect(result).toEqual(expected);
    });

    it('should change the color', () => {
      const events = [
        {
          id: 438,
          eventType: 'erdtgg',
          title: 'erdtgg',
          timestamp: 143253,
          duration: 38798,
        },
        {
          id: 439,
          eventType: 'sdsdf',
          title: 'sdsdf',
          timestamp: 96166,
          duration: 20891,
        },
        {
          id: 440,
          eventType: 'phase',
          title: 'phase',
          timestamp: 78451,
          duration: 2091,
        },
      ];
      const result = mapEventTypesWithColor(events, labels);
      const built = buildEventTypes(events);
      expect(result).not.toEqual(built);
      expect(
        result.find((eventType) => eventType.type === events[0].eventType)
          .color,
      ).toBe(labels[1].color);
      expect(
        result.find((eventType) => eventType.type === events[1].eventType)
          .color,
      ).toBe(labels[0].color);
    });
  });

  describe('getAnnotationsToSelect', () => {
    it('should return an empty array (no selected ids)', () => {
      const lastSelectedId = null;
      const a = [];
      const selected = [];
      const result = getAnnotationsToSelect(lastSelectedId, selected, a);
      const expected = [];
      expect(result).toEqual(expected);
    });

    it('should return selected annotations (last selected not found)', () => {
      const lastSelectedId = 111;
      const a = [annotations[5]];
      const selected = [110];
      const result = getAnnotationsToSelect(lastSelectedId, selected, a);
      expect(result).toEqual(selected);
    });

    it('should unselect annotations', () => {
      const annotation: Annotation = {
        id: 1,
        shape: {
          positions: {
            0: {
              x: 2,
              y: 9,
              width: 32,
              height: 26,
            },
          },
        },
        category: 'svg',
        label: {
          name: 'test',
          color: '#b31111',
          type: 'structure',
        },
        duration: 1000,
        timestamp: 0,
        isOneShot: false,
        videoId: 1,
        labelName: 'test',
      };
      const a = [
        annotation,
        {
          ...annotation,
          id: 2,
        },
        {
          ...annotation,
          id: 3,
        },
      ];
      const lastSelectedId = 3;
      const selected = [1, 2, 3];
      const result = getAnnotationsToSelect(lastSelectedId, selected, a);
      const expected = [];
      expect(result).toEqual(expected);
    });

    it('should return annotations to select', () => {
      const annotation: Annotation = {
        id: 1,
        shape: {
          positions: {
            0: {
              x: 2,
              y: 9,
              width: 32,
              height: 26,
            },
          },
        },
        category: 'svg',
        label: {
          name: 'test',
          color: '#b31111',
          type: 'structure',
        },
        duration: 1000,
        timestamp: 0,
        isOneShot: false,
        videoId: 1,
        labelName: 'test',
      };
      const a = [
        annotation,
        {
          ...annotation,
          id: 2,
        },
        {
          ...annotation,
          id: 3,
        },
      ];
      const lastSelectedId = 2;
      const selected = [1, 2];
      const result = getAnnotationsToSelect(lastSelectedId, selected, a);
      const expected = [1, 2, 3];
      expect(result).toEqual(expected);
    });
  });
});
