import { SvgAnnotationToolbarComponent } from './svg-annotation-toolbar.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialCustomModule } from '../../modules/material-custom.module';
import { Component } from '@angular/core';
import {
  DrawingMode,
  EditMode,
  Mode,
  NormalMode,
  CreationMode,
} from '../../models/mode';
import { By } from '@angular/platform-browser';
import { annotations } from '../../mocks/mock-annotations-service';
import { cutAnnotation } from '@indexity/annotations';
import { AnnotationShape } from '../../models/annotation-shape.model';
import { Annotation } from '../../models/annotation.model';
import { ANNOTATION_MIN_DURATION } from '../../../../../../src/app/constants';

@Component({
  template: `
    <surg-svg-annotation-toolbar
      [tmpSvgAnnotation]="tmpAnnotation"
      [mode]="mode"
      [shape]="shape"
      [videoTime]="videoTime"
      (setMode)="onSetMode($event)"
      (setTmpAnnotation)="onSetTmpAnnotation($event)"
      (setShape)="onSetShape($event)"
      (createAnnotation)="onCreateAnnotation($event)"
      (updateAnnotation)="onUpdateAnnotation($event)"
    ></surg-svg-annotation-toolbar>
  `,
})
class HostTestComponent {
  mode = NormalMode;
  tmpAnnotation = null;
  videoTime = 0;
  shape: AnnotationShape = {
    positions: {
      1000: {
        x: 10,
        y: 10,
        width: 10,
        height: 10,
      },
    },
  };

  onUpdateAnnotation(annotation: Annotation): void {
    // Do nothing.
  }
  onCreateAnnotation(annotation: Annotation): void {
    // Do nothing.
  }
  onDeleteAnnotation(id: number): void {
    // Do nothing.
  }
  onSetTmpAnnotation(annotation: Annotation): void {
    // Do nothing.
  }
  onSetMode(mode: Mode): void {
    // Do nothing.
  }
  onSetShape(shape: AnnotationShape): void {
    // Do nothing.
  }
}

