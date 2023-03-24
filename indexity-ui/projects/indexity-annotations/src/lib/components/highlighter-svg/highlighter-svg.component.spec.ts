import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialCustomModule } from '../../modules/material-custom.module';
import { HighlighterSvgComponent } from './highlighter-svg.component';
import { annotations } from '../../mocks/mock-annotations-service';
import { DrawingMode, Mode, NormalMode } from '../../models/mode';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Annotation } from '../../models/annotation.model';
import { AnnotationShape } from '../../models/annotation-shape.model';
import { getHeightInPixels, getWidthInPixels } from '@indexity/annotations';
import { AnnotationLabel } from '../../models/annotation-label.model';

@Component({
  template: `
    <surg-highlighter-svg
      [svgOverlay]="svgOverlay"
      [currentMode]="mode"
      [activateLabels]="activateLabels"
      [shape]="shape"
      [currentTime]="videoTime"
      [tmpSvgAnnotation]="tmpAnnotation"
      [labels]="labels"
      [videoDuration]="videoDuration"
      [videoId]="videoId"
      (setShape)="onSetShape($event)"
      (setMode)="onSetMode($event)"
      (setTmp)="onSetTmpAnnotation($event)"
      (update)="onUpdateAnnotation($event)"
      (seekBackward)="onSeekBackward()"
      (seekForward)="onSeekForward()"
    ></surg-highlighter-svg>
  `,
})
class HostTestComponent {
  svgOverlay = {
    top: 0,
    left: 0,
    width: 100,
    height: 200,
  };
  mode = NormalMode;
  shape = {
    width: 10,
    height: 10,
    posX: 50,
    posY: 50,
  };
  annotations = annotations;
  tmpAnnotation = null;
  labels = [
    {
      name: 'test',
      color: '',
    },
  ];
  activateLabels = true;
  videoTime = 0;
  videoDuration = 100;
  videoId = 4;

