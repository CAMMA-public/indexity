import {
  AfterViewChecked,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Directive({
  selector: '[surg-video-player]',
})
export class VideoDirective implements AfterViewChecked, OnChanges, OnDestroy {
  @Input() videoId = Math.floor(Math.random() * 1000000);
  @Input() isVideoPlaying = false;
  @Input() tmpPause = false;
  @Input() frameStep = 30;

  @Output() setVideoSize = new EventEmitter<{
    w: number;
    h: number;
  }>();
  @Output() setVideoDuration = new EventEmitter<number>();
  @Output() setVideoTime = new EventEmitter<number>();
  @Output() setIsVideoPlaying = new EventEmitter<boolean>();

  @Output() joinRoom = new EventEmitter<number>();
  @Output() leaveRoom = new EventEmitter<number>();
  @Output() clearAnnotations = new EventEmitter<void>();

  @Output() setSvgOverlay = new EventEmitter<{
    width: number;
    height: number;
    top: number;
    left: number;
  }>();

  videoRect: ClientRect;
  subscriptions: Subscription[] = [];
  intervalSub: Subscription;

  playbackRate$ = new BehaviorSubject(1);
  // tslint:disable-next-line:variable-name
  private _playbackRate$ = this.playbackRate$.asObservable();

  constructor(private el: ElementRef) {
    const prSub = this._playbackRate$.subscribe(
      (rate) =>
        ((this.el.nativeElement as HTMLVideoElement).playbackRate = rate),
    );
    this.subscriptions.push(prSub);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.videoId &&
      changes.videoId.currentValue !== changes.videoId.previousValue
    ) {
      if (changes.videoId.previousValue) {
        this.leaveRoom.emit(changes.videoId.previousValue);
      }
      this.joinRoom.emit(changes.videoId.currentValue);
    }
    if (
      (changes.isVideoPlaying &&
        changes.isVideoPlaying.previousValue !==
          changes.isVideoPlaying.currentValue) ||
      (changes.tmpPause &&
        changes.tmpPause.previousValue !== changes.tmpPause.currentValue)
    ) {
      this.isVideoPlaying && !this.tmpPause
        ? this.el.nativeElement.play()
        : this.el.nativeElement.pause();
    }
    if (
      changes.frameStep &&
      changes.frameStep.previousValue !== changes.frameStep.currentValue &&
      (changes.frameStep.currentValue < 0 ||
        changes.frameStep.currentValue > 60)
    ) {
      this.frameStep = 30;
    }
  }

  setCurrentTime(time: number): void {
    this.el.nativeElement.currentTime = time;
  }

  frameForward(): void {
    this.el.nativeElement.currentTime += 1 / this.frameStep;
  }

  frameBackward(): void {
    this.el.nativeElement.currentTime -= 1 / this.frameStep;
  }

  ngAfterViewChecked(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    if (
      !this.videoRect ||
      rect.top !== this.videoRect.top ||
      rect.left !== this.videoRect.left ||
      rect.width !== this.videoRect.width ||
      rect.height !== this.videoRect.height
    ) {
      this.resize();
    }
  }

  ngOnDestroy(): void {
    this.leaveRoom.emit(this.videoId);
    this.subscriptions.map((subscription) => subscription.unsubscribe());
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
    }
  }

  @HostListener('seeking', ['$event'])
  onSeeking(ev): void {
    this.setVideoTime.emit(Math.round(ev.target.currentTime * 1000));
  }

  @HostListener('play')
  onPlay(): void {
    this.intervalSub = interval(1000 / this.frameStep).subscribe(() =>
      this.setVideoTime.emit(
        Math.round(this.el.nativeElement.currentTime * 1000) || 0,
      ),
    );
  }

  @HostListener('pause')
  onPause(): void {
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
    }
  }

  @HostListener('loadeddata')
  onLoadedData(): void {
    this.setVideoDuration.emit(
      Math.round(this.el.nativeElement.duration * 1000),
    );
    this.resize();
  }

  @HostListener('window:scroll')
  onListenerTriggered(): void {
    this.resize();
  }

  calculateOverlay(
    videoRect: ClientRect,
    videoWidth: number,
    videoHeight: number,
    playerWidth: number,
    playerHeight: number,
  ): {
    width: number;
    height: number;
    top: number;
    left: number;
  } {
    const top = videoRect.top;
    const left = videoRect.left;

    if (videoHeight) {
      // We calculate the ratio from player and video in order to compare them and see in which configuration we are.
      const playerRatio = playerWidth / playerHeight;
      const videoRatio = videoWidth / videoHeight;
      // video has a width constraint
      if (playerRatio < videoRatio) {
        const height = (videoHeight / videoWidth) * playerWidth;
        return {
          top: (playerHeight - height) / 2 + top,
          left,
          height,
          width: playerWidth,
        };
      } else if (playerRatio >= videoRatio) {
        const width = (videoWidth / videoHeight) * playerHeight;
        return {
          top,
          left: (playerWidth - width) / 2 + left,
          height: playerHeight,
          width,
        };
      }
    } else {
      return {
        top,
        left,
        height: playerHeight,
        width: playerWidth,
      };
    }
  }

  /**
   * Resize the svg area to fit the video image
   */
  @HostListener('window:resize')
  resize(): void {
    this.videoRect = this.el.nativeElement.getBoundingClientRect();

    // Get the player size
    const playerWidth = this.el.nativeElement.clientWidth;
    const playerHeight = this.el.nativeElement.clientHeight;
    // Get the video element and retrieve its metadata
    const videoHeight = this.el.nativeElement.videoHeight;
    const videoWidth = this.el.nativeElement.videoWidth;
    // This may not be initialize yet
    if (videoHeight) {
      this.setVideoSize.emit({
        h: videoHeight,
        w: videoWidth,
      });
    }

    this.setSvgOverlay.emit(
      this.calculateOverlay(
        this.videoRect,
        videoWidth,
        videoHeight,
        playerWidth,
        playerHeight,
      ),
    );
  }
}
