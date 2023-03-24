import { TestBed } from '@angular/core/testing';

import { VideoGroupsSocketService } from './video-groups-socket.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('VideoGroupsSocketService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        VideoGroupsSocketService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: VideoGroupsSocketService = TestBed.get(
      VideoGroupsSocketService,
    );
    expect(service).toBeTruthy();
  });
});
