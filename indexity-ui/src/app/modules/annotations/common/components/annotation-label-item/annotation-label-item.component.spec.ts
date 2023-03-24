import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationLabelItemComponent } from './annotation-label-item.component';

describe('AnnotationLabelItemComponent', () => {
  let component: AnnotationLabelItemComponent;
  let fixture: ComponentFixture<AnnotationLabelItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnnotationLabelItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationLabelItemComponent);
    component = fixture.componentInstance;
    component.label = {
      color: 'red',
      name: 'dfd',
      type: 'structure',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
