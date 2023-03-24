import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getTitle, isSideNavOpen, State } from '@app/main-store';
import {
  closeSideNav,
  openSideNav,
  resetTitle,
  setTitle,
  toggleSideNav,
} from '@app/main-store/ui/ui.actions';

@Injectable()
export class UiFacade {
  isNavBarOpen$ = this.store.pipe(select(isSideNavOpen));

  title$ = this.store.pipe(select(getTitle));

  constructor(private store: Store<State>) {}

  openSideNav(): void {
    this.store.dispatch(openSideNav());
  }

  closeSideNav(): void {
    this.store.dispatch(closeSideNav());
  }

  toggleSideNav(): void {
    this.store.dispatch(toggleSideNav());
  }

  setTitle(title: string): void {
    this.store.dispatch(setTitle({ payload: { title } }));
  }

  resetTitle(): void {
    this.store.dispatch(resetTitle());
  }
}
