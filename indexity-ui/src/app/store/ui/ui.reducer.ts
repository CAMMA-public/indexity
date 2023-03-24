import { createReducer, on } from '@ngrx/store';
import {
  closeSideNav,
  openSideNav,
  resetTitle,
  setTitle,
  toggleSideNav,
} from '@app/main-store/ui/ui.actions';
import { setState } from '@app/helpers/ngrx.helpers';

export interface State {
  isSideNavOpen: boolean;
  title: string;
}

export const initialState: State = {
  isSideNavOpen: false,
  title: 'Indexity',
};

export const reducer = createReducer<State>(
  initialState,
  on(openSideNav, (state) =>
    setState(
      {
        isSideNavOpen: true,
      },
      state,
    ),
  ),
  on(closeSideNav, (state) =>
    setState(
      {
        isSideNavOpen: false,
      },
      state,
    ),
  ),
  on(toggleSideNav, (state) =>
    setState(
      {
        isSideNavOpen: !state.isSideNavOpen,
      },
      state,
    ),
  ),
  on(setTitle, (state, { payload: { title } }) =>
    setState(
      {
        title: `Indexity - ${title}`,
      },
      state,
    ),
  ),
  on(resetTitle, (state) =>
    setState(
      {
        title: initialState.title,
      },
      state,
    ),
  ),
);

export const isSideNavOpen = (state: State): boolean => state.isSideNavOpen;
export const getTitle = (state: State): string => state.title;
