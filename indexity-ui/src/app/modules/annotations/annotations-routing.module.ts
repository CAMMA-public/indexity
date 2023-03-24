import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AnnotationsViewLayoutComponent } from '@app/annotations/annotations-view-layout.component';

const ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'videos',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AnnotationsViewLayoutComponent,
    children: [
      {
        path: 'videos/groups',
        loadChildren: () =>
          import('./modules/video-groups/video-groups.module').then(
            (m) => m.VideoGroupsModule,
          ),
      },
      {
        path: 'videos',
        loadChildren: () =>
          import('./modules/videos/videos.module').then((m) => m.VideosModule),
      },
      {
        path: 'ontology',
        loadChildren: () =>
          import('./modules/ontology/ontology.module').then(
            (m) => m.OntologyModule,
          ),
      },
      {
        path: 'documentation',
        loadChildren: () =>
          import('./modules/documentation/documentation.module').then(
            (m) => m.DocumentationModule,
          ),
      },

      // add more app sub categories here
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class AnnotationsRoutingModule {}
