import { TestBed } from '@angular/core/testing';

import { AnnotationsSocketService } from './annotations-socket.service';
import { ANNOTATION_INTERPOLATE } from '@app/annotations/common/models/annotation-socket-events';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('AnnotationsSocketService', () => {
  let service: AnnotationsSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnotationsSocketService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    service = TestBed.get(AnnotationsSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setInterpolation', () => {
    it('should emit a message with given parameters', () => {
      const withInterpolation = true;
      const step = 100;
      const expectedPayload = { withInterpolation, step };

      spyOn(service, 'emit');
      service.setInterpolation(withInterpolation, step);

      expect(service.emit).toHaveBeenCalledWith(
        ANNOTATION_INTERPOLATE,
        expectedPayload,
      );
    });
  });
});
