import { TestBed } from '@angular/core/testing';

import { TimelinePlayerService } from './timeline-player.service';
import {TimelineStoreService} from './timeline-store.service';

describe('TimelinePlayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TimelineStoreService,
      TimelinePlayerService
    ]
  }));

  it('should be created', () => {
    const service: TimelinePlayerService = TestBed.get(TimelinePlayerService);
    expect(service).toBeTruthy();
  });
});
