import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelListViewComponent } from './label-list-view.component';
import { SearchFieldComponent } from '@app/annotations/components/search-field/search-field.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { LabelItemComponent } from '@app/annotations/modules/ontology/components/label-item/label-item.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { reducers } from '@app/annotations/store/label-groups/store.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { LabelGroupsEffects } from '@app/annotations/store/label-groups/label-groups.effects';
import { EffectsModule } from '@ngrx/effects';
import { AnnotationLabelGroupsService } from '@app/annotations/services/annotation-label-groups.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../../test-constants';

describe('LabelListViewComponent', () => {
  let component: LabelListViewComponent;
  let fixture: ComponentFixture<LabelListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LabelListViewComponent,
        SearchFieldComponent,
        LabelItemComponent,
      ],
      imports: [
        PerfectScrollbarModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('labelGroups', reducers),
        EffectsModule.forRoot([]),
        MatIconModule,
        HttpClientTestingModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        UiFacade,
        LabelGroupsFacade,
        LabelGroupsEffects,
        AnnotationLabelGroupsService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
