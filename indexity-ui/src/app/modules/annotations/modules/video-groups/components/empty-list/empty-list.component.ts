import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-group-video-list',
  styles: [
    `
      :host {
        flex: 7;
        margin: 8px;
        display: flex;
      }
    `,
  ],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyListComponent {}
