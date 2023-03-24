import { getTestBed, TestBed } from '@angular/core/testing';
import { StructureTrackerService } from './structure-tracker.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StartedStructureTracker } from '../models/structure-tracker.model';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('StructureTrackerService', () => {
  let injector;
  let service: StructureTrackerService;
  let httpMock: HttpTestingController;

  const structureTrackers: StartedStructureTracker[] = [
    { annotationId: 2 },
    { annotationId: 3 },
    { annotationId: 4 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StructureTrackerService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    injector = getTestBed();
    service = TestBed.get(StructureTrackerService);
    httpMock = injector.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVideoStructureTrackers', () => {
    it('should return an Observable', () => {
      const videoId = 1;

      service.getVideoStructureTrackers(videoId).subscribe((response) => {
        expect(response).toEqual(structureTrackers);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/structure-tracker/video/${videoId}`,
      );

      expect(req.request.method).toBe('GET');
      req.flush(structureTrackers);
    });
  });
});
