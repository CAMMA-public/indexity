import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '@ngrx/store';

export const toPayload = () => <T>(source: Observable<T>) =>
  source.pipe(map((data) => ({ payload: data })));

export const extractPayload = () => <T>(
  source: Observable<Action & { payload: T }>,
) => source.pipe(map((action) => action.payload));

export const setState = <T>(update: Partial<T>, state: T): T => ({
  ...state,
  ...update,
});
