import { TestBed } from '@angular/core/testing';

import { VideoAnnotationStateLiveService } from './video-annotation-state-live.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../test-constants';

describe('VideoAnnotationStateLiveService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        VideoAnnotationStateLiveService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: VideoAnnotationStateLiveService = TestBed.get(
      VideoAnnotationStateLiveService,
    );
    expect(service).toBeTruthy();
  });
});
