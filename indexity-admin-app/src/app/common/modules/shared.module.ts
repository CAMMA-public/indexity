import { NgModule } from '@angular/core';

import { UserDetailsComponent } from '../components/user-details/user-details.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DateAgoPipe } from '../pipes/time-ago.pipe';
import { VideoListComponent } from '../components/video-list/video-list.component';
import { SearchComponent } from '../components/search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GroupListComponent } from '../components/group-list/group-list.component';
import { UserListComponent } from '../components/user-list/user-list.component';

const components = [
  UserDetailsComponent,
  VideoListComponent,
  SearchComponent,
  GroupListComponent,
  UserListComponent,
  DateAgoPipe,
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [IonicModule, ...components],
  declarations: [...components],
  providers: [],
})
export class SharedModule {}
