import { TestBed } from '@angular/core/testing';

import { AnnotationLabelsSocketService } from './annotation-labels-socket.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('AnnotationLabelsSocketService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        AnnotationLabelsSocketService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: AnnotationLabelsSocketService = TestBed.get(
      AnnotationLabelsSocketService,
    );
    expect(service).toBeTruthy();
  });
});
