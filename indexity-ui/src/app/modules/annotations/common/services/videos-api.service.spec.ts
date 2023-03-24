import { getTestBed, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { VideosApiService } from '@app/annotations/services/videos-api.service';
import { Video } from '@app/annotations/modules/videos/models/video.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';

describe('VideosApiService', () => {
  let injector;
  let service: VideosApiService;
  let httpMock: HttpTestingController;

  const videos: PaginatedResponse<Video> = {
    data: [
      {
        id: 8,
        name: 'video01.mp4',
        thumbnailUrl: 'samples/video01.mp4_thumbnail.jpg',
        url: 'samples/video01.mp4',
        annotationState: VIDEO_ANNOTATION_STATE.ANNOTATION_PENDING,
      },
      {
        id: 9,
        name: 'video02.mp4',
        thumbnailUrl: 'samples/video02.mp4_thumbnail.jpg',
        url: 'samples/video02.mp4',
        annotationState: VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED,
      },
      {
        id: 14,
        name: 'video07.mp4',
        thumbnailUrl: 'samples/video07.mp4_thumbnail.jpg',
        url: 'samples/video07.mp4',
      },
    ],
    total: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VideosApiService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    injector = getTestBed();
    service = injector.get(VideosApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVideos', () => {
    it('should return an Observable', () => {
      const expected = videos.data.map((video) => ({
        ...video,
        url: `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${video.id}/media`,
      }));

      service.getVideos().subscribe(
        (response) => {
          expect(response.length).toBe(videos.data.length);
          expect(response).toEqual(expected);
        },
        (err) => console.error(err),
      );

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos?offset=0&limit=15`,
      );

      req.flush(videos);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos`,
      );
    });
  });

  describe('show', () => {
    it('should return an Observable<Video>', () => {
      const id = 8;
      const expected = {
        ...videos.data[0],
        url: `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${id}/media`,
      };

      service.show(id).subscribe((response) => {
        expect(response).toEqual(expected);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${id}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(videos.data[0]);
    });
  });

  describe('updateVideo', () => {
    it('should return an Observable<Video>', () => {
      const id = 8;
      const expected = {
        ...videos.data[0],
        name: 'new-video-name.mp4',
      };

      service.updateVideo(videos.data[0]).subscribe((response) => {
        expect(response).toEqual(expected);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${id}`,
      );
      expect(req.request.method).toBe('PATCH');
      req.flush(expected);
    });
  });

  describe('deleteVideo', () => {
    it('should return an Observable<string>', () => {
      const id = 1;
      const video: Video = {
        id,
        name: 'video.mp4',
      };

      service.deleteVideo(1).subscribe((response) => {
        expect(response).toBe(video);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${id}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(video);
    });
  });

  describe('setAnnotationState', () => {
    it('should return an Observable<Video>', () => {
      const videoId = 8;
      const state = VIDEO_ANNOTATION_STATE.ANNOTATION_FINISHED;
      const expected: Video = {
        name: '',
        id: videoId,
        annotationState: state,
      };
      service.setAnnotationState(videoId, state).subscribe((response) => {
        expect(response).toEqual(expected);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${videoId}/annotation-state`,
      );
      expect(req.request.method).toBe('PATCH');
      req.flush(expected);
    });
  });
});
