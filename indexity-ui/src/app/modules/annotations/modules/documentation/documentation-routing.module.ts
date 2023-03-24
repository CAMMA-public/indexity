import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DocumentationIndexViewComponent } from '@app/annotations/modules/documentation/containers/documentation-index-view/documentation-index-view.component';

const ROUTES: Route[] = [
  {
    path: '',
    component: DocumentationIndexViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DocumentationRoutingModule {}
