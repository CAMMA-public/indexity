import { TestBed } from '@angular/core/testing';
import { VideosSocketService } from './videos-socket.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('VideosSocketService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        VideosSocketService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: VideosSocketService = TestBed.get(VideosSocketService);
    expect(service).toBeTruthy();
  });
});
