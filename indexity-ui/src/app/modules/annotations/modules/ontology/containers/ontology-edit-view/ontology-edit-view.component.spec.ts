import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyEditViewComponent } from './ontology-edit-view.component';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { reducers } from '@app/annotations/store/label-groups/store.reducer';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { AnnotationLabelGroupsService } from '@app/annotations/services/annotation-label-groups.service';
import { LabelItemComponent } from '@app/annotations/modules/ontology/components/label-item/label-item.component';
import { AnnotationLabelsStoreFacade } from '@app/annotation-labels-store/annotation-labels-store-facade.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InfoMessageService } from '@app/services/info-message.service';

describe('OntologyEditViewComponent', () => {
  let component: OntologyEditViewComponent;
  let fixture: ComponentFixture<OntologyEditViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OntologyEditViewComponent, LabelItemComponent],
      imports: [
        AnnotationsSharedModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        PerfectScrollbarModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('labelGroups', reducers),
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        LabelGroupsFacade,
        AnnotationLabelGroupsService,
        AnnotationLabelsStoreFacade,
        InfoMessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyEditViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
