import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { User } from '@app/models/user';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { UiFacade } from '@app/main-store/ui/ui.facade';

@Component({
  selector: 'app-video-groups-edit-view',
  templateUrl: './video-group-users-edit-view.component.html',
  styleUrls: ['./video-group-users-edit-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGroupUsersEditViewComponent implements OnInit, OnDestroy {
  users$: Observable<User[]> = this.videoGroupsFacade.users$;
  groupUsers$: Observable<User[]> = this.videoGroupsFacade.groupUsers$;

  videoGroup: VideoGroup;

  groupUsersFilter: string;
  usersFilter: string;

  subscriptions: Subscription[] = [];

  usersTrackByFn = (i, u): number => u.id;

  constructor(
    private videoGroupsFacade: VideoGroupsStoreFacade,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private uiFacade: UiFacade,
  ) {}

  ngOnInit(): void {
    const routeSub = this.activatedRoute.params
      .pipe(
        map((params) => +params.groupId),
        distinctUntilChanged(),
        tap((groupId) => this.videoGroupsFacade.loadGroup(groupId)),
        switchMap((groupId) => this.videoGroupsFacade.getGroupById(groupId)),
        filter((g) => !!g),
        tap((group) => {
          this.videoGroup = group;
          this.uiFacade.setTitle(group.name);
          this.videoGroupsFacade.setVideoGroup(group.id);
          this.loadNextUsersBatch();
          this.loadNextGroupUsersBatch();
        }),
      )
      .subscribe();

    const groupUsersFilterSub = this.videoGroupsFacade.groupUsersFilter$
      .pipe(
        tap((filter) => {
          this.groupUsersFilter = filter;
        }),
      )
      .subscribe();

    const usersFilterSub = this.videoGroupsFacade.usersFilter$
      .pipe(
        tap((filter) => {
          this.usersFilter = filter;
        }),
      )
      .subscribe();

    this.subscriptions.push(routeSub, groupUsersFilterSub, usersFilterSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.map((s) => s.unsubscribe());
    this.uiFacade.resetTitle();
    this.videoGroupsFacade.clearUsers();
    this.videoGroupsFacade.clearGroupUsers();
    this.videoGroupsFacade.clearGroupVideos();
  }

  accessGroupIndex(): void {
    this.router.navigate(['/annotations/videos/groups', this.videoGroup.id]);
  }

  onAddToGroup(userId): void {
    this.videoGroupsFacade.addUserToGroup(this.videoGroup.id, userId);
  }

  onRemoveFromGroup(userId): void {
    this.videoGroupsFacade.removeUserFromGroup(this.videoGroup.id, userId);
  }

  onGroupUsersFilter(filter: string): void {
    this.videoGroupsFacade.clearGroupUsers();

    if (filter) {
      this.videoGroupsFacade.setFilterForGroupUsers(filter);
      this.videoGroupsFacade.loadNextFilteredGroupUsersBatch(
        this.videoGroup.id,
        filter,
      );
    } else {
      this.videoGroupsFacade.clearGroupUsersFilter();
      this.videoGroupsFacade.loadNextGroupUsersBatch(this.videoGroup.id);
    }
  }

  onUsersFilter(filter: string): void {
    this.videoGroupsFacade.clearUsers();

    if (filter) {
      this.videoGroupsFacade.setUsersFilter(filter);
      this.videoGroupsFacade.loadNextFilteredUsersBatchWithout(
        filter,
        this.videoGroup.allowedUserIds,
      );
    } else {
      this.videoGroupsFacade.clearUsersFilter();
      this.videoGroupsFacade.loadNextUsersBatchWithout(
        this.videoGroup.allowedUserIds,
      );
    }
  }

  loadNextGroupUsersBatch(): void {
    if (this.groupUsersFilter) {
      this.videoGroupsFacade.loadNextFilteredGroupUsersBatch(
        this.videoGroup.id,
        this.groupUsersFilter,
      );
    } else {
      this.videoGroupsFacade.loadNextGroupUsersBatch(this.videoGroup.id);
    }
  }

  loadNextUsersBatch(): void {
    if (this.usersFilter) {
      this.videoGroupsFacade.loadNextFilteredUsersBatchWithout(
        this.usersFilter,
        this.videoGroup.allowedUserIds,
      );
    } else {
      this.videoGroupsFacade.loadNextUsersBatchWithout(
        this.videoGroup.allowedUserIds,
      );
    }
  }
}
