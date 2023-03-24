import { TestBed } from '@angular/core/testing';

import { AnnotationLabelsService } from './annotation-labels.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('AnnotationLabelsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnnotationLabelsService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: AnnotationLabelsService = TestBed.get(
      AnnotationLabelsService,
    );
    expect(service).toBeTruthy();
  });
});
