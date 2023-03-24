import { inject, TestBed } from '@angular/core/testing';
import { AnnotationsService } from './annotations.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Annotation } from '@app/annotations/common/models/annotation.model';
import { AnnotationsSocketService } from '@app/annotations/common/services/annotations-socket.service';
import { Type } from '@angular/core';
import { of } from 'rxjs';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('AnnotationsService', () => {
  let annotationsService: AnnotationsService;
  let annotationsSocketService: AnnotationsSocketService;
  let httpMock: HttpTestingController;
  let dummyAnnotations: Annotation[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnotationsService,
        AnnotationsSocketService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
      imports: [HttpClientTestingModule],
    });
    annotationsService = TestBed.get(AnnotationsService);
    annotationsSocketService = TestBed.get(AnnotationsSocketService);
    httpMock = TestBed.get(
      HttpTestingController as Type<HttpTestingController>,
    );
    annotationsSocketService.join(1);

    dummyAnnotations = [
      {
        id: 1,
        videoId: 1,
        category: 'comment',
        timestamp: 5200,
        duration: 1000,
        description: 'comment',
        isOneShot: false,
      },
      {
        id: 2,
        videoId: 1,
        category: 'action',
        timestamp: 6000,
        duration: 1500,
        description: 'Surgeon right hand using [Grasper]',
        isOneShot: false,
      },
      {
        id: 3,
        videoId: 1,
        category: 'phase',
        timestamp: 0,
        duration: 96,
        isOneShot: false,
        description: 'Preparation',
      },
      {
        id: 4,
        videoId: 1,
        category: 'svg',
        timestamp: 476,
        duration: 5,
        isOneShot: false,
        label: {
          name: 'label',
          color: '#b31111',
          type: 'structure',
        },
        shape: {
          positions: {
            476: {
              x: 26.566159250585482,
              y: 23.75,
              width: 28.455308352849336,
              height: 21.25,
            },
            479: {
              x: 35.77576112412178,
              y: 32.083333333333336,
              width: 28.455308352849336,
              height: 21.25,
            },
          },
        },
      },
    ];
  });

  afterEach(() => {
    httpMock.verify();
    annotationsSocketService.leave(1);
  });

  it('should be created', inject(
    [AnnotationsService],
    (service: AnnotationsService) => {
      expect(service).toBeDefined();
    },
  ));

  it('should have joined room 1', () => {
    expect(annotationsSocketService.currentVideoId).toBe(1);
  });

  describe('#listAnnotations', () => {
    it('should return an Observable<Annotation[]>', () => {
      spyOn(annotationsService, 'listAnnotations').and.returnValue(
        of(dummyAnnotations),
      );
      annotationsService.listAnnotations(1).subscribe((annotations) => {
        expect(annotations.length).toBe(4);
        expect(annotations).toEqual(dummyAnnotations);
      });
    });
  });

  describe('#create', () => {
    it('should return an Promise<DataResponse<Annotation>>', () => {
      const annotation: Annotation = { ...dummyAnnotations[0], id: 5 };
      annotationsService.create(annotation).subscribe((created) => {
        expect(created).toEqual(annotation);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/annotations`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(annotation);
    });
  });

  describe('#remove', () => {
    it('should return an Promise<number>', () => {
      const annotationId = 1;
      annotationsService.remove(annotationId).subscribe((destroyed) => {
        expect(destroyed.id).toBe(annotationId);
      });
      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/annotations/${annotationId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({
        id: annotationId,
      });
    });
  });
});
