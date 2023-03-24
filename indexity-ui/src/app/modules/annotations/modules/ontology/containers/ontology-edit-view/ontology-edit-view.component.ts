import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnnotationLabelsStoreFacade } from '@app/annotation-labels-store/annotation-labels-store-facade.service';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { combineLatest, Observable } from 'rxjs';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';
import { Location } from '@angular/common';
import { SvgAnnotationFormDialogComponent } from '@indexity/annotations';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ontology-edit-view',
  templateUrl: './ontology-edit-view.component.html',
  styleUrls: ['./ontology-edit-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyEditViewComponent implements OnInit {
  allLabels$ = combineLatest([
    this.annotationsLabelsFacade.allLabels$,
    this.annotationsLabelsFacade.searchResults$,
  ]).pipe(
    map(([labels, search]) =>
      search.length || this.labelsSearchQ.length ? search : labels,
    ),
  );
  labelGroup$: Observable<AnnotationLabelGroup>;
  groupLabels$: Observable<AnnotationLabel[]>;
  groupId: number;
  labelsSearchQ = '';

  labelTrackByFn = (i, l): number => l.id;

  constructor(
    private annotationsLabelsFacade: AnnotationLabelsStoreFacade,
    private labelGroupsFacade: LabelGroupsFacade,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.annotationsLabelsFacade.fetchAll();

    this.labelGroup$ = this.route.params.pipe(
      map((params) => Number(params.groupId)),
      tap((id) => this.labelGroupsFacade.loadOne(id)),
      switchMap((id) => this.labelGroupsFacade.getGroupById(id)),
      filter((g) => !!g),
      tap((group) => (this.groupId = group.id)),
    );

    this.groupLabels$ = this.labelGroup$.pipe(map((g) => g.labels));
  }

  onGoBack(): void {
    this.location.back();
  }

  onAddToGroup(labelName: string): void {
    this.labelGroupsFacade.addToGroup(this.groupId, [labelName]);
  }

  onRemoveFromGroup(labelName: string): void {
    this.labelGroupsFacade.removeFromGroup(this.groupId, [labelName]);
  }

  onLabelsSearch(q: string): void {
    this.labelsSearchQ = q;
    this.annotationsLabelsFacade.search(q);
  }

  onCreateLabelAndAddToGroup(): void {
    const dialogRef = this.dialog.open(SvgAnnotationFormDialogComponent, {
      width: '600px',
      data: {},
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(({ name, color, type }) => {
      if (name && color && type) {
        this.annotationsLabelsFacade.createLabelAndAddToGroup(
          { name, color, type },
          this.groupId,
        );
      }
    });
  }
}
