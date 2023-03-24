import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { VideoGroupsPage } from './video-groups.page';
import { SharedModule } from '../common/modules/shared.module';

const routes: Routes = [
  {
    path: '',
    component: VideoGroupsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [VideoGroupsPage],
})
export class VideoGroupsPageModule {}
