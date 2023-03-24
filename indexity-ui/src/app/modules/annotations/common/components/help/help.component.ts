import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent {
  @Output() openDocumentation = new EventEmitter();

  dataSource = [
    { shortcut: 'space', description: 'play/pause video' },
    { shortcut: 'C', description: 'create temporal annotation' },
    { shortcut: 'D', description: 'draw spatial annotation' },
    { shortcut: 'E', description: 'edit annotation' },
    { shortcut: 'ENTER', description: 'validate annotation' },
    { shortcut: 'ESC', description: 'cancel annotation' },
    { shortcut: 'CTRL + arrows', description: 'move the drawn annotation' },
    { shortcut: 'ALT + J', description: 'duplicate last svg annotation' },
    { shortcut: 'ALT + O', description: 'speed down' },
    { shortcut: 'ALT + P', description: 'speed up' },
    { shortcut: 'arrows', description: 'seek the video frame by frame' },
    {
      shortcut: 'annotation double click',
      description: 'update annotation label',
    },
    {
      shortcut: 'CTRL click on annotation (timeline)',
      description: 'select multiple',
    },
    {
      shortcut: 'CTRL + A',
      description: 'select all annotations from the last selected label',
    },
  ];

  constructor(public dialogRef: MatDialogRef<HelpComponent>) {}
}
