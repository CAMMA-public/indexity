import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { VideoDirective } from './video.directive';
import { Component, ElementRef, Renderer2 } from '@angular/core';

class MockElementRef extends ElementRef {
  constructor() {
    super(undefined);
  }
  nativeElement = {
    clientWidth: 0,
    clientHeight: 0,
    videoWidth: 0,
    videoHeight: 0,
    currentTime: 100,
    duration: 3600,
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    }),
    paused: true,
    play: () => (this.nativeElement.paused = false),
    pause: () => (this.nativeElement.paused = true),
  };
}
@Component({
  template: `
    <video
      surg-video-player
      [videoId]="videoId"
      [frameStep]="frameStep"
      [isVideoPlaying]="isVideoPlaying"
      (setVideoSize)="onSetVideoSize($event)"
      (setSvgOverlay)="onSetSvgOverlay($event)"
      (joinRoom)="onJoinRoom($event)"
      (leaveRoom)="onLeaveRoom($event)"
      (setVideoTime)="onSetVideoTime($event)"
      (setVideoDuration)="onSetVideoDuration($event)"
      (setIsVideoPlaying)="onSetIsVideoPlaying($event)"
    ></video>
  `,
})
class DirectiveTestComponent {
  videoId = 1;
  isVideoPlaying = false;
  frameStep = 30;
  tmpPause = false;

  onSetVideoSize(size: { h: number; w: number }): void {
    // Do nothing.
  }

  onSetSvgOverlay(overlay: {
    top: number;
    left: number;
    width: number;
    height: number;
  }): void {
    // Do nothing.
  }

  onJoinRoom(id: number): void {
    // Do nothing.
  }

  onLeaveRoom(id: number): void {
    // Do nothing.
  }

  onSetVideoTime(time: number): void {
    // Do nothing.
  }

  onSetVideoDuration(duration: number): void {
    // Do nothing.
  }
}

describe('VideoDirective', () => {
  let fixture: ComponentFixture<DirectiveTestComponent>;
  let component: DirectiveTestComponent;
  let directiveEl;
  let directive;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VideoDirective, DirectiveTestComponent],
      providers: [{ provide: ElementRef, useClass: MockElementRef }, Renderer2],
    }).compileComponents();
    fixture = TestBed.createComponent(DirectiveTestComponent);
    component = fixture.componentInstance;
    directiveEl = fixture.debugElement.query(By.directive(VideoDirective));
    directive = directiveEl.injector.get(VideoDirective);
  }));

  it('should run a directive', async(() => {
    expect(component).toBeTruthy();
    expect(directive).toBeTruthy();
  }));

  describe('#ngOnChanges', () => {
    describe('videoId', () => {
      it('should leave current room and join the new room', () => {
        component.videoId = 1;
        fixture.detectChanges();
        spyOn(directive.leaveRoom, 'emit');
        spyOn(directive.joinRoom, 'emit');
        component.videoId = 2;
        fixture.detectChanges();
        expect(directive.leaveRoom.emit).toHaveBeenCalledWith(1);
        expect(directive.joinRoom.emit).toHaveBeenCalledWith(2);
      });
    });

    describe('isVideoPlaying', () => {
      it('should play the video', () => {
        spyOn(directiveEl.nativeElement, 'play');
        spyOn(directiveEl.nativeElement, 'pause');
        component.isVideoPlaying = true;
        fixture.detectChanges();
        expect(directiveEl.nativeElement.play).toHaveBeenCalled();
        expect(directiveEl.nativeElement.pause).not.toHaveBeenCalled();
      });

      it('should tmp pause the video', () => {
        spyOn(directiveEl.nativeElement, 'play');
        spyOn(directiveEl.nativeElement, 'pause');
        component.tmpPause = true;
        fixture.detectChanges();
        expect(directiveEl.nativeElement.pause).toHaveBeenCalled();
        expect(directiveEl.nativeElement.play).not.toHaveBeenCalled();
      });

      it('should pause the video', () => {
        spyOn(directiveEl.nativeElement, 'play');
        spyOn(directiveEl.nativeElement, 'pause');
        component.isVideoPlaying = false;
        fixture.detectChanges();
        expect(directiveEl.nativeElement.pause).toHaveBeenCalled();
        expect(directiveEl.nativeElement.play).not.toHaveBeenCalled();
      });
    });

    describe('onSeeking', () => {
      it('should call setVideoTime.emit', () => {
        spyOn(directive.setVideoTime, 'emit');
        const currentTime = 10;
        directiveEl.triggerEventHandler('seeking', {
          target: {
            currentTime,
          },
        });
        expect(directive.setVideoTime.emit).toHaveBeenCalledWith(
          currentTime * 1000,
        );
      });
    });

    describe('frameStep', () => {
      it('should change the frame step', () => {
        component.frameStep = 60;
        fixture.detectChanges();
        expect(directive.frameStep).toBe(60);
      });

      it('should set the frame step to 30 when the value is negative', () => {
        component.frameStep = -20;
        fixture.detectChanges();
        expect(directive.frameStep).toBe(30);
      });

      it('should set the frame step to 30 when the value is more than 60', () => {
        component.frameStep = 120;
        fixture.detectChanges();
        expect(directive.frameStep).toBe(30);
      });
    });
  });

  describe('setCurrentTime', () => {
    it('should change currentTime', () => {
      directive.setCurrentTime(10);
      expect(directiveEl.nativeElement.currentTime).toBe(10);
    });
  });

  describe('frameForward', () => {
    it('should change currentTime', () => {
      const time = directiveEl.nativeElement.currentTime;
      component.frameStep = 1;
      fixture.detectChanges();
      directive.frameForward();
      expect(directiveEl.nativeElement.currentTime).toBe(time + 1);
    });
  });

  describe('frameBackward', () => {
    it('should change currentTime', () => {
      const time = directiveEl.nativeElement.currentTime;
      component.frameStep = 1;
      fixture.detectChanges();
      directive.frameBackward();
      expect(directiveEl.nativeElement.currentTime).toBe(time - 1);
    });
  });

  describe('calculateOverlay', () => {
    it('should calculate overlay when video is not defined', () => {
      const clientRect = directiveEl.nativeElement.getBoundingClientRect();
      const result = directive.calculateOverlay(clientRect, null, null, 10, 10);
      const expected = {
        top: clientRect.top,
        left: clientRect.left,
        height: 10,
        width: 10,
      };
      expect(result).toEqual(expected);
    });
  });
});
