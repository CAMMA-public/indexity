import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { Observable } from 'rxjs';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GroupFormComponent } from '@app/annotations/components/group-form/group-form.component';
import { map, tap } from 'rxjs/operators';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/models/user';
import { userIsModOrAdmin } from '@app/helpers/user.helpers';
import { VideoGroup } from '@app/annotations/models/video-group.model';
import { InfoMessageService } from '@app/services/info-message.service';

@Component({
  selector: 'app-ontology-index-view',
  templateUrl: './ontology-index-view.component.html',
  styleUrls: ['./ontology-index-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyIndexViewComponent implements OnInit {
  groups$: Observable<AnnotationLabelGroup[]> = this.labelGroupsFacade
    .filteredLabelGroups$;
  groupsFilter$ = this.labelGroupsFacade.groupsFilter$;
  groupLabelsFilter$ = this.labelGroupsFacade.groupLabelsFilter$;

  currentUser$ = this.usersFacade.currentUser$.pipe(
    tap((u) => (this.currentUser = u)),
  );
  currentUser: User;
  trackByFn = (i, g): number => g.id;

  constructor(
    private labelGroupsFacade: LabelGroupsFacade,
    private uiFacade: UiFacade,
    public dialog: MatDialog,
    private usersFacade: UsersFacade,
    private router: Router,
    private route: ActivatedRoute,
    private infoMessageService: InfoMessageService,
  ) {}

  ngOnInit(): void {
    this.uiFacade.setTitle('Ontology');
    this.labelGroupsFacade.loadAll();
  }

  onGroupsSearch(q: string): void {
    this.labelGroupsFacade.filterGroups(q);
  }

  async createGroup(): Promise<void> {
    const matDialogConfig: MatDialogConfig = {
      width: '450px',
      data: {},
      disableClose: false,
    };
    const dialogRef = this.dialog.open(GroupFormComponent, matDialogConfig);
    const data = await dialogRef.afterClosed().toPromise();
    if (data) {
      this.labelGroupsFacade.createGroup(data);
    }
  }

  removeGroup(id: number): void {
    this.labelGroupsFacade.removeGroup(id);
  }

  async onGroupManage(g: AnnotationLabelGroup): Promise<void> {
    if (
      g.userId === this.currentUser.id ||
      userIsModOrAdmin(this.currentUser)
    ) {
      await this.router.navigate(['/annotations/ontology', g.id, 'edit']);
    }
  }

  async onGroupDelete(id: number): Promise<void> {
    const confirm = await this.infoMessageService.setConfirm(
      'Confirm suppression',
      `Are you sure you want to delete this ontology?`,
    );
    if (confirm) {
      this.labelGroupsFacade.removeGroup(id);
    }
  }

  userCanManageGroup(group: AnnotationLabelGroup): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user) => userIsModOrAdmin(user) || user.id === group.userId),
    );
  }

  onVideoGroupClick(g: VideoGroup): void {
    this.router.navigate(['/annotations', 'videos', 'groups', g.id]);
  }

  onOntologyClick(g: AnnotationLabelGroup): void {
    this.router.navigate([g.id], { relativeTo: this.route });
  }
}
