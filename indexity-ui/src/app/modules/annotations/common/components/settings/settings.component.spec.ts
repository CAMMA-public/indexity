import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromVideos from '@app/videos-store';
import { ROOT_REDUCERS } from '@app/main-store';
import { SettingsComponent } from '@app/annotations/components/settings/settings.component';
import { MaterialCustomModule } from '@app/modules';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialCustomModule,
        FormsModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
        NoopAnimationsModule,
      ],
      declarations: [SettingsComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            activateJsonExport: true,
            showLabels: true,
            activateJsonImport: true,
            frameStep: 15,
          },
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
