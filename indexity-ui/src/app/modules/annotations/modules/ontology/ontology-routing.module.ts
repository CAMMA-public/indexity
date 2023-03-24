import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { OntologyIndexViewComponent } from '@app/annotations/modules/ontology/containers/ontology-index-view/ontology-index-view.component';
import { LabelListViewComponent } from '@app/annotations/modules/ontology/containers/label-list-view/label-list-view.component';
import { OntologyEditViewComponent } from '@app/annotations/modules/ontology/containers/ontology-edit-view/ontology-edit-view.component';
import { OntologyEditGuard } from '@app/annotations/modules/ontology/guards/ontology-edit.guard';

const ROUTES: Route[] = [
  {
    path: '',
    component: OntologyIndexViewComponent,
    children: [
      {
        path: ':groupId',
        component: LabelListViewComponent,
      },
    ],
  },
  {
    path: ':groupId/edit',
    component: OntologyEditViewComponent,
    canActivate: [OntologyEditGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class OntologyRoutingModule {}
