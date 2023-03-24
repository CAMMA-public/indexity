import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-video-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.sass'],
})
export class InfoDialogComponent {
  title: string;
  message: string;
  askUser: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      askUser: boolean;
    },
  ) {
    this.title = data.title;
    this.message = data.message.replace(/(?:\r\n|\r|\n)/g, '<br>');
    this.askUser = data.askUser;
  }
}
