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
import { FilterListComponent } from '../../models/list-component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() listComponentRef: FilterListComponent<any>;
  searchControl = new FormControl();
  @Output() search = new EventEmitter<string>();
  sub: Subscription;

  ngOnInit(): void {
    this.sub = this.searchControl.valueChanges
      .pipe(
        tap((q) => {
          if (this.listComponentRef) {
            this.listComponentRef.filterCollection(q);
          }
        }),
      )
      .subscribe(this.search);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
