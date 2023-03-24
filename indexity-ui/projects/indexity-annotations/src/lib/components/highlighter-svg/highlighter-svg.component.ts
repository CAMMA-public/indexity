import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { cloneDeep, clamp } from 'lodash';
import { DrawingMode, EditMode, Mode, NormalMode } from '../../models/mode';
import * as annotationsHelper from '../../helpers/annotations.helper';
import { SvgAnnotationFormDialogComponent } from '../svg-annotation-form-dialog/svg-annotation-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationLabel } from '../../models/annotation-label.model';
import { Annotation } from '../../models/annotation.model';
import { AnnotationShape } from '../../models/annotation-shape.model';
import { BehaviorSubject } from 'rxjs';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';

@Component({
  selector: 'surg-highlighter-svg',
  templateUrl: './highlighter-svg.component.html',
  styles: [
    `
      svg {
        position: fixed;
        z-index: 100;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlighterSvgComponent implements OnChanges {
  @Input() activateLabels = true;
  @Input() currentMode: Mode = NormalMode;
  @Input() hovered: number = null;
  // To setup the svg position on top of the video
  @Input() svgOverlay = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  };
  @Input() shape: AnnotationShape = {
    positions: {},
  };

  // Video
  @Input() currentTime = 0;
  @Input() videoDuration = 0;
  @Input() videoId = null;

  // Annotations
  @Input() hiddenAnnotations: number[] = [];
  @Input() displayedShapes: Array<Annotation> = [];
  @Input() tmpSvgAnnotation: Annotation;
  @Input() annotationToUpdate: Annotation;
  @Input() labels: Array<AnnotationLabel> = [];
  @Input() showLabels = true;
  @Input() labelDeletion = false;
  @Input() suggestedLabelGroup: AnnotationLabelGroup;

  @Output() setShape = new EventEmitter<AnnotationShape>();
  @Output() setTmp = new EventEmitter<Annotation>();
  @Output() setMode = new EventEmitter<Mode>();
  @Output() update = new EventEmitter<Partial<Annotation>>();
  @Output() seekForward = new EventEmitter<void>();
  @Output() seekBackward = new EventEmitter<void>();
  @Output() searchQuery = new EventEmitter<string>();
  @Output() hover = new EventEmitter<number>();
  @Output() deleteAnnotationLabel = new EventEmitter<string>();
  @Output() isDialogOpen = new EventEmitter<boolean>();

  firstMousePositionX: number;
  firstMousePositionY: number;

  // flags to signal in which state we are
  rectangleMoving = false;
  rectangleDrawing = false;
  // flag to signal if the cursor is out of the svg area
  svgLeave = false;

  cursor = 'default';

  initShape = {
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
    color: '#b31111',
    name: '',
  };
  drawnShape: {
    width: number;
    height: number;
    posX: number;
    posY: number;
    color: string;
    name: string;
  } = {
    ...this.initShape,
  };
  lastAnnotation: Annotation;
  structureDisplayedShapes: Array<Annotation> = [];

  searchResults$ = new BehaviorSubject<AnnotationLabel[]>([]);

  /**
   * Track annotations by id
   */
  annotationsTrackBy = (index, annotation): any => annotation.id;

  /**
   * @ignore
   */
  constructor(public dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.currentTime || changes.tmpSvgAnnotation) &&
      this.tmpSvgAnnotation &&
      this.currentMode === EditMode
    ) {
      if (!annotationsHelper.isAt(this.currentTime)(this.tmpSvgAnnotation)) {
        const annotation = this.displayedShapes.find(
          (a) => a.id === this.tmpSvgAnnotation.id,
        );
        if (annotation) {
          this.update.emit(annotation);
        }
      } else if (!this.rectangleMoving) {
        this.setDrawnShapePositionAtCurrentTime();
      }
    } else if (
      changes.tmpSvgAnnotation &&
      this.currentMode === DrawingMode &&
      this.tmpSvgAnnotation
    ) {
      this.setDrawnShapePositionAtCurrentTime();
    }

    if (changes.annotationToUpdate && this.annotationToUpdate) {
      this.setShape.emit(this.annotationToUpdate.shape);
      this.setTmp.emit(this.annotationToUpdate);
      this.drawnShape = {
        ...this.drawnShape,
        ...this.annotationToUpdate.label,
      };
    }

    if (
      changes.currentMode &&
      changes.currentMode.currentValue !== changes.currentMode.previousValue
    ) {
      this.cursor = this.currentMode.cursor;
      if (changes.currentMode.previousValue !== NormalMode) {
        this.drawnShape = {
          ...this.initShape,
        };
        this.setShape.emit();
        this.setTmp.emit();
      }
    }
    if (
      changes.svgOverlay &&
      changes.svgOverlay.previousValue !== changes.svgOverlay.currentValue
    ) {
      this.resizeRectangle();
    }
    if (changes.displayedShapes && this.displayedShapes) {
      this.structureDisplayedShapes = this.displayedShapes.filter(
        (a) => a.label.type === 'structure',
      );
    }

    if (changes.labels && this.labels) {
      this.searchResults$.next(changes.labels.currentValue);
    }
    if (changes.shape && (!this.shape || !this.shape.positions)) {
      this.shape = {
        positions: {},
      };
    }
  }

  isDrawnShapeVisible(): boolean {
    if (this.currentMode === DrawingMode) {
      return true;
    } else if (this.currentMode === EditMode && this.tmpSvgAnnotation) {
      return annotationsHelper.isAt(this.currentTime)(this.tmpSvgAnnotation);
    } else {
      return false;
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): boolean {
    if (this.rectangleDrawing) {
      this.svgLeave = true;
      // If we are drawing, we stop all actions and send the mouseup signal.
      this.onMouseUp();
    }
    return false; // Call preventDefault() on the event
  }

  /**
   * Sets drawn shape position at tmp annotation position at current time
   */
  setDrawnShapePositionAtCurrentTime(): void {
    const annotationWithCurrentChanges = cloneDeep(this.tmpSvgAnnotation);
    annotationWithCurrentChanges.shape.positions = {
      ...annotationWithCurrentChanges.shape.positions,
      ...this.shape.positions,
    };
    const currentPosition = this.getPositionAtCurrentTime(
      annotationWithCurrentChanges.shape,
    );
    this.drawnShape = {
      ...this.drawnShape,
      height: currentPosition.height,
      width: currentPosition.width,
      posX: currentPosition.x,
      posY: currentPosition.y,
    };
  }

  @HostListener('mouseenter')
  onMouseEnter(): boolean {
    if (this.rectangleDrawing) {
      this.svgLeave = false;
    }
    return false; // Call preventDefault() on the event
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMousedown(event): boolean {
    const x = event.touches
      ? event.touches[0].clientX - this.svgOverlay.left
      : event.clientX - this.svgOverlay.left;
    const y = event.touches
      ? event.touches[0].clientY - this.svgOverlay.top
      : event.clientY - this.svgOverlay.top;
    if (!this.rectangleDrawing && this.tmpSvgAnnotation) {
      // Move the rectangle
      this.rectangleMoving = true;
      // Register where the position of the mouse was on the rectangle
      this.firstMousePositionX = x - this.drawnShape.posX;
      this.firstMousePositionY = y - this.drawnShape.posY;
    } else if (
      this.currentMode === DrawingMode &&
      (event.button === 0 || event.touches)
    ) {
      // Draw a 'new' rectangle
      this.rectangleDrawing = true;
      // Set x and y starting positions for the rectangle
      this.drawnShape = {
        ...this.drawnShape,
        posX: x,
        posY: y,
      };
      this.firstMousePositionX = x;
      this.firstMousePositionY = y;
    }
    return false; // Call preventDefault() on the event
  }

  @HostListener('mousemove', ['$event'])
  @HostListener('touchmove', ['$event'])
  onMouseMove(event): boolean {
    const x = event.touches
      ? event.touches[0].clientX - this.svgOverlay.left
      : event.clientX - this.svgOverlay.left;
    const y = event.touches
      ? event.touches[0].clientY - this.svgOverlay.top
      : event.clientY - this.svgOverlay.top;
    if (this.svgLeave) {
      // If the mouse leave the SVG area, we don't want to do anything here.
      return false;
    }
    let posX = 0;
    let posY = 0;
    if (this.rectangleDrawing) {
      // Draw a 'new' rectangle
      if (this.firstMousePositionX <= x && this.firstMousePositionY <= y) {
        posY = this.firstMousePositionY;
        posX = this.firstMousePositionX;
      } else if (
        this.firstMousePositionX <= x &&
        this.firstMousePositionY > y
      ) {
        posY = y;
        posX = this.firstMousePositionX;
      } else if (
        this.firstMousePositionX > x &&
        this.firstMousePositionY <= y
      ) {
        posX = x;
        posY = this.firstMousePositionY;
      } else {
        posY = y;
        posX = x;
      }
      this.drawnShape = {
        ...this.drawnShape,
        posX,
        posY,
        width: Math.abs(this.firstMousePositionX - x),
        height: Math.abs(this.firstMousePositionY - y),
      };
    } else if (this.rectangleMoving) {
      this.updateDrawnShape(x, y, event.touches);

      // We update the list of positions in relation with stream time
      this.updatePositions();
    } else {
      this.cursor = this.getCursor(x, y);
    }
    return false; // Call preventDefault() on the event
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event): void {
    if (
      event.ctrlKey &&
      (this.currentMode === DrawingMode || this.currentMode === EditMode) &&
      this.tmpSvgAnnotation
    ) {
      this.cursor = 'move';
      // CTRL + LEFT ARROW
      if (event.key === 'ArrowLeft') {
        this.moveLeft();
      } else if (event.key === 'ArrowUp') {
        // CTRL + UP ARROW
        this.moveUp();
      } else if (event.key === 'ArrowRight') {
        // CTRL + RIGHT ARROW
        this.moveRight();
      } else if (event.key === 'ArrowDown') {
        // CTRL + DOWN ARROW
        this.moveDown();
      }
    } else if (event.key === 'ArrowLeft') {
      // LEFT ARROW
      this.seekBackward.emit();
    } else if (event.key === 'ArrowRight') {
      // RIGHT ARROW
      this.seekForward.emit();
    }
    // ALT + J
    if (event.altKey && event.code === 'KeyJ' && this.lastAnnotation) {
      this.setMode.emit(DrawingMode);
      const lastPositionTimestamp = Object.keys(
        this.lastAnnotation.shape.positions,
      )
        .sort((a, b) => {
          if (+a > +b) {
            return 1;
          }
          if (+a < +b) {
            return -1;
          }
          return 0;
        })
        .pop();
      const newShape = {
        ...this.lastAnnotation.shape,
        positions: {},
      };
      newShape.positions[
        this.currentTime
      ] = this.lastAnnotation.shape.positions[lastPositionTimestamp];

      this.createAnnotation(newShape, this.lastAnnotation.label);
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event): void {
    if (
      (this.currentMode === DrawingMode || this.currentMode === EditMode) &&
      this.tmpSvgAnnotation
    ) {
      if (event.ctrlKey && event.key.startsWith('Arrow')) {
        this.updatePositions();
        this.cursor = 'default';
      }
    }
  }

  updatePositions(): void {
    const positions = {
      ...this.shape.positions,
    };
    const currentPos = this.getPositionAtCurrentTime(this.shape);
    if (
      currentPos.x !== this.drawnShape.posX ||
      currentPos.y !== this.drawnShape.posY ||
      currentPos.width !== this.drawnShape.width ||
      currentPos.height !== this.drawnShape.height
    ) {
      positions[this.currentTime] = {
        x: annotationsHelper.getWidthInRatio(
          this.drawnShape.posX,
          this.svgOverlay.width,
        ),
        y: annotationsHelper.getHeightInRatio(
          this.drawnShape.posY,
          this.svgOverlay.height,
        ),
        width: annotationsHelper.getWidthInRatio(
          this.drawnShape.width,
          this.svgOverlay.width,
        ),
        height: annotationsHelper.getHeightInRatio(
          this.drawnShape.height,
          this.svgOverlay.height,
        ),
      };
      const rectangle = {
        ...this.shape,
        positions,
      };
      this.setShape.emit(rectangle);
      if (this.tmpSvgAnnotation) {
        if (this.tmpSvgAnnotation.isOneShot) {
          rectangle.positions = {};
          rectangle.positions[this.tmpSvgAnnotation.timestamp] =
            positions[this.currentTime];
          this.setShape.emit(rectangle);
        }
        const annotation = {
          ...this.tmpSvgAnnotation,
          shape: {
            ...rectangle,
          },
        };
        if (this.currentMode === DrawingMode) {
          this.lastAnnotation = annotation;
        }
      }
    }
  }

  moveLeft(): void {
    this.drawnShape = {
      ...this.drawnShape,
      posX: this.drawnShape.posX - 1,
    };
  }

  moveRight(): void {
    this.drawnShape = {
      ...this.drawnShape,
      posX: this.drawnShape.posX + 1,
    };
  }

  moveUp(): void {
    this.drawnShape = {
      ...this.drawnShape,
      posY: this.drawnShape.posY - 1,
    };
  }

  moveDown(): void {
    this.drawnShape = {
      ...this.drawnShape,
      posY: this.drawnShape.posY + 1,
    };
  }

  updateDrawnShape(offsetX: number, offsetY: number, touchEvent = false): void {
    const minWidthAndHeight = 20;
    const x = offsetX - this.firstMousePositionX;
    const y = offsetY - this.firstMousePositionY;
    if (this.cursor === 'move' || touchEvent) {
      this.drawnShape = {
        ...this.drawnShape,
        posX: clamp(x, 0, this.svgOverlay.width - this.drawnShape.width),
        posY: clamp(y, 0, this.svgOverlay.height - this.drawnShape.height),
      };
    } else if (this.cursor === 'n-resize') {
      const newHeight =
        this.drawnShape.height + (this.drawnShape.posY - offsetY);
      if (newHeight >= minWidthAndHeight) {
        this.drawnShape = {
          ...this.drawnShape,
          posY: offsetY,
          height: newHeight,
        };
      }
    } else if (this.cursor === 's-resize') {
      const newHeight = offsetY - this.drawnShape.posY;
      if (newHeight >= minWidthAndHeight) {
        this.drawnShape = {
          ...this.drawnShape,
          height: newHeight,
        };
      }
    } else if (this.cursor === 'e-resize') {
      const newWidth = offsetX - this.drawnShape.posX;
      if (newWidth >= minWidthAndHeight) {
        this.drawnShape = {
          ...this.drawnShape,
          width: newWidth,
        };
      }
    } else if (this.cursor === 'w-resize') {
      const newWidth = this.drawnShape.width + (this.drawnShape.posX - offsetX);
      if (newWidth >= minWidthAndHeight) {
        this.drawnShape = {
          ...this.drawnShape,
          posX: offsetX,
          width: newWidth,
        };
      }
    } else if (this.cursor === 'nw-resize') {
      if (offsetX > this.drawnShape.posX && offsetY > this.drawnShape.posY) {
        const newWidth =
          this.drawnShape.width - (offsetX - this.drawnShape.posX);
        const newHeight =
          this.drawnShape.height - (offsetY - this.drawnShape.posY);
        if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
          this.drawnShape = {
            ...this.drawnShape,
            posX: offsetX,
            posY: offsetY,
            width: newWidth,
            height: newHeight,
          };
        }
      } else {
        const newWidth =
          this.drawnShape.width + (this.drawnShape.posX - offsetX);
        const newHeight =
          this.drawnShape.height + (this.drawnShape.posY - offsetY);
        if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
          this.drawnShape = {
            ...this.drawnShape,
            posX: offsetX,
            posY: offsetY,
            width: newWidth,
            height: newHeight,
          };
        }
      }
    } else if (this.cursor === 'ne-resize') {
      if (
        offsetX < this.drawnShape.posX + this.drawnShape.width &&
        offsetY < this.drawnShape.posY + this.drawnShape.height
      ) {
        const newWidth = offsetX - this.drawnShape.posX;
        const newHeight =
          this.drawnShape.height - (offsetY - this.drawnShape.posY);
        if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
          this.drawnShape = {
            ...this.drawnShape,
            posY: offsetY,
            width: newWidth,
            height: newHeight,
          };
        }
      } else {
        const newWidth = offsetX - this.drawnShape.posX;
        const newHeight =
          this.drawnShape.height + (this.drawnShape.posY - offsetY);
        if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
          this.drawnShape = {
            ...this.drawnShape,
            posY: offsetY,
            width: newWidth,
            height: newHeight,
          };
        }
      }
    } else if (this.cursor === 'sw-resize') {
      if (
        offsetX < this.drawnShape.posX &&
        offsetY > this.drawnShape.posY + this.drawnShape.height
      ) {
        const newWidth =
          this.drawnShape.width - (offsetX - this.drawnShape.posX);
        const newHeight = offsetY - this.drawnShape.posY;
        if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
          this.drawnShape = {
            ...this.drawnShape,
            posX: offsetX,
            height: newHeight,
            width: newWidth,
          };
        }
      } else {
        const newWidth =
          this.drawnShape.width + (this.drawnShape.posX - offsetX);
        const newHeight = offsetY - this.drawnShape.posY;
        if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
          this.drawnShape = {
            ...this.drawnShape,
            posX: offsetX,
            height: newHeight,
            width: newWidth,
          };
        }
      }
    } else if (this.cursor === 'se-resize') {
      const newWidth = offsetX - this.drawnShape.posX;
      const newHeight = offsetY - this.drawnShape.posY;
      if (newWidth >= minWidthAndHeight && newHeight >= minWidthAndHeight) {
        this.drawnShape = {
          ...this.drawnShape,
          width: newWidth,
          height: newHeight,
        };
      }
    }
  }

  @HostListener('mouseup')
  @HostListener('touchend')
  onMouseUp(): boolean {
    this.rectangleMoving = false;

    const positions = {
      ...this.shape.positions,
    };
    positions[this.currentTime] = {
      x: annotationsHelper.getWidthInRatio(
        this.drawnShape.posX,
        this.svgOverlay.width,
      ),
      y: annotationsHelper.getHeightInRatio(
        this.drawnShape.posY,
        this.svgOverlay.height,
      ),
      width: annotationsHelper.getWidthInRatio(
        this.drawnShape.width,
        this.svgOverlay.width,
      ),
      height: annotationsHelper.getHeightInRatio(
        this.drawnShape.height,
        this.svgOverlay.height,
      ),
    };
    if (this.currentMode === DrawingMode && this.rectangleDrawing) {
      // register the last position of the rectangle on drawing mode
      const rectangle = {
        ...this.shape,
        positions,
      };

      if (this.activateLabels) {
        const dialogRef = this.dialog.open(SvgAnnotationFormDialogComponent, {
          width: '600px',
          data: {
            enableDelete: this.labelDeletion,
            labels$: this.searchResults$,
            suggestedLabelGroup: this.suggestedLabelGroup,
            allowedLabelTypes: ['structure'],
            deleteLabelHandler: (name) => this.deleteAnnotationLabel.emit(name),
          },
          disableClose: false,
        });

        let queryChangesSub;

        dialogRef.afterOpened().subscribe(() => {
          this.isDialogOpen.emit(true);

          queryChangesSub = dialogRef.componentInstance.queryChanges$.subscribe(
            this.searchQuery,
          );
        });

        dialogRef.afterClosed().subscribe((data) => {
          this.isDialogOpen.emit(false);
          queryChangesSub.unsubscribe();

          if (data && data.name) {
            this.createAnnotation(rectangle, data);
          } else {
            this.drawnShape = {
              ...this.initShape,
            };
            this.setMode.emit(NormalMode);
          }
        });
      } else {
        this.createAnnotation(rectangle, {
          name: '',
          color: '#b31111',
          type: 'structure',
        });
      }
    }

    this.rectangleDrawing = false;
    this.svgLeave = false;
    return false; // Call preventDefault() on the event
  }

  onAnnotationDblClick(annotation: Annotation): void {
    const dialogRef = this.dialog.open(SvgAnnotationFormDialogComponent, {
      width: '600px',
      data: {
        enableDelete: this.labelDeletion,
        labels$: this.searchResults$,
        allowedLabelTypes: ['structure'],
        suggestedLabelGroup: this.suggestedLabelGroup,
        currentLabel: {
          ...annotation.label,
        },
        deleteLabelHandler: (name) => this.deleteAnnotationLabel.emit(name),
      },
      disableClose: false,
    });

    let queryChangesSub;

    dialogRef.afterOpened().subscribe(() => {
      this.isDialogOpen.emit(true);

      queryChangesSub = dialogRef.componentInstance.queryChanges$.subscribe(
        this.searchQuery,
      );
    });

    dialogRef.afterClosed().subscribe((data) => {
      this.isDialogOpen.emit(false);
      queryChangesSub.unsubscribe();

      if (data && data.name) {
        if (annotation.id) {
          const updates = {
            id: annotation.id,
            videoId: annotation.videoId,
            label: data,
          };
          this.update.emit(updates);
        } else {
          this.setTmp.emit({
            ...annotation,
            label: data,
          });
        }
      } else {
        this.setMode.emit(NormalMode);
      }
    });
  }

  onAnnotationTap(ev, annotation): void {
    if (ev.tapCount === 1) {
      this.onAnnotationClick(annotation);
    }
    if (ev.tapCount === 2) {
      this.onAnnotationDblClick(annotation);
    }
  }

  onAnnotationClick(annotation: Annotation): void {
    if (this.currentMode === EditMode) {
      const initialAnnotation = this.displayedShapes.find(
        (a) => a.id === annotation.id,
      );
      this.setShape.emit(initialAnnotation.shape);
      this.setTmp.emit(initialAnnotation);
      this.drawnShape = {
        ...this.drawnShape,
        ...initialAnnotation.label,
      };
    }
  }

  onAnnotationHover(id: number): void {
    if (this.currentMode === EditMode && !this.tmpSvgAnnotation) {
      this.hovered = id;
    }
    this.hover.emit(id);
  }

  onAnnotationLeave(id: number): void {
    if (this.hovered === id) {
      this.hovered = null;
    }
    this.hover.emit(null);
  }

  isInitialShape(): boolean {
    return (
      this.drawnShape.height === this.initShape.height &&
      this.drawnShape.posX === this.initShape.posX &&
      this.drawnShape.width === this.initShape.width &&
      this.drawnShape.posY === this.initShape.posY
    );
  }

  getCursor(x: number, y: number): string {
    const margin = 5;
    if (!x || !y || this.isInitialShape()) {
      return this.currentMode.cursor;
    } else if (
      x >= this.drawnShape.posX - margin &&
      x <= this.drawnShape.posX + this.drawnShape.width + margin &&
      y >= this.drawnShape.posY - margin &&
      y <= this.drawnShape.posY + this.drawnShape.height + margin
    ) {
      // in the rectangle
      if (
        y <= this.drawnShape.posY + margin &&
        y >= this.drawnShape.posY - margin
      ) {
        // top
        if (
          x <= this.drawnShape.posX + margin &&
          x >= this.drawnShape.posX - margin
        ) {
          // NW
          return 'nw-resize';
        } else if (
          x <= this.drawnShape.posX + this.drawnShape.width + margin &&
          x >= this.drawnShape.posX + this.drawnShape.width - margin
        ) {
          // NE
          return 'ne-resize';
        } else {
          // N
          return 'n-resize';
        }
      } else if (
        y <= this.drawnShape.posY + this.drawnShape.height + margin &&
        y >= this.drawnShape.posY + this.drawnShape.height - margin
      ) {
        // bottom
        if (
          x <= this.drawnShape.posX + margin &&
          x >= this.drawnShape.posX - margin
        ) {
          // SW
          return 'sw-resize';
        } else if (
          x <= this.drawnShape.posX + this.drawnShape.width + margin &&
          x >= this.drawnShape.posX + this.drawnShape.width - margin
        ) {
          // SE
          return 'se-resize';
        } else {
          // S
          return 's-resize';
        }
      } else if (
        x >= this.drawnShape.posX - margin &&
        x <= this.drawnShape.posX + margin
      ) {
        // left
        return 'w-resize';
      } else if (
        x <= this.drawnShape.posX + this.drawnShape.width + margin &&
        x >= this.drawnShape.posX + this.drawnShape.width - margin
      ) {
        return 'e-resize';
      } else {
        return 'move';
      }
    } else {
      return this.currentMode.cursor;
    }
  }

  createAnnotation(shape: AnnotationShape, label: AnnotationLabel): void {
    this.setShape.emit(shape);

    const duration = 0;
    const newAnnotation: Annotation = {
      shape,
      videoId: this.videoId,
      category: 'svg',
      label,
      duration,
      timestamp: this.currentTime,
      isOneShot: duration === Math.round(1000 / 30),
    };
    this.lastAnnotation = newAnnotation;
    this.drawnShape = {
      ...this.drawnShape,
      color: label.color,
      name: label.name,
    };

    this.setTmp.emit(newAnnotation);
  }

  @HostListener('contextmenu')
  onContextMenu(): boolean {
    return false;
  }

  /**
   * Resize the rectangle present when the scene changes
   */
  resizeRectangle(): void {
    this.drawnShape = {
      ...this.drawnShape,
      height: this.getPositionAtCurrentTime(this.shape).height,
      width: this.getPositionAtCurrentTime(this.shape).width,
      posX: this.getPositionAtCurrentTime(this.shape).x,
      posY: this.getPositionAtCurrentTime(this.shape).y,
    };
  }

  /**
   * Move the rectangle according to its set of positions and the current time of the stream
   * @returns X and Y latest coordinates of the rectangle at current time
   */
  getPositionAtCurrentTime(
    rectangle,
  ): { x: number; y: number; width: number; height: number } {
    let res = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    if (rectangle && rectangle.positions) {
      const lastTimeStamp = Object.keys(rectangle.positions)
        .reverse()
        .find((timestamp) => {
          return +timestamp <= this.currentTime;
        });
      if (lastTimeStamp) {
        res = {
          x: annotationsHelper.getWidthInPixels(
            rectangle.positions[lastTimeStamp].x,
            this.svgOverlay.width,
          ),
          y: annotationsHelper.getHeightInPixels(
            rectangle.positions[lastTimeStamp].y,
            this.svgOverlay.height,
          ),
          width: annotationsHelper.getWidthInPixels(
            rectangle.positions[lastTimeStamp].width,
            this.svgOverlay.width,
          ),
          height: annotationsHelper.getHeightInPixels(
            rectangle.positions[lastTimeStamp].height,
            this.svgOverlay.height,
          ),
        };
      }
    }
    return res;
  }
}
