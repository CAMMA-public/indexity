import { TestBed } from '@angular/core/testing';

import { TimelineStoreService } from './timeline-store.service';

describe('TimelineStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [TimelineStoreService]
  }));

  it('should be created', () => {
    const service: TimelineStoreService = TestBed.get(TimelineStoreService);
    expect(service).toBeTruthy();
  });
});
