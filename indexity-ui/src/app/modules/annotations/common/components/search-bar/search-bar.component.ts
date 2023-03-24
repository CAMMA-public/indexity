import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AnnotationLabel } from '@app/annotations/models/annotation-label.model';
import {
  VIDEOS_FILTER_TYPE,
  VideosFilter,
} from '@app/annotations/models/videos-filter.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { videoAnnotationProgressStateToLabel } from '@app/videos/helpers/video.helpers';
import { merge, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() currentFilter: VideosFilter;
  @Input() labels: AnnotationLabel[];
  @Input() enabledFilers: string[] = [
    VIDEOS_FILTER_TYPE.BY_NAME,
    VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME,
    VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE,
  ];
  @Output() filter = new EventEmitter<VideosFilter>();

  filterSelectorControl = new FormControl('BY_NAME');
  nameFilterControl = new FormControl('');
  labelNameFilterControl = new FormControl('');
  annotationStatusFilterControl = new FormControl('');

  isClearFilterButtonDisabled: boolean;

  annotationProgressStatuses = Object.values(VIDEO_ANNOTATION_STATE).map(
    (state) => ({
      value: state,
      name: videoAnnotationProgressStateToLabel(state),
    }),
  );

  filterSub: Subscription;
  filterSelectorSub: Subscription;
  labelColor: string;

  ngOnInit(): void {
    this.isClearFilterButtonDisabled = true;
    this.labelColor = '#ffffff';
    this.filterSub = merge(
      this.onNameFilterChange(),
      this.onAnnotationStatusFilterChange(),
      this.onLabelNameFilterChange(),
    ).subscribe((value) => {
      if (value.param === null) {
        return;
      }
      return this.filter.emit(value);
    });

    this.filterSelectorSub = this.filterSelectorControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.clearFilter());

    if (this.currentFilter) {
      this.patchFilterValue();
    }
  }

  onNameFilterChange(): Observable<VideosFilter> {
    return this.nameFilterControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((value) => {
        if (value) {
          this.isClearFilterButtonDisabled = false;
        }
        return {
          type: VIDEOS_FILTER_TYPE.BY_NAME,
          param: value,
        };
      }),
    );
  }

  onAnnotationStatusFilterChange(): Observable<VideosFilter> {
    return this.annotationStatusFilterControl.valueChanges.pipe(
      distinctUntilChanged(),
      map((value) => {
        this.isClearFilterButtonDisabled = false;
        return {
          type: VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE,
          param: value,
        };
      }),
    );
  }

  onLabelNameFilterChange(): Observable<VideosFilter> {
    return this.labelNameFilterControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((value) => {
        if (value) {
          this.isClearFilterButtonDisabled = false;
        }
        return {
          type: VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME,
          param: value,
        };
      }),
    );
  }

  patchFilterValue(): void {
    this.filterSelectorControl.patchValue(this.currentFilter.type);

    switch (this.currentFilter.type) {
      case VIDEOS_FILTER_TYPE.BY_NAME:
        this.nameFilterControl.patchValue(this.currentFilter.param);
        break;
      case VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE:
        this.annotationStatusFilterControl.patchValue(this.currentFilter.param);
        break;
      case VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME:
        this.labelNameFilterControl.patchValue(this.currentFilter.param);
        break;
    }
  }

  clearFilter(): void {
    switch (this.filterSelectorControl.value) {
      case VIDEOS_FILTER_TYPE.BY_NAME:
        this.nameFilterControl.reset();
        break;
      case VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE:
        this.annotationStatusFilterControl.reset();
        break;
      case VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME:
        this.labelNameFilterControl.reset();
        break;
    }
    this.filter.emit(null);
    this.isClearFilterButtonDisabled = true;
  }

  onLabelSelect(change): void {
    const label = change.source.value;
    this.labelNameFilterControl.setValue(label.name);
    this.labelColor = label.color;
  }

  onAutoCompleteSelected(e: MatAutocompleteSelectedEvent): void {
    const label = e.option.value;
    this.labelNameFilterControl.setValue(label.name);
    this.labelColor = label.color;
  }

  ngOnDestroy(): void {
    this.filterSub.unsubscribe();
    this.filterSelectorSub.unsubscribe();
  }
}
