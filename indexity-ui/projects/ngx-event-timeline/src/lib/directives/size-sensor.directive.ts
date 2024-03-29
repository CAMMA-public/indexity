import {Directive, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';
import {ResizedEvent} from '../models/resize-event';
import { ResizeSensor } from 'css-element-queries';
@Directive({
  selector: '[sizeSensor]'
})
export class SizeSensorDirective implements OnInit {


  @Output()
  readonly resized = new EventEmitter<ResizedEvent>();

  private oldWidth: number;
  private oldHeight: number;

  constructor(private readonly element: ElementRef) {
  }

  ngOnInit(): void {
    // tslint:disable-next-line:no-unused-expression
    new ResizeSensor(this.element.nativeElement, x => this.onResized());
    this.onResized();
  }

  private onResized(): void {
    const newWidth = this.element.nativeElement.clientWidth;
    const newHeight = this.element.nativeElement.clientHeight;

    if (newWidth === this.oldWidth && newHeight === this.oldHeight) {
      return;
    }

    const event = new ResizedEvent(
      this.element,
      newWidth,
      newHeight,
      this.oldWidth,
      this.oldHeight);

    this.oldWidth = this.element.nativeElement.clientWidth;
    this.oldHeight = this.element.nativeElement.clientHeight;

    this.resized.next(event);
  }

}
