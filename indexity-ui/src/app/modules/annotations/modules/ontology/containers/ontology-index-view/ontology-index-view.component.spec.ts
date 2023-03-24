import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyIndexViewComponent } from './ontology-index-view.component';
import { AnnotationsSharedModule } from '@app/annotations/common/modules/annotations-shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { reducers } from '@app/annotations/store/label-groups/store.reducer';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { AnnotationLabelGroupsService } from '@app/annotations/services/annotation-label-groups.service';
import { OntologyItemComponent } from '@app/annotations/modules/ontology/components/ontology-item/ontology-item.component';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfoMessageService } from '@app/services/info-message.service';

describe('OntologyIndexViewComponent', () => {
  let component: OntologyIndexViewComponent;
  let fixture: ComponentFixture<OntologyIndexViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OntologyIndexViewComponent, OntologyItemComponent],
      imports: [
        AnnotationsSharedModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('labelGroups', reducers),
      ],
      providers: [
        LabelGroupsFacade,
        UiFacade,
        AnnotationLabelGroupsService,
        FormsModule,
        ReactiveFormsModule,
        InfoMessageService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyIndexViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
