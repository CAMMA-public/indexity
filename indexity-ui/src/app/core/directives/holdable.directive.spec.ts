import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HoldableDirective } from './holdable.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button
      holdable
      [holdTime]="700"
      (confirm)="onConfirm()"
      (progress)="onHoldProgress($event)"
    ></button>
  `,
})
class DirectiveTestComponent {
  onConfirm(): void {
    // Do nothing.
  }

  onHoldProgress(e: number): void {
    // Do nothing.
  }
}

describe('HoldableDirective', () => {
  let fixture: ComponentFixture<DirectiveTestComponent>;
  let component: DirectiveTestComponent;
  let directiveEl;
  let directive;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HoldableDirective, DirectiveTestComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DirectiveTestComponent);
    component = fixture.componentInstance;
    directiveEl = fixture.debugElement.query(By.directive(HoldableDirective));
    directive = directiveEl.injector.get(HoldableDirective);
  }));

  it('should run a directive', async(() => {
    expect(component).toBeTruthy();
    expect(directive).toBeTruthy();
  }));

  describe('state', () => {
    it('should set state to cancel', () => {
      spyOn(directive.state, 'next');
      directiveEl.triggerEventHandler('mouseleave');
      expect(directive.state.next).toHaveBeenCalledWith('cancel');
    });

    it('should set state to start', () => {
      spyOn(directive.state, 'next');
      directiveEl.triggerEventHandler('mousedown');
      expect(directive.state.next).toHaveBeenCalledWith('start');
    });
  });
});
