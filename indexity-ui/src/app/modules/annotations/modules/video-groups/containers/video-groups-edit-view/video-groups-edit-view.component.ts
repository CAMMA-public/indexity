import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { UiFacade } from '@app/main-store/ui/ui.facade';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { GroupFormComponent } from '@app/annotations/components/group-form/group-form.component';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { isEqual } from 'lodash';
import {
  VIDEOS_FILTER_TYPE,
  VideosFilter,
} from '@app/annotations/models/videos-filter.model';
import { formatErrorMessage } from '@app/helpers/user.helpers';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { InfoMessageService } from '@app/services/info-message.service';

@Component({
  selector: 'app-video-groups-edit-view',
  templateUrl: './video-groups-edit-view.component.html',
  styleUrls: ['./video-groups-edit-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGroupsEditViewComponent implements OnInit, OnDestroy {
  videoGroup$: Observable<VideoGroup>;

  group: VideoGroup;
  selectedVideos$ = new BehaviorSubject<number[]>([]);
  selectedGroupVideos$ = new BehaviorSubject<number[]>([]);
  subscriptions: Subscription[] = [];

  highlightGroupVideosZone = false;
  highlightVideosZone = false;

  videos$ = this.videoGroupsFacade.filteredVideos$;
  groupVideos$ = this.videoGroupsFacade.filteredGroupVideos$;

  videosFilter$ = this.videoGroupsFacade.videosFilter$;
  groupVideosFilter$ = this.videoGroupsFacade.groupVideosFilter$;

  uploading$ = new BehaviorSubject(false);

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private videoGroupsFacade: VideoGroupsStoreFacade,
    private uiFacade: UiFacade,
    private labelGroupsFacade: LabelGroupsFacade,
    private videosApiService: VideosApiService,
    private infoMessageService: InfoMessageService,
  ) {}

  ngOnInit(): void {
    this.videoGroup$ = this.activatedRoute.params.pipe(
      map((params) => +params.groupId),
      distinctUntilChanged(),
      tap((groupId) => this.videoGroupsFacade.loadGroup(groupId)),
      switchMap((groupId) => this.videoGroupsFacade.getGroupById(groupId)),
      filter((g) => !!g),
      tap((group) => {
        this.group = group;
        this.videoGroupsFacade.setVideoGroup(this.group.id);
        this.uiFacade.setTitle(this.group.name);
        this.onGroupVideosListScrollEnd();
        this.onVideoListScrollEnd();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.map((s) => s.unsubscribe());
    this.uiFacade.resetTitle();
    this.videoGroupsFacade.clearGroupVideos();
    this.videoGroupsFacade.clearVideos();
    this.videoGroupsFacade.clearVideoFilterFromCurrentVideoGroup();
  }

  addVideosToGroup(e): void {
    if (
      !e.isPointerOverContainer &&
      e.distance.x * -1 > e.item.element.nativeElement.clientWidth / 2
    ) {
      this.videoGroupsFacade.addVideosToGroup(
        this.group.id,
        this.selectedVideos$.value,
      );
      this.selectedVideos$.next([]);
    }
  }

  removeVideosFromGroup(e): void {
    if (
      !e.isPointerOverContainer &&
      e.distance.x > e.item.element.nativeElement.clientWidth / 2
    ) {
      this.videoGroupsFacade.removeVideosFromGroup(
        this.group.id,
        this.selectedGroupVideos$.value,
      );
      this.selectedGroupVideos$.next([]);
    }
  }

  addVideoToGroup(id: number): void {
    this.videoGroupsFacade.addVideosToGroup(this.group.id, [id]);
  }

  removeVideoFromGroup(id: number): void {
    this.videoGroupsFacade.removeVideosFromGroup(this.group.id, [id]);
  }

  onGroupVideosListScrollEnd(): void {
    this.groupVideosFilter$.subscribe((filter) => {
      if (this.group && this.group.id) {
        if (!filter) {
          this.videoGroupsFacade.loadNextGroupVideosBatch(this.group.id);
        } else {
          switch (filter.type) {
            case VIDEOS_FILTER_TYPE.BY_NAME: {
              this.videoGroupsFacade.searchVideosByNameInCurrentVideoGroup(
                this.group.id,
                filter.param,
              );
              break;
            }
          }
        }
      }
    });
  }

  onVideoListScrollEnd(): void {
    this.videosFilter$.subscribe((filter) => {
      if (this.group && this.group.id) {
        if (!filter) {
          this.videoGroupsFacade.loadNextVideoBatchByExcludedIds(
            this.group.videoIds,
          );
        } else {
          switch (filter.type) {
            case VIDEOS_FILTER_TYPE.BY_NAME: {
              this.videoGroupsFacade.searchVideosAndExcludeIds(
                filter.param,
                this.group.videoIds,
              );
              break;
            }
          }
        }
      }
    });
  }

  accessGroupIndex(): void {
    this.router.navigate(['/annotations/videos/groups', this.group.id]);
  }

  async onGroupEdit(videoGroup: VideoGroup): Promise<void> {
    this.labelGroupsFacade.loadAll();
    const availableLabelGroups = await this.labelGroupsFacade.allLabelGroups$
      .pipe(take(2))
      .toPromise();
    if (videoGroup) {
      const matDialogConfig: MatDialogConfig = {
        width: '450px',
        data: {
          videoGroup,
          availableLabelGroups,
        },
        disableClose: false,
      };
      const dialogRef = this.dialog.open(GroupFormComponent, matDialogConfig);
      const data = await dialogRef.afterClosed().toPromise();
      if (data && !isEqual(data, videoGroup)) {
        this.videoGroupsFacade.updateGroup(data);
      }
    }
  }

  async onGroupUpload(formData: FormData): Promise<void> {
    this.uploading$.next(true);
    try {
      const uploadedVideos = await this.videosApiService.uploadVideos(formData);
      const videoIds = uploadedVideos.map((video) => video.id);
      this.videoGroupsFacade.addVideosToGroup(this.group.id, videoIds);
    } catch (e) {
      console.error(e);
      this.infoMessageService.setDialog('Upload error', formatErrorMessage(e));
    } finally {
      this.uploading$.next(false);
    }
  }

  onVideosFilterOfCurrentVideoGroup(filter: VideosFilter): void {
    if (filter && filter.param) {
      this.videoGroupsFacade.clearVideosOfCurrentVideoGroup();
      this.videoGroupsFacade.setFilterForVideosOfCurrentVideoGroup(filter);
      switch (filter.type) {
        case VIDEOS_FILTER_TYPE.BY_NAME: {
          this.videoGroupsFacade.searchVideosByNameInCurrentVideoGroup(
            this.group.id,
            filter.param,
          );
          break;
        }
      }
    } else {
      this.videoGroupsFacade.clearVideoFilterFromCurrentVideoGroup();
      this.videoGroupsFacade.clearVideosOfCurrentVideoGroup();
      this.onGroupVideosListScrollEnd();
    }
  }

  onVideosFilter(filter: VideosFilter): void {
    if (filter && filter.param) {
      this.videoGroupsFacade.clearVideos();
      switch (filter.type) {
        case VIDEOS_FILTER_TYPE.BY_NAME: {
          this.videoGroupsFacade.searchVideosAndExcludeIds(
            filter.param,
            this.group.videoIds,
          );
          break;
        }
      }
    } else {
      this.videoGroupsFacade.clearVideos();
      this.videoGroupsFacade.searchVideosAndExcludeIds(
        null,
        this.group.videoIds,
      );
    }
  }

  onVideoSelect(id: number): void {
    this.selectedGroupVideos$.next([]);
    const selected = this.selectedVideos$.value;
    const index = selected.indexOf(id);
    if (index < 0) {
      this.selectedVideos$.next([...selected, id]);
    } else {
      selected.splice(index, 1);
      this.selectedVideos$.next([...selected]);
    }
  }

  onVideosSelect(ids: number[]): void {
    this.selectedGroupVideos$.next([]);
    this.selectedVideos$.next(ids);
  }

  onGroupVideoSelect(id: number): void {
    this.selectedVideos$.next([]);
    const selected = this.selectedGroupVideos$.value;
    const index = selected.indexOf(id);
    if (index < 0) {
      this.selectedGroupVideos$.next([...selected, id]);
    } else {
      selected.splice(index, 1);
      this.selectedGroupVideos$.next([...selected]);
    }
  }

  onGroupVideosSelect(ids: number[]): void {
    this.selectedVideos$.next([]);
    this.selectedGroupVideos$.next(ids);
  }
}
