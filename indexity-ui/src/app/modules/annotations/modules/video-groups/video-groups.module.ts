import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoGroupsRoutingModule } from '@app/annotations/modules/video-groups/video-groups-routing.module';
import { VideoGroupsIndexViewComponent } from '@app/annotations/modules/video-groups/containers/video-groups-index-view/video-groups-index-view.component';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { VideoGroupItemComponent } from '@app/annotations/modules/video-groups/components/video-group-item/video-group-item.component';
import { VideoGroupsEditViewComponent } from '@app/annotations/modules/video-groups/containers/video-groups-edit-view/video-groups-edit-view.component';
import { VideoGroupToolbarComponent } from '@app/annotations/modules/video-groups/components/video-group-toolbar/video-group-toolbar.component';
import { AutosizeModule } from 'ngx-autosize';
import { EmptyListComponent } from '@app/annotations/modules/video-groups/components/empty-list/empty-list.component';
import { GroupVideosListViewComponent } from './containers/group-videos-list-view/group-videos-list-view.component';
import { GroupEditGuard } from '@app/annotations/modules/video-groups/guards/group-edit.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { VideosModule } from '@app/videos/videos.module';
import { VideoGroupUsersEditViewComponent } from './containers/video-group-users-edit-view/video-group-users-edit-view.component';
import { UserItemComponent } from './components/user-item/user-item.component';

@NgModule({
  declarations: [
    VideoGroupsIndexViewComponent,
    VideoGroupItemComponent,
    VideoGroupsEditViewComponent,
    VideoGroupUsersEditViewComponent,
    UserItemComponent,
    VideoGroupToolbarComponent,
    GroupVideosListViewComponent,
    EmptyListComponent,
  ],
  imports: [
    CommonModule,
    AutosizeModule,
    AnnotationsSharedModule,
    VideoGroupsRoutingModule,
    VideosModule,
  ],
  providers: [
    VideoGroupsStoreFacade,
    GroupEditGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
})
export class VideoGroupsModule {}
