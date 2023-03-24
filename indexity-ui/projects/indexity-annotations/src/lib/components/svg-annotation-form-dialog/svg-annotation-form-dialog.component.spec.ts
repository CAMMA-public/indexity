import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialCustomModule } from '../../modules/material-custom.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgAnnotationFormDialogComponent } from '@indexity/annotations';
import { MatDialogRef } from '@angular/material/dialog';
import { ColorPickerModule } from 'ngx-color-picker';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('SvgAnnotationFormDialogComponent', () => {
  let component: SvgAnnotationFormDialogComponent;
  let fixture: ComponentFixture<SvgAnnotationFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SvgAnnotationFormDialogComponent],
      imports: [
        MaterialCustomModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        FormsModule,
        ColorPickerModule,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgAnnotationFormDialogComponent);
    component = fixture.componentInstance;
    component.data = {
      labels$: of([
        {
          name: 'test',
          color: 'color',
          type: 'structure',
        },
        {
          name: 'test2',
          color: 'color2',
          type: 'structure',
        },
      ]),
      currentLabel: {
        name: 'test',
        color: 'color',
        type: 'structure',
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('color', () => {
    it('should initialize the color', () => {
      expect(component.color).toEqual('color');
    });
  });

  describe('onLabelSelect', () => {
    it('should change the color on label select', () => {
      const value = {
        name: 'test2',
        color: 'color2',
      };
      const option = {
        source: {
          value,
        },
      };
      component.onLabelSelect(option);
      expect(component.color).toBe(value.color);
    });
  });

  describe('closeDialog', () => {
    it('should close the dialog with current label data', () => {
      spyOn(component, 'closeDialog');
      const el = fixture.debugElement.query(By.css('form'));
      el.triggerEventHandler('submit', null);
      expect(component.closeDialog).toHaveBeenCalledWith(
        component.data.currentLabel,
      );
    });
  });
});