  onSeekForward(): void {
    // Do nothing.
  }
  onSeekBackward(): void {
    // Do nothing.
  }
  onUpdateAnnotation(annotation: Partial<Annotation>): void {
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

describe('HighlighterSvgComponent', () => {
  let directive: HighlighterSvgComponent;
  let component: HostTestComponent;
  let fixture: ComponentFixture<HostTestComponent>;
  let directiveEl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HighlighterSvgComponent, HostTestComponent],
      imports: [MaterialCustomModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostTestComponent);
    component = fixture.componentInstance;
    directiveEl = fixture.debugElement.query(
      By.directive(HighlighterSvgComponent),
    );
    directive = directiveEl.injector.get(HighlighterSvgComponent);
    directive.drawnShape = {
      width: 10,
      height: 10,
      posX: 50,
      posY: 50,
      color: '',
      name: '',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    describe('currentMode', () => {
      it('should set the cursor to crosshair', () => {
        expect(directive.cursor).toBe(NormalMode.cursor);
        component.mode = DrawingMode;
        fixture.detectChanges();
        expect(directive.cursor).toEqual(DrawingMode.cursor);
      });

      it('should set the cursor to default', () => {
        component.mode = NormalMode;
        fixture.detectChanges();
        expect(directive.cursor).toEqual(NormalMode.cursor);
      });
    });
  });

  describe('createAnnotation', () => {
    const shape = {
      positions: {
        0: {
          x: 10,
          y: 10,
          width: 15,
          height: 15,
        },
        1: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
        },
      },
    };

    const label: AnnotationLabel = {
      name: 'test',
      color: '#b31111',
      type: 'structure',
    };

    const expected = {
      shape,
      videoId: 4,
      label,
      duration: 0,
      timestamp: 10,
    };

    it('should call setShape.emit', () => {
      spyOn(directive.setShape, 'emit');
      directive.createAnnotation(shape, label);
      expect(directive.setShape.emit).toHaveBeenCalledWith(shape);
    });

    it('should call setTmp.emit', () => {
      spyOn(directive.setTmp, 'emit');
      directive.createAnnotation(shape, label);
      expect(directive.setTmp.emit).toHaveBeenCalled();
    });

    it('should set duration to video duration - current time', () => {
      component.videoTime = 10;
      fixture.detectChanges();
      spyOn(directive.setTmp, 'emit');
      directive.createAnnotation(shape, label);
      expect(directive.setTmp.emit).toHaveBeenCalledWith(
        jasmine.objectContaining(expected),
      );
    });

    it('should set description to test', () => {
      component.videoTime = 10;
      fixture.detectChanges();
      spyOn(directive.setTmp, 'emit');
      directive.createAnnotation(shape, label);
      expect(directive.setTmp.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          ...expected,
          label,
        }),
      );
    });
  });

  describe('onContextMenu', () => {
    it('should return false', () => {
      expect(directive.onContextMenu()).toBeFalsy();
    });
  });

  describe('move', () => {
    beforeEach(() => {
      directive.drawnShape = {
        width: 10,
        height: 10,
        posX: 50,
        posY: 50,
        color: '',
        name: '',
      };
    });

    it('should move the shape to the left', () => {
      directive.moveLeft();
      expect(directive.drawnShape.posX).toEqual(49);
    });

    it('should move the shape to the right', () => {
      directive.moveRight();
      expect(directive.drawnShape.posX).toEqual(51);
    });

    it('should move the shape up', () => {
      directive.moveUp();
      expect(directive.drawnShape.posY).toEqual(49);
    });

    it('should move the shape down', () => {
      directive.moveDown();
      expect(directive.drawnShape.posY).toEqual(51);
    });
  });

  describe('getCursor', () => {
    beforeEach(() => {
      directive.drawnShape = {
        width: 20,
        height: 20,
        posX: 50,
        posY: 50,
        color: '',
        name: '',
      };
    });

    it('should return the current mode cursor', () => {
      expect(directive.getCursor(3, null)).toBe(NormalMode.cursor);
      expect(directive.getCursor(null, null)).toBe(NormalMode.cursor);
      expect(directive.getCursor(null, 3)).toBe(NormalMode.cursor);
      expect(directive.getCursor(40, 40)).toBe(NormalMode.cursor);
    });

    it('should return the n-resize cursor', () => {
      expect(directive.getCursor(60, 50)).toBe('n-resize');
    });

    it('should return the nw-resize cursor', () => {
      expect(directive.getCursor(50, 50)).toBe('nw-resize');
    });

    it('should return the ne-resize cursor', () => {
      expect(directive.getCursor(70, 50)).toBe('ne-resize');
    });

    it('should return the s-resize cursor', () => {
      expect(directive.getCursor(60, 70)).toBe('s-resize');
    });

    it('should return the sw-resize cursor', () => {
      expect(directive.getCursor(50, 70)).toBe('sw-resize');
    });

    it('should return the se-resize cursor', () => {
      expect(directive.getCursor(70, 70)).toBe('se-resize');
    });

    it('should return the w-resize cursor', () => {
      expect(directive.getCursor(50, 60)).toBe('w-resize');
    });

    it('should return the e-resize cursor', () => {
      expect(directive.getCursor(70, 60)).toBe('e-resize');
    });

    it('should return the move cursor', () => {
      expect(directive.getCursor(60, 60)).toBe('move');
    });
  });

  describe('updateDrawnShape', () => {
    beforeEach(() => {
      directive.drawnShape = {
        width: 20,
        height: 20,
        posX: 50,
        posY: 50,
        color: '',
        name: '',
      };
    });

    it('should move the shape to the right', () => {
      directive.cursor = 'move';
      directive.firstMousePositionX = 10;
      directive.firstMousePositionY = 0;
      directive.updateDrawnShape(70, 50);
      const expected = {
        ...directive.drawnShape,
        posX: 60,
      };
      expect(directive.drawnShape).toEqual(expected);
    });

    // it('should reduce the shape height', () => {
    //   directive.cursor = 'n-resize';
    //   directive.updateDrawnShape(60, 60);
    //   const expected = {
    //     ...directive.drawnShape,
    //     posX: 60,
    //     height: 10
    //   };
    //   expect(directive.drawnShape).toEqual(expected);
    // });

    // it('should increase the shape height', () => {
    //   directive.cursor = 'n-resize';
    //   // directive.updateDrawnShape(70, 50);
    //   // const expected = {
    //   //   ...directive.drawnShape,
    //   //   posX: 60
    //   // };
    //   // expect(directive.drawnShape).toEqual(expected);
    // });
  });

  describe('onKeyDown', () => {
    it('should call seekForward', () => {
      spyOn(directive.seekForward, 'emit');
      directive.onKeyDown({
        ctrlkey: false,
        key: 'ArrowRight',
      });
      fixture.detectChanges();
      expect(directive.seekForward.emit).toHaveBeenCalled();
    });
  });

  describe('getPositionAtCurrentTime', () => {
    it('should return the position', () => {
      const timestamp = 1000;
      directive.currentTime = timestamp;
      fixture.detectChanges();
      const rectangle = annotations[4].shape;
      const positionInRatio = rectangle.positions[timestamp];
      const expected = {
        x: getWidthInPixels(positionInRatio.x, directive.svgOverlay.width),
        y: getHeightInPixels(positionInRatio.y, directive.svgOverlay.height),
        width: getWidthInPixels(
          positionInRatio.width,
          directive.svgOverlay.width,
        ),
        height: getHeightInPixels(
          positionInRatio.height,
          directive.svgOverlay.height,
        ),
      };
      const result = directive.getPositionAtCurrentTime(rectangle);
      expect(result).toEqual(expected);
    });
  });
});
