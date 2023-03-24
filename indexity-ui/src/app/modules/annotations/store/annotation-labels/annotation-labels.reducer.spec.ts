import * as fromAnnotationLabels from './annotation-labels.reducer';
import {
  fetchAllForVideoSuccess,
  fetchLabelSuccess,
  removeLabelSuccess,
  searchSuccess,
  updateLabelSuccess,
} from './annotation-labels.actions';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

describe('Annotation labels reducers', () => {
  const labels: AnnotationLabel[] = [
    {
      name: 'label1',
      color: 'red',
      type: 'structure',
    },
    {
      color: 'blue',
      name: 'label2',
      type: 'structure',
    },
    {
      color: 'blue',
      name: 'label3',
      type: 'structure',
    },
  ];

  const searchResults: AnnotationLabel[] = [
    {
      color: 'cyan',
      name: 'label 89',
      type: 'structure',
    },
    {
      color: 'RebeccaPurple',
      name: 'label 99',
      type: 'structure',
    },
  ];

  let state: fromAnnotationLabels.State;

  beforeEach(() => {
    state = fromAnnotationLabels.initialState;
  });

  describe('Actions', () => {
    it('should populate annotation labels', () => {
      const action = fetchAllForVideoSuccess({ payload: labels });
      const newState = fromAnnotationLabels.reducer(state, action);
      expect(newState.ids.length).toEqual(labels.length);
      expect(newState.ids).toEqual(labels.map((l) => l.name));
      expect(fromAnnotationLabels.getAllLabels(newState)).toEqual(labels);
    });

    it('should add label', () => {
      const label = labels[0];
      const action = fetchLabelSuccess({ payload: label });
      const newState = fromAnnotationLabels.reducer(state, action);
      expect(newState.ids.length).toEqual(1);
      expect(newState.entities[label.name]).toBeDefined();
      expect(newState.entities[label.name]).toEqual(label);
    });

    it('should update label color', () => {
      const action = fetchAllForVideoSuccess({ payload: labels });
      state = fromAnnotationLabels.reducer(state, action);
      const label = state.entities[labels[0].name];
      label.color = 'purple';

      const updateAction = updateLabelSuccess({ payload: label });
      const newState = fromAnnotationLabels.reducer(state, updateAction);
      expect(newState.entities[label.name].color).toEqual('purple');
    });

    it('should populate search results', () => {
      const action = searchSuccess({ payload: searchResults });
      const newState = fromAnnotationLabels.reducer(state, action);
      expect(newState.searchResults).toEqual(searchResults);
    });

    it('should remove label', () => {
      const label = labels[0];
      const action = fetchAllForVideoSuccess({ payload: labels });
      state = fromAnnotationLabels.reducer(state, action);

      const removeAction = removeLabelSuccess({ payload: label.name });

      const newState = fromAnnotationLabels.reducer(state, removeAction);

      const removedLabel = fromAnnotationLabels
        .getAllLabels(newState)
        .find((l) => l.name === label.name);

      expect(removedLabel).toBeFalsy();
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      const populateAction = fetchAllForVideoSuccess({ payload: labels });
      state = fromAnnotationLabels.reducer(state, populateAction);

      const searchAction = searchSuccess({ payload: searchResults });
      state = fromAnnotationLabels.reducer(state, searchAction);
    });

    it('should select all labels', () => {
      const res = fromAnnotationLabels.getAllLabels(state);
      expect(res).toEqual(labels);
    });

    it('should select label by id', () => {
      const label = labels[0];
      const res = fromAnnotationLabels.getLabelByName(label.name)(state);
      expect(res).toEqual(label);
    });

    it('should select search results', () => {
      const res = fromAnnotationLabels.getSearchResults(state);
      expect(res).toEqual(searchResults);
    });
  });
});
