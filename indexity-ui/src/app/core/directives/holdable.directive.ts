import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[holdable]',
})
export class HoldableDirective {
  @Output() progress: EventEmitter<number> = new EventEmitter();
  @Output() confirm = new EventEmitter();
  @Input() holdTime = 1000;

  state: Subject<string> = new Subject();

  cancel: Observable<string>;

  constructor() {
    this.cancel = this.state.pipe(
      filter((v) => v === 'cancel'),
      tap(() => this.progress.emit(0)),
    );
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  onExit(): void {
    this.state.next('cancel');
  }

  @HostListener('mousedown')
  @HostListener('touchstart')
  onHold(): void {
    this.state.next('start');

    const n = 100;

    interval(n)
      .pipe(
        takeUntil(this.cancel),
        takeUntil(this.confirm),
        tap((v) => {
          this.progress.emit((v * 100) / this.holdTime);
          if (v * n >= this.holdTime) {
            this.confirm.emit();
          }
        }),
      )
      .subscribe();
  }

  @HostListener('contextmenu')
  onContextMenu(): boolean {
    return false;
  }
}
