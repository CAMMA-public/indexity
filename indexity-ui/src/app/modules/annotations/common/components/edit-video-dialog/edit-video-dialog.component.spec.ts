import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromVideos from '@app/videos-store';
import { ROOT_REDUCERS } from '@app/main-store';
import { MaterialCustomModule } from '@app/modules';
import { EditVideoDialogComponent } from './edit-video-dialog.component';

describe('EditVideoDialogComponent', () => {
  let component: EditVideoDialogComponent;
  let fixture: ComponentFixture<EditVideoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialCustomModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
        NoopAnimationsModule,
      ],
      declarations: [EditVideoDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            id: 4,
            name: 'Video',
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
