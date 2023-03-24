import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormComponent } from '../../core/components/login-form/login-form.component';
import { SignupFormComponent } from '../../core/components/signup-form/signup-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromRoot from '@app/main-store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingVeilComponent } from '../../core/components/loading-veil/loading-veil.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HomeComponent } from '@app/views';
import { InfoMessageService } from '@app/services/info-message.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../test-constants';
import { HttpClientModule } from '@angular/common/http';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        CommonModule,
        FormsModule,
        RouterTestingModule,
        MatDialogModule,
        ReactiveFormsModule,
        StoreModule.forRoot(fromRoot.ROOT_REDUCERS),
        HttpClientModule,
      ],
      providers: [
        InfoMessageService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
      declarations: [
        LoadingVeilComponent,
        HomeComponent,
        LoginFormComponent,
        SignupFormComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
