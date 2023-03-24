import { TestBed } from '@angular/core/testing';

import { AnnotationLabelGroupsService } from './annotation-label-groups.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('LabelGroupsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnnotationLabelGroupsService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }),
  );

  it('should be created', () => {
    const service: AnnotationLabelGroupsService = TestBed.get(
      AnnotationLabelGroupsService,
    );
    expect(service).toBeTruthy();
  });
});
