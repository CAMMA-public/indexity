import * as fromAnnotations from './annotations.reducer';
import {
  reducer,
  initialState as ANNOTATIONS_INIT_STATE,
} from './annotations.reducer';
import * as fromAnnotationLabels from '../../annotation-labels';
import * as fromAnnotationsRoot from '../index';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import {
  annotationCreated,
  annotationRemoved,
  annotationUpdated,
  clear,
  loadAllSuccess,
  setTmpAnnotation,
} from '@app/annotations/store/annotations/actions/annotation.actions';

import {
  annotationsLabelAdapter,
  initialState as ANNOTATION_LABELS_INIT_STATE,
} from '@app/annotations/store/annotation-labels/annotation-labels.reducer';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

describe('Annotation Reducer', () => {
  let populatedState: fromAnnotations.State;
  let populatedLabelsState: fromAnnotationLabels.State;
  let populatedGlobalState;

  let annotations: Annotation[];

  beforeEach(() => {
    const shape = {
      positions: {
        100: {
          x: 14,
          y: 22,
          width: 10,
          height: 10,
        },
      },
    };
    annotations = [
      {
        videoId: 1,
        category: 'svg',
        timestamp: 5200,
        duration: 1000,
        id: 2,
        description: 'test',
        label: {
          name: 'label',
          color: '#b31111',
          type: 'structure',
        },
        labelName: 'label',
        shape,
        isOneShot: false,
      },
      {
        videoId: 1,
        category: 'svg',
        description: 'comment',
        timestamp: 30585,
        duration: 10000,
        id: 3,
        label: {
          name: 'label',
          color: '#b31111',
          type: 'structure',
        },
        labelName: 'label',
        isOneShot: false,
      },
      {
        videoId: 1,
        category: 'svg',
        description: 'comment',
        timestamp: 30585,
        duration: 10000,
        id: 4,
        labelName: 'label2',
        label: {
          name: 'label2',
          color: '#b31112',
          type: 'structure',
        },
        isOneShot: false,
      },
    ];
    const labels: AnnotationLabel[] = [
      {
        name: 'label',
        color: '#b31111',
        type: 'structure',
      },
      {
        name: 'label2',
        color: '#b31112',
        type: 'structure',
      },
    ];

    populatedState = fromAnnotations.annotationsAdapter.setAll(
      annotations,
      ANNOTATIONS_INIT_STATE,
    );

    populatedLabelsState = {
      annotationLabels: annotationsLabelAdapter.setAll(
        labels,
        ANNOTATION_LABELS_INIT_STATE,
      ),
    };
    populatedGlobalState = {
      annotations: {
        annotations: populatedState,
      },
      annotationLabels: populatedLabelsState,
    };
  });

  it('should set init state when action is unknown', () => {
    const action = {} as any;
    const res = fromAnnotations.reducer(undefined, action);
    expect(res).toBe(fromAnnotations.initialState);
  });

  it('should populate entities from the array', () => {
    const action = loadAllSuccess({ payload: annotations });
    const state = reducer(ANNOTATIONS_INIT_STATE, action);
    expect(Object.values(state.entities)).toEqual(annotations);
  });

  it('should delete an annotation', () => {
    const action = annotationRemoved({ payload: 3 });
    const state = reducer(populatedState, action);
    Object.values(state.entities).map((a) => expect(a.id === 3).toBeFalsy());
  });

  it('should update an annotation', () => {
    const changes = {
      id: 3,
      description: 'update',
    };

    const action = annotationUpdated({ payload: changes });
    const state = reducer(populatedState, action);
    expect(state.entities[changes.id].description).toEqual('update');
  });

  it('should delete an annotation and reset the tmp annotation', () => {
    const action = annotationRemoved({ payload: 3 });
    populatedState.tmpNewAnnotation = annotations[1];
    const state = reducer(populatedState, action);
    Object.values(state.entities).map((a) => expect(a.id === 3).toBeFalsy());
  });

  it('should clear the state', () => {
    const action = clear();
    const state = reducer(populatedState, action);
    expect(state).toEqual(ANNOTATIONS_INIT_STATE);
  });

  it('should set the tmp annotation', () => {
    const action = setTmpAnnotation({ payload: annotations[1] });
    const state = reducer(populatedState, action);
    expect(state.tmpNewAnnotation).toEqual(annotations[1]);

    const resetAction = setTmpAnnotation({});
    const state2 = reducer(state, resetAction);
    expect(state2.tmpNewAnnotation).toEqual(
      ANNOTATIONS_INIT_STATE.tmpNewAnnotation,
    );
  });

  it('add annotation', () => {
    const annotation: Annotation = {
      id: 5,
      videoId: 1,
      category: 'svg',
      timestamp: 476,
      duration: 5,
      label: {
        name: 'label',
        color: '#b31111',
        type: 'structure',
      },
      shape: {
        positions: {
          476: {
            x: 26.566159250585482,
            y: 23.75,
            width: 28.455308352849336,
            height: 21.25,
          },
          479: {
            x: 35.77576112412178,
            y: 32.083333333333336,
            width: 28.455308352849336,
            height: 21.25,
          },
        },
      },
      isOneShot: false,
    };

    const action = annotationCreated({ payload: annotation });
    const state = reducer(populatedState, action);
    expect(state.entities[5]).toBeTruthy();
    expect(state.entities[5]).toEqual(annotation);
  });

  describe('selectors', () => {
    it('getAll', () => {
      expect(
        fromAnnotations.annotationsAdapter
          .getSelectors()
          .selectAll(populatedState),
      ).toEqual(annotations);
      expect(
        fromAnnotations.annotationsAdapter
          .getSelectors()
          .selectTotal(populatedState),
      ).toEqual(annotations.length);
    });

    it('getTmpAnnotation', () => {
      expect(fromAnnotations.getTmpAnnotation(populatedState)).toBe(
        populatedState.tmpNewAnnotation,
      );
    });

    it('should get annotations by label', () => {
      const res = fromAnnotationsRoot.getAnnotationsByLabel({ name: 'label' })(
        populatedGlobalState,
      );
      res.map((a) => expect(a.label.name).toEqual('label'));
    });

    it('should count annotations by label', () => {
      const res = fromAnnotationsRoot.countAnnotationsByLabel({
        name: 'label',
      })(populatedGlobalState);
      expect(res).toEqual(2);
    });
  });
});
