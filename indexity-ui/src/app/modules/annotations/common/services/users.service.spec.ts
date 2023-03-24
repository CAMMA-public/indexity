import { getTestBed, TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../test-constants';
import { User } from '@app/models/user';

describe('UsersService', () => {
  let injector;
  let service: UsersService;
  let httpMock: HttpTestingController;

  const users: User[] = [
    {
      id: 0,
      name: 'user',
      email: 'user@user.com',
      roles: ['ANNOTATOR'],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UsersService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    injector = getTestBed();
    service = TestBed.get(UsersService);
    httpMock = injector.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMany', () => {
    it('should return an Observable', () => {
      const opts = { offset: 0, limit: 15 };

      service.getMany(opts, []).subscribe((response) => {
        expect(response).toEqual(users);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/users?order=name,ASC`,
      );

      expect(req.request.method).toBe('GET');
      req.flush({ data: users });
    });

    it('should use pagination options', () => {
      const opts = { offset: 1, limit: 14 };

      service.getMany(opts, []).subscribe((response) => {
        // Do nothing.
      });

      const req = httpMock.expectOne(
        (r) =>
          r.urlWithParams ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/users?order=name,ASC&offset=${opts.offset}&limit=${opts.limit}`,
      );
      expect(req.request.method).toBe('GET');
    });

    it('should exclude users using ids', () => {
      const opts = { offset: 0, limit: 15 };
      const excludedIds = [15];

      service.getMany(opts, excludedIds).subscribe((response) => {
        // Do nothing.
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/users?order=name,ASC&filter=id||notin||[15]`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('searchUsersByName', () => {
    it('should return an Observable', () => {
      const opts = { offset: 0, limit: 15 };
      const name = 'name';

      service.searchUsersByName(opts, name, []).subscribe((response) => {
        expect(response).toEqual(users);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/users?order=name,ASC&filter=name||cont||name`,
      );

      expect(req.request.method).toBe('GET');
      req.flush({ data: users });
    });

    it('should use pagination options', () => {
      const opts = { offset: 1, limit: 14 };
      const name = 'name';

      service.searchUsersByName(opts, name, []).subscribe((response) => {
        // Do nothing.
      });

      const req = httpMock.expectOne(
        (r) =>
          r.urlWithParams ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/users?order=name,ASC&filter=name||cont||name&offset=${opts.offset}&limit=${opts.limit}`,
      );
      expect(req.request.method).toBe('GET');
    });

    it('should exclude users using ids', () => {
      const opts = { offset: 0, limit: 15 };
      const excludedIds = [15];
      const name = 'name';

      service
        .searchUsersByName(opts, name, excludedIds)
        .subscribe((response) => {
          // Do nothing.
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url ===
          `${indexityTestConfig.configuration.apiConfig.baseUrl}/users?order=name,ASC&filter=name||cont||name&filter=id||notin||[15]`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
