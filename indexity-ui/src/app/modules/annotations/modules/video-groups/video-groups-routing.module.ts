import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { VideoGroupsIndexViewComponent } from '@app/annotations/modules/video-groups/containers/video-groups-index-view/video-groups-index-view.component';
import { VideoGroupsEditViewComponent } from '@app/annotations/modules/video-groups/containers/video-groups-edit-view/video-groups-edit-view.component';
import { EmptyListComponent } from '@app/annotations/modules/video-groups/components/empty-list/empty-list.component';
import { GroupVideosListViewComponent } from '@app/annotations/modules/video-groups/containers/group-videos-list-view/group-videos-list-view.component';
import { GroupEditGuard } from '@app/annotations/modules/video-groups/guards/group-edit.guard';
import { VideoGroupUsersEditViewComponent } from '@app/video-groups/containers/video-group-users-edit-view/video-group-users-edit-view.component';

const ROUTES: Route[] = [
  {
    path: '',
    component: VideoGroupsIndexViewComponent,
    children: [
      {
        path: '',
        component: EmptyListComponent,
      },
      {
        path: ':groupId',
        component: GroupVideosListViewComponent,
      },
    ],
  },
  {
    path: ':groupId/edit',
    component: VideoGroupsEditViewComponent,
    canActivate: [GroupEditGuard],
  },
  {
    path: ':groupId/users',
    component: VideoGroupUsersEditViewComponent,
    canActivate: [GroupEditGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class VideoGroupsRoutingModule {}
