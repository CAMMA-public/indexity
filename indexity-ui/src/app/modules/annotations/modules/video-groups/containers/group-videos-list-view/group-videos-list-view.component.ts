import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { combineLatest, Subscription } from 'rxjs';
import { filter, map, pluck, tap } from 'rxjs/operators';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { Actions, ofType } from '@ngrx/effects';
import { removeGroupSuccess } from '@app/annotations/store/video-groups/video-groups.actions';
import { extractPayload } from '@app/helpers/ngrx.helpers';
import { VideoStatsStoreFacade } from '@app/annotations/modules/videos/store/video-stats/video-stats.store-facade';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import {
  VIDEOS_FILTER_TYPE,
  VideosFilter,
} from '@app/annotations/models/videos-filter.model';

@Component({
  selector: 'app-group-video-list',
  templateUrl: './group-videos-list-view.component.html',
  styleUrls: ['./group-videos-list-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupVideosListViewComponent implements OnInit, OnDestroy {
  groupId: number;
  groupVideosFilter$ = this.videoGroupsFacade.groupVideosFilter$.pipe(
    filter((v) => !!v),
  );
  videoGroup$ = this.videoGroupsFacade.videoGroup$;
  videos$ = this.videoGroupsFacade.filteredGroupVideos$;
  groupVideosIsLoading$ = this.videoGroupsFacade.groupVideosIsLoading$;
  isVideosFiltering$ = this.videoGroupsFacade.groupVideosIsFiltering$;
  displayVideos$ = combineLatest([
    this.groupVideosIsLoading$,
    this.videos$,
    this.isVideosFiltering$,
  ]).pipe(
    map(
      ([isLoading, videos, isFiltering]) =>
        (!isLoading && videos.length) || (!videos.length && isFiltering),
    ),
  );
  currentUserId$ = this.usersFacade.currentUser$.pipe(pluck('id'));
  userCanManageVideosAndGroups$ = combineLatest([
    this.usersFacade.userIsAdmin$,
    this.usersFacade.userIsModerator$,
  ]).pipe(map(([isAdmin, isModerator]) => isAdmin || isModerator));
  videoStats$ = this.videoStatsStoreFacade.videoStatsMap$;
  bookmarkedIds$ = this.videoGroupsFacade.bookmarkedIds$;
  subscriptions: Subscription[] = [];
  currentVideosFilter$ = this.videoGroupsFacade.groupVideosFilter$;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoGroupsFacade: VideoGroupsStoreFacade,
    private usersFacade: UsersFacade,
    private videosStoreFacade: VideosStoreFacade,
    private videoStatsStoreFacade: VideoStatsStoreFacade,
    private uiFacade: UiFacade,
    private actions$: Actions,
  ) {}

  ngOnInit(): void {
    this.videoGroupsFacade.loadBookmarkedVideos();
    this.onGroupVideosListScrollEnd();
    const routeSub = this.route.params.subscribe((params) => {
      this.groupId = +params.groupId;
      if (this.groupId) {
        const removeSub = this.actions$
          .pipe(
            ofType(removeGroupSuccess),
            extractPayload(),
            filter((id) => this.groupId === id),
            tap(() => this.router.navigateByUrl('/annotations/videos/groups')),
          )
          .subscribe();
        this.videoGroupsFacade.loadGroup(this.groupId);
        this.videoGroupsFacade.setVideoGroup(this.groupId);
        this.subscriptions.push(removeSub);
      }
    });

    const groupSub = this.videoGroup$.subscribe((group) => {
      if (group) {
        this.uiFacade.setTitle(`Video groups - ${group.name}`);
        this.videoGroupsFacade.loadGroupVideos(group.id);
      }
    });

    this.subscriptions.push(routeSub, groupSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.map((sub) => sub.unsubscribe());
  }

  onVideosFilterOfCurrentVideoGroup(query: string): void {
    const filter: VideosFilter = {
      type: VIDEOS_FILTER_TYPE.BY_NAME,
      param: query,
    };
    this.videoGroupsFacade.clearVideosOfCurrentVideoGroup();
    this.videoGroupsFacade.setFilterForVideosOfCurrentVideoGroup(filter);
    this.videoGroupsFacade.searchVideosByNameInCurrentVideoGroup(
      this.groupId,
      filter.param,
    );
  }

  onGroupVideosListScrollEnd(): void {
    this.currentVideosFilter$.subscribe((filter) => {
      if (this.groupId) {
        if (!filter) {
          this.videoGroupsFacade.loadNextGroupVideosBatch(this.groupId);
        } else {
          switch (filter.type) {
            case VIDEOS_FILTER_TYPE.BY_NAME: {
              this.videoGroupsFacade.searchVideosByNameInCurrentVideoGroup(
                this.groupId,
                filter.param,
              );
              break;
            }
          }
        }
      }
    });
  }

  accessEditPage(id: number): void {
    this.router.navigate(['/annotations/videos/groups', id, 'edit']);
  }

  onSetAnnotationProgressState(event: {
    videoId: number;
    state: VIDEO_ANNOTATION_STATE;
  }): void {
    this.videoGroupsFacade.setVideoAnnotationState(event.videoId, event.state);
  }

  onRetryVideoStats(video: Video): void {
    this.videoStatsStoreFacade.loadStatsForVideo(video.id);
  }

  async onDelete(video: Video): Promise<void> {
    this.videosStoreFacade.removeVideo(video.id);
  }

  onRenameVideo(videoId: number, name: string): void {
    this.videosStoreFacade.updateVideo({ id: videoId, name });
  }
}
