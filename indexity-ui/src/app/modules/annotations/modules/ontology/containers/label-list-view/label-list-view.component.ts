import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import {
  filter,
  map,
  skipWhile,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { LabelGroupsEffects } from '@app/annotations/store/label-groups/label-groups.effects';

@Component({
  selector: 'app-label-list-view',
  templateUrl: './label-list-view.component.html',
  styleUrls: ['./label-list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelListViewComponent implements OnInit {
  groupLabelsFilter$ = this.labelGroupsFacade.groupLabelsFilter$;

  labels$ = this.route.params.pipe(
    map((params) => +params.groupId),
    tap((id) => this.labelGroupsFacade.loadOne(id)), // refresh,
    switchMap((id) => this.labelGroupsFacade.getGroupById(id)),
    filter((g) => !!g),
    tap((g) => this.uiFacade.setTitle(`Ontology - ${g.name}`)),
    switchMap((g) => this.labelGroupsFacade.getFilteredGroupLabels(g.id)),
  );

  trackByFn = (i, l): number => l.id;

  constructor(
    private uiFacade: UiFacade,
    private route: ActivatedRoute,
    private labelGroupsFacade: LabelGroupsFacade,
    private labelGroupsEffects: LabelGroupsEffects,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.labelGroupsEffects.removeOne$
      .pipe(
        withLatestFrom(
          this.route.params.pipe(map((params) => +params.groupId)),
        ),
        skipWhile(
          ([{ payload: deletedGroup }, groupId]) => deletedGroup.id !== groupId,
        ),
        tap(() => this.router.navigate(['/annotations', 'ontology'])),
      )
      .subscribe();
  }

  onGroupLabelsSearch(q: string): void {
    this.labelGroupsFacade.filterGroupLabels(q);
  }
}
