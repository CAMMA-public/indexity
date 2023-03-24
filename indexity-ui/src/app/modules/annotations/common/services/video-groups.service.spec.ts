import { getTestBed, TestBed } from '@angular/core/testing';

import { VideoGroupsService } from './video-groups.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';
import { User } from '@app/models/user';

describe('VideoGroupsService', () => {
  let injector;
  let service: VideoGroupsService;
  let httpMock: HttpTestingController;

  const groupId = 1;
  const userId = 3;
  const opts = { offset: 5, limit: 20 };
  const user = {
    id: 0,
    name: 'user',
    email: 'user@user.com',
    roles: ['ANNOTATOR'],
  };
  const users: User[] = [user];
  const name = 'name';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VideoGroupsService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    injector = getTestBed();
    service = TestBed.get(VideoGroupsService);
    httpMock = injector.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: VideoGroupsService = TestBed.get(VideoGroupsService);
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return an Observable', () => {
      service.getUsers(groupId).subscribe((response) => {
        // Do nothing.
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users?order=name,ASC`,
      );

      expect(req.request.method).toBe('GET');
      req.flush({ data: users });
    });

    it('should use pagination options', () => {
      service.getUsers(groupId, opts).subscribe((response) => {
        expect(response).toEqual(users);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.urlWithParams ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users?order=name,ASC&offset=${opts.offset}&limit=${opts.limit}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('addUser', () => {
    it('should call the API with given parameters', () => {
      service.addUser(groupId, userId).subscribe((response) => {
        // Do nothing.
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users/${userId}`,
      );

      expect(req.request.method).toBe('PATCH');
      req.flush(user);
    });
  });

  describe('removeUser', () => {
    it('should call the API with given parameters', () => {
      service.removeUser(groupId, userId).subscribe((response) => {
        // Do nothing.
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users/${userId}`,
      );

      expect(req.request.method).toBe('DELETE');
      req.flush(user);
    });
  });

  describe('searchUsersByName', () => {
    it('should return an Observable', () => {
      service.searchUsersByName(groupId, opts, name).subscribe((response) => {
        expect(response).toEqual(users);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/video-groups/${groupId}/users?order=name,ASC&filter=name||cont||name`,
      );

      expect(req.request.method).toBe('GET');
      req.flush({ data: users });
    });
  });
});
