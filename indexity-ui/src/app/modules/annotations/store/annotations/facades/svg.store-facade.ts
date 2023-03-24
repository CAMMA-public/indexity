import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as svgQuery from '../reducers/svg.reducer';
import * as fromRoot from '../index';
import { AnnotationShape } from '@app/annotations/common/models/annotation-shape.model';
import { clear, setMode, setOverlay, setShape } from '../actions/svg.actions';
import { Mode } from '@app/annotations/modules/videos/models/mode';

@Injectable()
export class SvgStoreFacade {
  mode$ = this.store.pipe(select(fromRoot.getMode));

  shape$ = this.store.pipe(select(fromRoot.getShape));

  overlay$ = this.store.pipe(select(fromRoot.getSvgOverlay));

  constructor(private store: Store<svgQuery.State>) {}

  setMode(mode: Mode): void {
    this.store.dispatch(setMode({ payload: mode }));
  }

  setShape(shape?: AnnotationShape): void {
    this.store.dispatch(setShape({ payload: shape }));
  }

  setOverlay(overlay: {
    top: number;
    left: number;
    width: number;
    height: number;
  }): void {
    this.store.dispatch(setOverlay({ payload: overlay }));
  }

  clear(): void {
    this.store.dispatch(clear());
  }
}
