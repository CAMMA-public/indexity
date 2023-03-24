import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { VideosIndexViewComponent } from '@app/annotations/modules/videos/containers/videos-index-view/videos-index-view.component';
import { VideoAnnotationsViewComponent } from '@app/annotations/modules/videos/containers/video-annotations-view/video-annotations-view.component';

const ROUTES: Route[] = [
  { path: '', component: VideosIndexViewComponent },
  { path: ':videoId', component: VideoAnnotationsViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class VideosRoutingModule {}
