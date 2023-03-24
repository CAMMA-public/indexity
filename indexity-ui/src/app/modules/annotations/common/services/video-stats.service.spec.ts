import { TestBed } from '@angular/core/testing';

import { VideoStatsService } from './video-stats.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('VideoStatsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VideoStatsService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: VideoStatsService = TestBed.get(VideoStatsService);
    expect(service).toBeTruthy();
  });
});
