import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationIndexViewComponent } from '@app/annotations/modules/documentation/containers/documentation-index-view/documentation-index-view.component';
import { DocumentationRoutingModule } from '@app/annotations/modules/documentation/documentation-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [DocumentationIndexViewComponent],
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    MatIconModule,
    MatMenuModule,
  ],
  providers: [],
})
export class DocumentationModule {}
