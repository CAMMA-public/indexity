import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { VideoDirective } from '@indexity/annotations';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaPlayerComponent implements AfterViewInit {
  @ViewChild(VideoDirective, { static: true }) surgVideoDir: VideoDirective;
  @ViewChild('videoContainer') videoContainerElement: ElementRef;

  @Input() frameStep = 10;
  @Input() isVideoPlaying = false;
  @Input() fileUrl = '';
  @Input() videoId: number;
  @Input() tmpPause = false;
  @Input() videoHeight = 480;

  @Output() setSvgOverlay = new EventEmitter<{
    width: number;
    height: number;
    top: number;
    left: number;
  }>();
  @Output() setVideoSize = new EventEmitter<{
    w: number;
    h: number;
  }>();
  @Output() setVideoDuration = new EventEmitter<number>();
  @Output() setVideoHeight = new EventEmitter<number>();
  @Output() setVideoTime = new EventEmitter<number>();
  @Output() setIsVideoPlaying = new EventEmitter<boolean>();
  @Output() videoDataLoaded = new EventEmitter();
  @Output() videoSeeking = new EventEmitter<any>();

  @Output() joinRoom = new EventEmitter<number>();
  @Output() leaveRoom = new EventEmitter<number>();

  actualHeight = 480;

  ngAfterViewInit(): void {
    this.updateView();
  }

  updateView(): void {
    this.actualHeight = this.videoContainerElement.nativeElement.getBoundingClientRect().height;
  }

  onForwardSeek(): void {
    this.surgVideoDir.frameForward();
  }

  onBackwardSeek(): void {
    this.surgVideoDir.frameBackward();
  }

  onJoinRoom(id: number): void {
    if (id !== null) {
      this.joinRoom.emit(id);
    }
  }

  onSetVideoTime(time: number): void {
    this.setVideoTime.emit(time);
  }

  onSetVideoDuration(duration: number): void {
    this.setVideoDuration.emit(duration);
  }

  onSetIsVideoPlaying(isPlaying: boolean): void {
    this.setIsVideoPlaying.emit(isPlaying);
  }

  onLeaveRoom(id: number): void {
    this.leaveRoom.emit(id);
  }

  onSetVideoSize(size: { h: number; w: number }): void {
    this.setVideoSize.emit(size);
  }

  onResize(event: ResizeEvent): void {
    this.setVideoHeight.emit(event.rectangle.height);
    this.updateView();
  }

  onSetSvgOverlay(overlay: {
    top: number;
    left: number;
    width: number;
    height: number;
  }): void {
    this.setSvgOverlay.emit(overlay);
  }

  @HostListener('document:keydown.space', ['$event'])
  onSpace(event): void {
    event.preventDefault();
    this.setIsVideoPlaying.emit(!this.surgVideoDir.isVideoPlaying);
  }
}
