import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  VIDEOS_FILTER_TYPE,
  VideosFilter,
} from '@app/annotations/models/videos-filter.model';
import {
  Video,
  VideoStats,
} from '@app/annotations/modules/videos/models/video.model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime, map, pluck } from 'rxjs/operators';
import { getSelectionOnShiftClick } from '@app/annotations/modules/videos/helpers/video.helpers';
import { CdkDragDrop, CdkDragEnd } from '@angular/cdk/drag-drop';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';
import { AnnotationLabelsService } from '@app/annotations/services/annotation-labels.service';
import { MatDialog } from '@angular/material/dialog';
import { EditVideoDialogComponent } from '@app/annotations/components/edit-video-dialog/edit-video-dialog.component';
import { InfoMessageService } from '@app/services/info-message.service';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoListComponent implements OnChanges {
  @Input() isSmLayout = false;
  @Input() canManageVideos = false;
  @Input() videos: Array<Video> = [];
  @Input() videoGroups: { [videoId: number]: VideoGroup[] };
  @Input() uploading = false;
  @Input() bookmarkedIds = [];
  @Input() videoStats: { [k: number]: VideoStats };
  @Input() currentFilter: VideosFilter;
  @Input() showHeader = true;
  @Input() currentUserId = 0;
  @Input() forceSmLayout = false;
  @Input() enableActions = true;
  @Input() showStatus = true;
  @Input() showStats = true;
  @Input() selectMultiple = false;
  @Input() enableGroupManagement = false;
  @Input() enableVideoAccess = true;
  @Input() isInGroup = false;
  @Input() selectedVideos: number[] = [];
  @Output() selectVideo = new EventEmitter<number>();
  @Output() selectVideos = new EventEmitter<number[]>();
  @Output() upload = new EventEmitter<FormData>();
  @Output() deleteVideo = new EventEmitter<Video>();
  @Output() renameVideo = new EventEmitter<{ id: number; name: string }>();
  @Output() bookmark = new EventEmitter<number>();
  @Output() removeBookmark = new EventEmitter<number>();
  @Output() setVideoAnnotationState = new EventEmitter<{
    videoId: number;
    state: VIDEO_ANNOTATION_STATE;
  }>();
  @Output() filter = new EventEmitter<VideosFilter>();
  @Output() retryVideoStats = new EventEmitter<Video>();
  @Output() removeFromGroup = new EventEmitter<number>();
  @Output() addToGroup = new EventEmitter<number>();
  @Output() itemDropped = new EventEmitter<CdkDragDrop<number, any>>();
  @Output() dragStarted = new EventEmitter<void>();
  @Output() dragEnded = new EventEmitter<CdkDragEnd>();

  @Output() onLoadNextBatch = new EventEmitter();

  @ViewChild('container') videosContainer: ElementRef;
  private hasLoaded = false;
  subscriptions: Subscription[] = [];

  isSMLayout$ = this.breakpointObserver
    .observe([Breakpoints.Small, Breakpoints.XSmall])
    .pipe(map((res) => res.matches));
  ctrlPressed = false;
  shiftPressed = false;
  shiftFirstElement: number = null;
  selectedVideoItems = [];

  videoTrackBy = (i, video: Video): number => video.id;
  searchResults$: Observable<AnnotationLabel[]>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private annotationLabelsService: AnnotationLabelsService,
    private dialog: MatDialog,
    private infoMessageService: InfoMessageService,
  ) {}

  ngOnInit(): void {
    const resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(200), pluck('timeStamp'))
      .subscribe(() => this.fillVideoContainer());
    this.subscriptions.push(resizeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.map((sub) => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.videos &&
      changes.videos.previousValue &&
      changes.videos.previousValue.length < changes.videos.currentValue.length
    ) {
      this.hasLoaded = true;
    }

    if (
      changes.selectedVideos &&
      changes.selectedVideos.currentValue &&
      this.videos
    ) {
      this.selectedVideoItems = this.videos.filter((v) =>
        this.selectedVideos.includes(v.id),
      );
    }
  }

  ngAfterViewChecked(): void {
    if (this.hasLoaded) {
      this.fillVideoContainer();
      this.hasLoaded = false;
    }
  }

  fillVideoContainer(): void {
    // if no scrollbars, check if there's more content to be loaded
    if (
      this.videosContainer.nativeElement.clientHeight > 0 &&
      this.videosContainer.nativeElement.scrollHeight ===
        this.videosContainer.nativeElement.clientHeight
    ) {
      this.onScroll();
    }
  }

  onScroll(): void {
    this.onLoadNextBatch.emit();
  }

  onDragStart(e): void {
    if (!this.selectedVideos.length) {
      this.selectVideo.emit(e.source.data);
    }
    this.dragStarted.emit(e);
  }

  @HostListener('document:keyup.control')
  onCtrlUp(): void {
    this.ctrlPressed = false;
  }

  @HostListener('document:keyup.shift')
  onShiftUp(): void {
    this.shiftPressed = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): boolean {
    if (this.selectMultiple && e.shiftKey) {
      this.shiftPressed = true;
      this.shiftFirstElement = this.shiftFirstElement
        ? this.shiftFirstElement
        : this.selectedVideos[this.selectedVideos.length - 1];
    }
    if (e.ctrlKey) {
      this.ctrlPressed = true;
      if (e.key === 'a' && this.selectMultiple && this.selectedVideos.length) {
        if (this.videos.length === this.selectedVideos.length) {
          this.selectVideos.emit([]);
        } else {
          this.selectVideos.emit(this.videos.map((v) => v.id));
        }
        return false;
      }
    }
  }

  @HostListener('document:mouseleave')
  onMouseLeave(): void {
    this.ctrlPressed = false;
    this.shiftPressed = false;
  }

  onVideoClick(video: Video): void {
    if (this.selectMultiple) {
      if (this.ctrlPressed) {
        this.shiftFirstElement = null;
        this.selectVideo.emit(video.id);
      } else if (this.shiftPressed) {
        if (!this.shiftFirstElement) {
          this.shiftFirstElement = video.id;
        }
        const selection = getSelectionOnShiftClick(
          this.shiftFirstElement,
          this.videos.map((v) => v.id),
          video.id,
        );
        this.selectVideos.emit(selection);
      } else if (this.selectedVideos.length) {
        this.selectVideos.emit([video.id]);
      }
    }
  }

  onUpload(formData: FormData): void {
    this.upload.emit(formData);
  }

  async onDeleteVideo(video: Video): Promise<void> {
    const confirm = await this.infoMessageService.setConfirm(
      'Confirm suppression',
      'Are you sure you want to delete this video?',
    );
    if (confirm) {
      this.deleteVideo.emit(video);
    }
  }

  onRenameVideo(video: Video): void {
    const dialogRef = this.dialog.open(EditVideoDialogComponent, {
      width: '600px',
      data: video,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.name) {
        this.renameVideo.emit({
          id: video.id,
          name: data.name,
        });
      }
    });
  }

  onSetAnnotationProgressState(event: {
    videoId: number;
    state: VIDEO_ANNOTATION_STATE;
  }): void {
    this.setVideoAnnotationState.emit(event);
  }

  onBookmark(id: number, bookmark: boolean): void {
    bookmark ? this.bookmark.emit(id) : this.removeBookmark.emit(id);
  }

  onFilter(filter: VideosFilter): void {
    if (filter && filter.type === VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME) {
      this.searchResults$ = this.annotationLabelsService.search(filter.param);
    }
    this.filter.emit(filter);
  }

  isBookmarked(id: number): boolean {
    return this.bookmarkedIds.includes(id);
  }
}
