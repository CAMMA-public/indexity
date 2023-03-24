import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineSidebarComponent } from './timeline-sidebar.component';
import {TimelineStoreService} from 'ngx-event-timeline';

describe('TimelineSidebarComponent', () => {
  let component: TimelineSidebarComponent;
  let fixture: ComponentFixture<TimelineSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineSidebarComponent ],
      providers: [TimelineStoreService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
