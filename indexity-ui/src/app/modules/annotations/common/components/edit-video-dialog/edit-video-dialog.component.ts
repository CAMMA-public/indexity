import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Video } from '@app/videos/models/video.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-edit-video-dialog',
  templateUrl: './edit-video-dialog.component.html',
  styleUrls: ['./edit-video-dialog.component.sass'],
})
export class EditVideoDialogComponent implements OnInit {
  video: Video;

  nameControl = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Video) {
    this.video = { ...data };
  }

  ngOnInit(): void {
    // set form default value
    this.nameControl = new FormControl(this.video.name);
  }
}
