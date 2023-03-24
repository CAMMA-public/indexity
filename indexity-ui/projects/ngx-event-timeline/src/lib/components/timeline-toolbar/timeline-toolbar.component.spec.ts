import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineToolbarComponent } from './timeline-toolbar.component';
import {TimelinePlayerService, TimelineStoreService} from 'ngx-event-timeline';

describe('TimelineToolbarComponent', () => {
  let component: TimelineToolbarComponent;
  let fixture: ComponentFixture<TimelineToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineToolbarComponent ],
      providers: [TimelineStoreService,  TimelinePlayerService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