describe('SvgAnnotationToolbarComponent', () => {
  let directiveEl;
  let component: HostTestComponent;
  let directive: SvgAnnotationToolbarComponent;
  let fixture: ComponentFixture<HostTestComponent>;

  const annotation = annotations.find((a) => a.category === 'svg');
  const temporalAnnotation = annotations.find((a) => a.category === 'phase');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SvgAnnotationToolbarComponent, HostTestComponent],
      imports: [MaterialCustomModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostTestComponent);
    component = fixture.componentInstance;
    directiveEl = fixture.debugElement.query(
      By.directive(SvgAnnotationToolbarComponent),
    );
    directive = directiveEl.injector.get(SvgAnnotationToolbarComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('ngOnChanges', () => {
    it('should set annotationEdited to true', () => {
      component.mode = EditMode;
      fixture.detectChanges();
      expect(directive.annotationEdited).toBeFalsy();
      component.shape = {
        positions: {
          1000: {
            x: 20,
            y: 10,
            width: 10,
            height: 10,
          },
        },
      };
      fixture.detectChanges();
      expect(directive.annotationEdited).toBeTruthy();
    });

    it('should set toggle value to draw', () => {
      expect(directive.toggle.value).toBeFalsy();
      component.mode = DrawingMode;
      fixture.detectChanges();
      expect(directive.toggle.value).toEqual(DrawingMode.name);
    });

    it('should set toggle value to edit', () => {
      expect(directive.toggle.value).toBeFalsy();
      component.mode = EditMode;
      fixture.detectChanges();
      expect(directive.toggle.value).toEqual(EditMode.name);
    });

    it('should reset toggle value', () => {
      component.mode = EditMode;
      fixture.detectChanges();
      expect(directive.toggle.value).toEqual(EditMode.name);

      component.mode = NormalMode;
      fixture.detectChanges();
      expect(directive.toggle.value).toBeFalsy();
    });
  });

  describe('activateDrawingMode', () => {
    it('should call setMode.emit', () => {
      spyOn(directive.setMode, 'emit');
      directive.activateDrawingMode();
      expect(directive.setMode.emit).toHaveBeenCalledWith(DrawingMode);
    });

    it('should change toggle value', () => {
      expect(directive.toggle.value).toBeFalsy();
      directive.activateDrawingMode();
      expect(directive.toggle.value).toBe(DrawingMode.name);
    });
  });

  describe('activateEditMode', () => {
    it('should call setMode.emit', () => {
      spyOn(directive.setMode, 'emit');
      directive.activateEditMode();
      expect(directive.setMode.emit).toHaveBeenCalledWith(EditMode);
    });

    it('should change toggle value', () => {
      expect(directive.toggle.value).toBeFalsy();
      directive.activateEditMode();
      expect(directive.toggle.value).toBe(EditMode.name);
    });
  });

  describe('cancelSvgMode', () => {
    beforeEach(() => {
      directive.tmpSvgAnnotation = annotation;
      directive.mode = DrawingMode;
      directive.toggle.value = DrawingMode.name;
      fixture.detectChanges();
    });

    it('should call setMode.emit', () => {
      spyOn(directive.setMode, 'emit');
      directive.cancelSvgMode();
      expect(directive.setMode.emit).toHaveBeenCalledWith(NormalMode);
    });

    it('should reset toggle value', () => {
      expect(directive.toggle.value).toBe(DrawingMode.name);
      directive.cancelSvgMode();
      expect(directive.toggle.value).toBeFalsy();
    });
  });

  describe('deactivateSvgMode', () => {
    it('should call setMode.emit', () => {
      spyOn(directive.setMode, 'emit');
      directive.deactivateSvgMode();
      expect(directive.setMode.emit).toHaveBeenCalledWith(NormalMode);
    });

    describe('After CreateMode', () => {
      beforeEach(() => {
        directive.tmpSvgAnnotation = temporalAnnotation;
        directive.mode = CreationMode;
        directive.toggle.value = CreationMode.name;
        directive.shape = annotation.shape;
        fixture.detectChanges();
      });

      it('should compute the temporal annotation duration when validating', () => {
        directive.videoTime = 5000;
        directive.tmpSvgAnnotation.timestamp = 1000;
        const expected = {
          ...temporalAnnotation,
          timestamp: 1000,
          duration: 4000,
        };
        spyOn(directive.createAnnotation, 'emit');
        directive.deactivateSvgMode();
        expect(directive.createAnnotation.emit).toHaveBeenCalledWith(expected);
      });
    });

    describe('After DrawingMode', () => {
      beforeEach(() => {
        directive.tmpSvgAnnotation = annotation;
        directive.mode = DrawingMode;
        directive.videoTime = 5000;
        directive.toggle.value = DrawingMode.name;
        directive.shape = annotation.shape;
        fixture.detectChanges();
      });

      it('should create annotation', () => {
        const expected = {
          ...annotation,
          duration: 5000,
        };
        spyOn(directive.createAnnotation, 'emit');
        directive.deactivateSvgMode();
        expect(directive.createAnnotation.emit).toHaveBeenCalledWith(expected);
      });

      it('should create annotation with min duration (low timestamp)', () => {
        directive.videoTime = 10;
        const expected = {
          ...annotation,
          duration: Math.round(ANNOTATION_MIN_DURATION),
        };
        spyOn(directive.createAnnotation, 'emit');
        directive.deactivateSvgMode();
        expect(directive.createAnnotation.emit).toHaveBeenCalledWith(expected);
      });
    });

    describe('After EditMode', () => {
      const shape = {
        ...annotation.shape,
        positions: {
          ...annotation.shape.positions,
          1000: {
            x: 30,
            y: 20,
            width: 20,
            height: 20,
          },
        },
      };
      beforeEach(() => {
        directive.tmpSvgAnnotation = annotation;
        directive.mode = EditMode;
        directive.toggle.value = EditMode.name;
        directive.shape = shape;
        directive.videoTime = 5000;
        fixture.detectChanges();
      });

      it('should update annotation', () => {
        const expected = {
          ...annotation,
          shape,
        };
        directive.annotationEdited = true;
        spyOn(directive.updateAnnotation, 'emit');
        directive.deactivateSvgMode();
        expect(directive.updateAnnotation.emit).toHaveBeenCalledWith(expected);
      });

      it('should update annotation shape', () => {
        const oneShotAnnotation = {
          ...annotation,
          isOneShot: true,
          duration: 33,
        };
        const expected = {
          id: oneShotAnnotation.id,
          videoId: oneShotAnnotation.videoId,
          shape,
        };
        directive.annotationEdited = true;
        directive.tmpSvgAnnotation = oneShotAnnotation;
        spyOn(directive.updateAnnotation, 'emit');
        directive.deactivateSvgMode();
        expect(directive.updateAnnotation.emit).toHaveBeenCalledWith(expected);
      });
    });
  });

  describe('cutAnnotation', () => {
    const shape = {
      ...annotation.shape,
      positions: {
        ...annotation.shape.positions,
        1000: {
          x: 30,
          y: 20,
          width: 20,
          height: 20,
        },
      },
    };
    beforeEach(() => {
      directive.tmpSvgAnnotation = annotation;
      directive.mode = EditMode;
      directive.toggle.value = EditMode.name;
      directive.shape = shape;
      directive.videoTime = 1000;
      fixture.detectChanges();
    });

    it('should update annotation duration', () => {
      const expected = {
        id: annotation.id,
        shape: annotation.shape,
        videoId: annotation.videoId,
        duration: 1000,
      };
      spyOn(directive.updateAnnotation, 'emit');
      directive.cutAnnotation();
      expect(directive.updateAnnotation.emit).toHaveBeenCalledWith(expected);
    });

    it('should create a new annotation', () => {
      const expected = cutAnnotation(annotation, 1000)[1];
      spyOn(directive.createAnnotation, 'emit');
      directive.cutAnnotation();
      expect(directive.createAnnotation.emit).toHaveBeenCalledWith(expected);
    });
  });

  describe('onKeyDown', () => {
    beforeEach(() => {
      directive.tmpSvgAnnotation = annotation;
      fixture.detectChanges();
    });

    it('should call cancelSvgMode', () => {
      spyOn(directive, 'cancelSvgMode');
      directive.onKeyDown({ key: 'Escape' });
      expect(directive.cancelSvgMode).toHaveBeenCalled();
    });

    it('should call deactivateSvgMode', () => {
      spyOn(directive, 'deactivateSvgMode');
      directive.onKeyDown({ key: 'Enter' });
      expect(directive.deactivateSvgMode).toHaveBeenCalled();
    });
  });
});
