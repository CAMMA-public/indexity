import { getTestBed, TestBed } from '@angular/core/testing';
import { VideoBookmarksService } from './video-bookmarks.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Video } from '@app/videos/models/video.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { PaginatedResponse } from '@app/annotations/models/paginated-response.model';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../test-constants';

describe('VideoBookmarksService', () => {
  let injector;
  let service: VideoBookmarksService;
  let httpMock: HttpTestingController;

  const mockedVideos: PaginatedResponse<Video> = {
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
        VideoBookmarksService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    injector = getTestBed();
    service = injector.get(VideoBookmarksService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBookmarkIds', () => {
    it('should return an Observable<number[]>', () => {
      const dummyIds = [1, 2];

      service.getBookmarkIds().subscribe((response) => {
        const ids = response;
        expect(ids.length).toBe(2);
        expect(ids).toEqual(dummyIds);
      });
      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/bookmarks-ids`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(dummyIds);
    });
  });

  describe('index', () => {
    const expected = mockedVideos.data.map((video) => ({
      ...video,
      url: `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${video.id}/media`,
    }));

    it('should return an Observable<Video[]>', () => {
      service.index().subscribe((response) => {
        const videos = response;
        expect(videos.length).toBe(mockedVideos.data.length);
        expect(videos).toEqual(expected);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/bookmarks?offset=0&limit=15`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockedVideos);
    });
  });

  describe('create', () => {
    it('should return an Observable<number>', () => {
      const id = 3;

      service.create(id).subscribe((response) => {
        expect(response.videoId).toEqual(id);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${id}/bookmark`,
      );
      expect(req.request.method).toBe('POST');
      req.flush({
        videoId: id,
      });
    });
  });

  describe('remove', () => {
    it('should return an Observable<number>', () => {
      const id = 3;

      service.remove(id).subscribe((response) => {
        expect(response.videoId).toEqual(id);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/videos/${id}/bookmark`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({
        videoId: id,
      });
    });
  });
});
