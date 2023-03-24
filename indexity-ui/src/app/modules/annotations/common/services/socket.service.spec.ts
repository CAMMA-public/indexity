import { TestBed } from '@angular/core/testing';
import { SocketService } from '@app/annotations/common/services/socket.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('SocketService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        SocketService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: SocketService = TestBed.get(SocketService);
    expect(service).toBeTruthy();
  });
});
