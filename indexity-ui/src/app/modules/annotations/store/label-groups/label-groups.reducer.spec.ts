import {
  reducer,
  INIT_STATE,
  State,
  selectFilteredGroups,
  selectFilteredGroupLabels,
} from './label-groups.reducer';
import {
  addLabelsToGroupSuccess,
  createLabelGroup,
  createLabelGroupFailure,
  createLabelGroupSuccess,
  loadAllLabelGroups,
  loadAllLabelGroupsFailure,
  loadAllLabelGroupsSuccess,
  loadOneLabelGroup,
  loadOneLabelGroupFailure,
  loadOneLabelGroupSuccess,
  removeOneLabelGroup,
  removeOneLabelGroupFailure,
  removeOneLabelGroupSuccess,
  searchGroupLabels,
  searchLabelGroups,
  updateLabelGroup,
  updateLabelGroupFailure,
  updateLabelGroupSuccess,
} from '@app/annotations/store/label-groups/label-groups.actions';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';

describe('Label groups reducer', () => {
  let state: State;
  const resetState = (): void => {
    state = reducer(INIT_STATE, { type: 'NOOP' });
  };

  const groupsSample: AnnotationLabelGroup[] = [
    {
      name: 'name1',
      id: 1,
      userId: 1,
      labels: [],
      labelIds: [],
    },
    {
      name: 'name2',
      id: 2,
      userId: 1,
      labels: [],
      labelIds: [],
    },
  ];

  const labelsSample: AnnotationLabel[] = [
    {
      name: 'label1',
      color: '#33333',
      type: 'structure',
    },
    {
      name: 'label2',
      color: '#33333',
      type: 'structure',
    },
  ];

  beforeEach(() => resetState());

  it('should set is loading to true', () => {
    const actionSet = [
      loadAllLabelGroups,
      createLabelGroup,
      updateLabelGroup,
      loadOneLabelGroup,
      removeOneLabelGroup,
    ];

    actionSet.map((a) => {
      state = reducer(state, a({ payload: {} as any }));
      expect(state.isLoading).toEqual(true);
      resetState();
      expect(state.isLoading).toEqual(false);
    });
  });

  it('should set is loading to false', () => {
    const actionSet = [
      loadAllLabelGroupsSuccess,
      loadAllLabelGroupsFailure,
      createLabelGroupSuccess,
      createLabelGroupFailure,
      updateLabelGroupFailure,
      updateLabelGroupSuccess,
      loadOneLabelGroupFailure,
      loadOneLabelGroupSuccess,
      removeOneLabelGroupSuccess,
      removeOneLabelGroupFailure,
    ];

    state = reducer({ ...state, isLoading: true }, { type: 'NOOP' });
    expect(state.isLoading).toEqual(true);

    actionSet.map((a) => {
      state = reducer(state, a({ payload: [] as any }));
      expect(state.isLoading).toEqual(false);
      state = reducer({ ...state, isLoading: true }, { type: 'NOOP' });
      expect(state.isLoading).toEqual(true);
    });
  });

  it('should load all labels groups', () => {
    const action = loadAllLabelGroupsSuccess({ payload: groupsSample });
    state = reducer(state, action);
    expect(Object.values(state.entities)).toEqual(groupsSample);
  });

  describe('State read/write', () => {
    beforeEach(() => {
      const action = loadAllLabelGroupsSuccess({ payload: groupsSample });
      state = reducer(state, action);
    });

    it('should add labels to the group', () => {
      const group = state.entities[1];
      const action = addLabelsToGroupSuccess({
        payload: {
          ...group,
          labelIds: [...labelsSample.map((l) => l.name)],
          labels: [...labelsSample],
        },
      });

      state = reducer(state, action);

      expect(state.entities[group.id].labels.length).toEqual(
        labelsSample.length,
      );
      expect(state.entities[group.id].labelIds.length).toEqual(
        labelsSample.length,
      );
      expect(state.entities[group.id].labels).toEqual(labelsSample);
    });

    it('should upsert one', () => {
      const group: AnnotationLabelGroup = {
        name: 'name3',
        id: 3,
        userId: 1,
        labels: [],
        labelIds: [],
      };

      const action = loadOneLabelGroupSuccess({ payload: group });

      expect(state.entities[3]).toBeUndefined();
      state = reducer(state, action);
      expect(state.entities[3]).toEqual(group);
    });

    it('should create one', () => {
      const group: AnnotationLabelGroup = {
        name: 'name3',
        id: 3,
        userId: 1,
        labels: [],
        labelIds: [],
      };

      const action = createLabelGroupSuccess({ payload: group });

      expect(state.entities[3]).toBeUndefined();
      state = reducer(state, action);
      expect(state.entities[3]).toEqual(group);
    });

    it('should update one', () => {
      const newName = 'some new name';
      const group: AnnotationLabelGroup = {
        ...groupsSample[0],
        name: newName,
      };

      const action = updateLabelGroupSuccess({ payload: group });
      expect(state.entities[group.id].name).toEqual('name1');
      state = reducer(state, action);
      expect(state.entities[group.id].name).toEqual(newName);
    });

    it('should remove one', () => {
      const groupId = groupsSample[0].id;
      const action = removeOneLabelGroupSuccess({
        payload: { id: groupId } as any,
      });
      expect(state.entities[groupId]).toBeDefined();
      state = reducer(state, action);
      expect(state.entities[groupId]).toBeUndefined();
    });

    describe('Selectors', () => {
      it('should filter Label Groups', () => {
        const q = 'name1';

        const action = searchLabelGroups({ payload: q });
        state = reducer(state, action);
        expect(
          selectFilteredGroups(
            state.groupsFilter,
            Object.values(state.entities),
          ).length,
        ).toEqual(1);
        expect(
          selectFilteredGroups(null, Object.values(state.entities)).length,
        ).toEqual(2);
      });

      it('should filter group labels', () => {
        const group = state.entities[1];
        const addLabelsAction = addLabelsToGroupSuccess({
          payload: {
            ...group,
            labelIds: [...labelsSample.map((l) => l.name)],
            labels: [...labelsSample],
          },
        });

        state = reducer(state, addLabelsAction);

        const action = searchGroupLabels({ payload: 'label1' });

        state = reducer(state, action);

        expect(
          selectFilteredGroupLabels(
            state.groupLabelsFilter,
            state.entities[group.id],
          ).length,
        ).toEqual(1);
        expect(
          selectFilteredGroupLabels(null, state.entities[group.id]).length,
        ).toEqual(2);
      });
    });
  });
});
