import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import {
  VIDEOS_FILTER_TYPE,
  VideosFilter,
} from '@app/annotations/models/videos-filter.model';
import { mapGroupsToVideos } from '@app/annotations/modules/videos/helpers/video.helpers';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { VideoStatsStoreFacade } from '@app/annotations/modules/videos/store/video-stats/video-stats.store-facade';
import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, pluck, tap } from 'rxjs/operators';
import { formatErrorMessage } from '@app/helpers/user.helpers';
import { InfoMessageService } from '@app/services/info-message.service';

@Component({
  selector: 'app-videos-index-view',
  templateUrl: './videos-index-view.component.html',
  styleUrls: ['./videos-index-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideosIndexViewComponent implements OnInit, AfterViewInit {
  bookmarkedIds$ = this.videosStoreFacade.bookmarkedVideos$.pipe(
    map((videos) => videos.map((v) => v.id)),
  );
  uploading$ = new BehaviorSubject(false);
  selectedTab$ = new BehaviorSubject(0);
  isSmLayout$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
    .pipe(map((state) => state.matches));
  userCanManageVideos$ = combineLatest([
    this.usersFacade.userIsAdmin$,
    this.usersFacade.userIsModerator$,
  ]).pipe(map(([isAdmin, isModerator]) => isAdmin || isModerator));

  currentUserId$ = this.usersFacade.currentUser$.pipe(pluck('id'));

  videos$ = this.videosStoreFacade.videos$.pipe(
    tap(() => setTimeout(() => this.cdr.detectChanges())),
  );
  videoStats$ = this.videoStatsStoreFacade.videoStatsMap$;

  videoGroupsMap$: Observable<{
    [videoId: number]: VideoGroup[];
  }> = combineLatest([
    this.videoStatsStoreFacade.videoStats$,
    this.videoStatsStoreFacade.videoGroups$,
  ]).pipe(map(([stats, groups]) => mapGroupsToVideos(stats, groups)));

  currentVideosFilter$ = this.videosStoreFacade.filter$;
  bookmarkedVideos$ = this.videosStoreFacade.bookmarkedVideos$;
  bookmarkedVideosTotal$ = this.videosStoreFacade.bookmarkedVideosTotal$;

  @ViewChild('videoTabs', { static: true }) videoTabs: MatTabGroup;

  constructor(
    public videosStoreFacade: VideosStoreFacade,
    public usersFacade: UsersFacade,
    private videosApiService: VideosApiService,
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private videoStatsStoreFacade: VideoStatsStoreFacade,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private infoMessageService: InfoMessageService,
  ) {}

  /**
   * Get a videos list and display them.
   * Set the page title
   */
  ngOnInit(): void {
    this.videosStoreFacade.setCurrentVideoId(null);
    this.onLoadNextBatch();
    this.videosStoreFacade.loadBookmarkedIds();
    this.route.queryParams.subscribe((params) => {
      if (params.tab && params.tab === 'bookmarks') {
        this.selectedTab$.next(1);
        this.videosStoreFacade.clearVideoList();
        this.videosStoreFacade.loadNextVideoBookmarkBatch();
      } else {
        this.videosStoreFacade.clearVideoList();
        this.onLoadNextBatch();
        this.selectedTab$.next(0);
      }
    });
  }

  ngAfterViewInit(): void {
    const time = +this.route.snapshot.queryParamMap.get('t');
    if (time !== undefined) {
      this.router.navigate([], {
        queryParams: { ...this.route.snapshot.queryParams, t: null },
        relativeTo: this.route,
        replaceUrl: true,
      });
    }
  }

  onRetryVideoStats(video: Video): void {
    this.videoStatsStoreFacade.loadStatsForVideo(video.id);
  }

  onTabChange(e): void {
    if (this.selectedTab$.value !== e.index) {
      if (e.index === 1) {
        this.router.navigate([], {
          queryParams: {
            tab: 'bookmarks',
          },
          relativeTo: this.route,
        });
      } else {
        this.router.navigate([], { relativeTo: this.route });
      }
    } else if (e.index === 1) {
      this.router.navigate([], {
        queryParams: { ...this.route.snapshot.queryParams, tab: 'bookmarks' },
        relativeTo: this.route,
      });
    } else {
      this.router.navigate([], {
        queryParams: { ...this.route.snapshot.queryParams, tab: null },
        relativeTo: this.route,
      });
    }
  }

  onLoadNextBatch(): void {
    this.currentVideosFilter$.subscribe((filter) => {
      // Since this handler function is called when we haven't scrolled yet, the videos batch is loaded even after a filter is set.
      // This not a perfect solution but it allows to differentiate filtered view from 'all videos' view.
      // Therefore, if a filter is set, the trigger from the perfect scrollbar component will not be handled.
      if (!filter) {
        this.videosStoreFacade.loadNextBatch();
      } else {
        switch (filter.type) {
          case VIDEOS_FILTER_TYPE.BY_NAME: {
            this.videosStoreFacade.searchByName(filter.param);
            break;
          }
          case VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE: {
            this.videosStoreFacade.searchByAnnotationState(filter.param);
            break;
          }
          case VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME: {
            this.videosStoreFacade.searchByLabelName(filter.param);
            break;
          }
        }
      }
    });
  }

  onLoadNextBookmarkBatch(): void {
    this.videosStoreFacade.loadNextVideoBookmarkBatch();
  }

  onSetAnnotationProgressState(event: {
    videoId: number;
    state: VIDEO_ANNOTATION_STATE;
  }): void {
    this.videosStoreFacade.setVideoAnnotationState(event.videoId, event.state);
  }

  async onUpload(formData: FormData): Promise<void> {
    this.uploading$.next(true);
    try {
      await this.videosApiService.uploadVideos(formData);
    } catch (e) {
      console.error(e);
      this.infoMessageService.setDialog('Upload error', formatErrorMessage(e));
    } finally {
      this.uploading$.next(false);
    }
  }

  async onDelete(video: Video): Promise<void> {
    this.videosStoreFacade.removeVideo(video.id);
  }

  onRenameVideo(videoId: number, name: string): void {
    this.videosStoreFacade.updateVideo({ id: videoId, name });
  }

  onVideosFilter(filter: VideosFilter): void {
    if (filter && filter.param) {
      this.videosStoreFacade.clearVideoList();
      this.videosStoreFacade.setCurrentFilter(filter);
      switch (filter.type) {
        case VIDEOS_FILTER_TYPE.BY_NAME: {
          this.videosStoreFacade.searchByName(filter.param);
          break;
        }
        case VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE: {
          this.videosStoreFacade.searchByAnnotationState(filter.param);
          break;
        }
        case VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME: {
          this.videosStoreFacade.searchByLabelName(filter.param);
          break;
        }
      }
    } else {
      this.videosStoreFacade.loadAllVideos();
    }
  }
}
