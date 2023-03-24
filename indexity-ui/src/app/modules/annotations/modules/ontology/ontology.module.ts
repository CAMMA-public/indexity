import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyIndexViewComponent } from './containers/ontology-index-view/ontology-index-view.component';
import { OntologyEditViewComponent } from './containers/ontology-edit-view/ontology-edit-view.component';
import { LabelListViewComponent } from './containers/label-list-view/label-list-view.component';
import { OntologyRoutingModule } from '@app/annotations/modules/ontology/ontology-routing.module';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { OntologyItemComponent } from './components/ontology-item/ontology-item.component';
import { LabelItemComponent } from './components/label-item/label-item.component';
import { OntologyEditGuard } from '@app/annotations/modules/ontology/guards/ontology-edit.guard';

@NgModule({
  declarations: [
    OntologyIndexViewComponent,
    OntologyEditViewComponent,
    LabelListViewComponent,
    OntologyItemComponent,
    LabelItemComponent,
  ],
  imports: [CommonModule, OntologyRoutingModule, AnnotationsSharedModule],
  providers: [
    OntologyEditGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
})
export class OntologyModule {}
