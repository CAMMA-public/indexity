import { createAction, props } from '@ngrx/store';

export const openSideNav = createAction('[UI] Open SideNav');

export const closeSideNav = createAction('[UI] Close SideNav');

export const toggleSideNav = createAction('[UI] Toggle SideNav');

export const setTitle = createAction(
  '[UI] Set title',
  props<{ payload: { title: string } }>(),
);

export const resetTitle = createAction('[UI] Reset title');
