import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyItemComponent } from './ontology-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

describe('LabelGroupItemComponent', () => {
  let component: OntologyItemComponent;
  let fixture: ComponentFixture<OntologyItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OntologyItemComponent],
      imports: [
        RouterTestingModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
