import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-veil',
  template: `<div class="main-container"></div>`,
  styles: [
    `
      .main-container {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.6);
        z-index: 199;
      }
    `,
  ],
})
export class LoadingVeilComponent {}
