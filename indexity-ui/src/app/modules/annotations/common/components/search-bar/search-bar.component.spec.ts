import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VIDEOS_FILTER_TYPE } from '@app/annotations/models/videos-filter.model';
import { ROOT_REDUCERS } from '@app/main-store';
import { MaterialCustomModule } from '@app/modules';
import * as fromVideos from '@app/videos/store';
import { VideosStoreFacade } from '@app/videos/store/videos/videos.store-facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchBarComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialCustomModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(ROOT_REDUCERS),
        StoreModule.forFeature('videos', fromVideos.reducers),
        EffectsModule.forRoot([]),
      ],
      providers: [VideosStoreFacade],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set isClearFilterButtonDisabled to true', () => {
    expect(component.isClearFilterButtonDisabled).toBeTrue();
  });

  it("ngOnInit - should set labelColor to '#ffffff'", () => {
    expect(component.labelColor).toEqual('#ffffff');
  });

  it('ngOnInit - should store Observable subscription', () => {
    component.ngOnInit();
    expect(component.filterSub).toBeInstanceOf(Subscription);
    expect(component.filterSelectorSub).toBeInstanceOf(Subscription);
  });

  it('ngOnInit - should call patchFilterValue if a filter is set', () => {
    component.currentFilter = {
      param: '',
      type: VIDEOS_FILTER_TYPE.BY_NAME,
    };
    const patchFilterValueSpy = spyOn(component, 'patchFilterValue');
    component.ngOnInit();
    expect(patchFilterValueSpy).toHaveBeenCalled();
  });

  it('should set isClearFilterButtonDisabled to false if the label filter contains a value', (done) => {
    const sub = component.onLabelNameFilterChange();
    sub.subscribe(() => {
      expect(component.isClearFilterButtonDisabled).toBeFalse();
      done();
    });
    component.labelNameFilterControl.setValue('ggg');
  });

  it('should set isClearFilterButtonDisabled to false if the name filter contains a value', (done) => {
    const sub = component.onNameFilterChange();
    sub.subscribe(() => {
      expect(component.isClearFilterButtonDisabled).toBeFalse();
      done();
    });
    component.nameFilterControl.setValue('video');
  });

  it('onLabelSelect - should update the labelNameFilterControl value', () => {
    const change = {
      source: {
        value: {
          color: '#007aff',
          name: 'ggg',
          type: 'structure',
        },
      },
    };
    component.onLabelSelect(change);
    expect(component.labelNameFilterControl.value).toEqual('ggg');
  });

  it('onLabelSelect - should update the label color value', () => {
    const change = {
      source: {
        value: {
          color: '#007aff',
          name: 'ggg',
          type: 'structure',
        },
      },
    };
    component.onLabelSelect(change);
    expect(component.labelColor).toEqual('#007aff');
  });

  it('onAutoCompleteSelected - should update the labelNameFilterControl value', () => {
    const matOption = new MatOption(null, null, null, null);
    matOption.value = {
      name: 'ggg',
      color: '#007aff',
    };
    const change = new MatAutocompleteSelectedEvent(null, matOption);
    component.onAutoCompleteSelected(change);
    expect(component.labelNameFilterControl.value).toEqual('ggg');
  });

  it('onAutoCompleteSelected - should update the label color value', () => {
    const matOption = new MatOption(null, null, null, null);
    matOption.value = {
      name: 'ggg',
      color: '#007aff',
    };
    const change = new MatAutocompleteSelectedEvent(null, matOption);
    component.onAutoCompleteSelected(change);
    expect(component.labelColor).toEqual('#007aff');
  });

  it('clearFilter - should reset the nameFilterControl', () => {
    component.filterSelectorControl.setValue(VIDEOS_FILTER_TYPE.BY_NAME);
    component.clearFilter();
    expect(component.nameFilterControl.value).toBeNull();
  });

  it('clearFilter - should reset the annotationStatusFilterControl', () => {
    component.filterSelectorControl.setValue(
      VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE,
    );
    component.clearFilter();
    expect(component.annotationStatusFilterControl.value).toBeNull();
  });

  it('clearFilter - should reset the labelNameFilterControl', () => {
    component.filterSelectorControl.setValue(
      VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME,
    );
    component.clearFilter();
    expect(component.labelNameFilterControl.value).toBeNull();
  });

  it('clearFilter - should emit a null value', () => {
    const emitSpy = spyOn(component.filter, 'emit').and.returnValue(null);
    component.clearFilter();
    expect(emitSpy).toHaveBeenCalledWith(null);
  });

  it('clearFilter - should set isClearFilterButtonDisabled to true', () => {
    component.clearFilter();
    expect(component.isClearFilterButtonDisabled).toBeTrue();
  });

  it('patchFilterValue - should patch filterSelectorControl value', () => {
    component.currentFilter = {
      type: VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME,
      param: '',
    };
    component.patchFilterValue();
    expect(component.filterSelectorControl.value).toEqual(
      VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME,
    );
  });

  it('patchFilterValue - should patch nameFilterControl value', () => {
    component.currentFilter = {
      type: VIDEOS_FILTER_TYPE.BY_NAME,
      param: 'test',
    };
    component.patchFilterValue();
    expect(component.nameFilterControl.value).toEqual('test');
  });

  it('patchFilterValue - should patch annotationStatusFilterControl value', () => {
    component.currentFilter = {
      type: VIDEOS_FILTER_TYPE.BY_ANNOTATION_PROGRESS_STATE,
      param: 'NEW',
    };
    component.patchFilterValue();
    expect(component.annotationStatusFilterControl.value).toEqual('NEW');
  });

  it('patchFilterValue - should patch labelNameFilterControl value', () => {
    component.currentFilter = {
      type: VIDEOS_FILTER_TYPE.BY_ANNOTATION_LABEL_NAME,
      param: 'test',
    };
    component.patchFilterValue();
    expect(component.labelNameFilterControl.value).toEqual('test');
  });
});
