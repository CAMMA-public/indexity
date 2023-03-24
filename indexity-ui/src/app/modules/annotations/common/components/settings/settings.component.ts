import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Settings } from '@app/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
    `
      mat-slide-toggle {
        display: block;
        width: 100%;
        margin-bottom: 15px;
      }
      form {
        padding: 15px;
      }
    `,
  ],
})
export class SettingsComponent {
  settings: Settings;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Settings) {
    this.settings = { ...data };
  }
}
