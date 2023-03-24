import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationItemComponent } from './annotation-item.component';
import { FormatMsPipe } from '@app/annotations/modules/videos/pipes/minutes-seconds.pipe';
import { StoreModule } from '@ngrx/store';
import * as fromVideos from '@app/videos-store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as fromAnnotationLabels from '@app/annotation-labels-store';
import { ROOT_REDUCERS } from '@app/main-store';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialCustomModule } from '@app/modules';
import { HoldableDirective } from '@app/directives/holdable.directive';

describe('AnnotationItemComponent', () => {
  let component: AnnotationItemComponent;
  let fixture: ComponentFixture<AnnotationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialCustomModule,
        ReactiveFormsModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        StoreModule.forFeature(
          'annotationLabels',
          fromAnnotationLabels.reducers,
        ),
        EffectsModule.forRoot([]),
        HttpClientTestingModule,
      ],
      declarations: [FormatMsPipe, AnnotationItemComponent, HoldableDirective],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
