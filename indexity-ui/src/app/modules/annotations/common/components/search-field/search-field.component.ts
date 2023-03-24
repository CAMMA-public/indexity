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
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFieldComponent implements OnInit, OnDestroy {
  @Input() initialValue = '';
  @Input() placeholder = 'Search...';
  @Input() debounce = 400;
  @Output() search = new EventEmitter<string>();

  searchFieldControl = new FormControl('');

  valueChangesSub: Subscription;

  ngOnInit(): void {
    if (this.initialValue) {
      this.searchFieldControl.patchValue(this.initialValue, {
        emitEvent: false,
      });
    }

    this.valueChangesSub = this.searchFieldControl.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(this.search);
  }

  ngOnDestroy(): void {
    this.valueChangesSub.unsubscribe();
  }
}
