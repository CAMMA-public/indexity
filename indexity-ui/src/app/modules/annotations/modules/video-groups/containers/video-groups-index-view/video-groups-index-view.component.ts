import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupFormComponent } from '@app/annotations/components/group-form/group-form.component';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { VideoGroupItemComponent } from '@app/annotations/modules/video-groups/components/video-group-item/video-group-item.component';
import { InfoMessageService } from '@app/services/info-message.service';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { combineLatest, Subscription } from 'rxjs';
import { filter, map, pluck, take } from 'rxjs/operators';
import { InfoDialogComponent } from '../../../../../../core/components/info-dialog/info-dialog.component';
import { ConfigurationService } from 'angular-configuration-module';

@Component({
  selector: 'app-video-groups-index-view',
  templateUrl: './video-groups-index-view.component.html',
  styleUrls: ['./video-groups-index-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGroupsIndexViewComponent implements OnInit, OnDestroy {
  groupsFilter$ = this.videoGroupsFacade.groupsFilter$.pipe(filter((f) => !!f));
  videoGroups$ = this.videoGroupsFacade.filteredGroups$;
  currentUserId$ = this.usersFacade.currentUser$.pipe(pluck('id'));
  userCanManageVideosGroups$ = combineLatest([
    this.usersFacade.userIsAdmin$,
    this.usersFacade.userIsModerator$,
  ]).pipe(map(([isAdmin, isModerator]) => isAdmin || isModerator));
  videoGroup$ = this.videoGroupsFacade.videoGroup$;

  subscriptions: Subscription[] = [];
  groupId: number;

  enableGroupPermissions: boolean = JSON.parse(
    this.configurationService.configuration.enableGroupPermissions,
  );

  @ViewChildren(VideoGroupItemComponent) groupItems!: QueryList<
    VideoGroupItemComponent
  >;

  videoGroupTrackBy = (i, group: VideoGroup): number => group.id;

  constructor(
    private videoGroupsFacade: VideoGroupsStoreFacade,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private uiFacade: UiFacade,
    private infoMessageService: InfoMessageService,
    private usersFacade: UsersFacade,
    private labelGroupsFacade: LabelGroupsFacade,
    private readonly configurationService: ConfigurationService,
  ) {}

  ngOnInit(): void {
    this.videoGroupsFacade.loadAllGroups();
    this.onLoadNextGroups();
    this.uiFacade.setTitle('Video groups');
    const groupSub = this.videoGroup$.subscribe((g) => {
      if (g) {
        this.groupId = g.id;
      }
    });
    const messageSub = this.infoMessageService.message$.subscribe(
      async (message) => {
        if (message) {
          if (message.redirect) {
            await this.router.navigate(['/annotations/videos/groups']);
          }
          const snackBarRef = this.snackBar.open(message.content, null, {
            duration: 3000,
          });
          snackBarRef
            .afterDismissed()
            .pipe(map(() => this.infoMessageService.setMessage(null)));
        }
      },
    );
    const dialogSub = this.infoMessageService.dialogMessage$.subscribe(
      ({ title, message }) => {
        this.dialog.open(InfoDialogComponent, { data: { title, message } });
      },
    );
    this.subscriptions.push(messageSub, groupSub, dialogSub);
  }

  onLoadNextGroups(): void {
    this.videoGroupsFacade.loadNextGroupBatch();
  }

  ngOnDestroy(): void {
    this.videoGroupsFacade.clearVideoGroupsFilter();
    this.uiFacade.resetTitle();
    this.subscriptions.map((s) => s.unsubscribe());
  }

  async onGroupRemove(id: number): Promise<void> {
    const confirm = await this.infoMessageService.setConfirm(
      'Confirm suppression',
      'Are you sure you want to delete this dataset?',
    );
    if (confirm) {
      this.videoGroupsFacade.removeGroup(id);
    }
  }

  async loadVideos(ev, id: number): Promise<void> {
    if (
      ev.target &&
      ev.target.localName !== 'mat-icon' &&
      ev.target.localName !== 'button' &&
      ev.target.className !== 'mat-button-wrapper'
    ) {
      await this.router.navigate([id], {
        relativeTo: this.route,
      });
    }
  }

  async accessEditPage(id: number): Promise<void> {
    await this.router.navigate(['/annotations/videos/groups', id, 'edit']);
  }

  async accessUsersPage(id: number): Promise<void> {
    await this.router.navigate(['/annotations/videos/groups', id, 'users']);
  }

  searchGroups(query: string): void {
    this.videoGroupsFacade.searchGroups(query);
  }

  async createGroup(): Promise<void> {
    this.labelGroupsFacade.loadAll();
    const availableLabelGroups = await this.labelGroupsFacade.allLabelGroups$
      .pipe(take(2))
      .toPromise();

    const matDialogConfig: MatDialogConfig = {
      width: '450px',
      data: {
        availableLabelGroups,
      },
      disableClose: false,
    };
    const dialogRef = this.dialog.open(GroupFormComponent, matDialogConfig);
    const data = await dialogRef.afterClosed().toPromise();
    if (data) {
      this.videoGroupsFacade.createGroup(data);
    }
  }

  async onLabelGroupClick(g: AnnotationLabelGroup): Promise<void> {
    await this.router.navigate(['/annotations', 'ontology', g.id]);
  }
}
