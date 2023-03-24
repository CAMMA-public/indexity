import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineCursorComponent } from './timeline-cursor.component';
import {TimelineStoreService} from 'ngx-event-timeline';

describe('TimelineCursorComponent', () => {
  let component: TimelineCursorComponent;
  let fixture: ComponentFixture<TimelineCursorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineCursorComponent ],
      providers: [TimelineStoreService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineCursorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
