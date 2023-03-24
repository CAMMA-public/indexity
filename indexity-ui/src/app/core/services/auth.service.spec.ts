import { getTestBed, TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { User } from '../models/user';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../test-constants';

describe('AuthService', () => {
  let injector;
  let service: AuthService;
  let httpMock: HttpTestingController;

  const user: User = {
    name: 'annotator',
    email: 'annotator@indexity.local',
  };
  const accessToken = 'token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
    injector = getTestBed();
    service = injector.get(AuthService);
    httpMock = injector.get(HttpTestingController);

    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return a User and its token', () => {
      service
        .login({ email: user.email, password: 'test' })
        .subscribe((response) => {
          expect(response.user).toEqual(user);
          expect(response.accessToken).toBe(accessToken);
        });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/auth/login`,
      );
      expect(req.request.method).toBe('POST');
      req.flush({ user, accessToken });
    });
  });

  describe('signup', () => {
    it('should return a User and its token', () => {
      service.signup(user).subscribe((response) => {
        expect(response.user).toEqual(user);
        expect(response.accessToken).toBe(accessToken);
      });

      const req = httpMock.expectOne(
        `${indexityTestConfig.configuration.apiConfig.baseUrl}/users/annotator`,
      );
      expect(req.request.method).toBe('POST');
      req.flush({ user, accessToken });
    });
  });

  describe('setLocalAccessToken', () => {
    it('should set accessToken', () => {
      service.setLocalAccessToken(accessToken);
      expect(service.accessToken).toBe(accessToken);
      expect(localStorage.getItem('accessToken')).toBe(accessToken);
    });

    it('should remove accessToken', () => {
      service.setLocalAccessToken('');
      expect(service.accessToken).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('getLocalAccessToken', () => {
    beforeEach(() => localStorage.clear());

    it('should return null', () => {
      expect(service.getLocalAccessToken()).toBeNull();
    });

    it('should return accessToken from service', () => {
      service.accessToken = accessToken;
      expect(service.getLocalAccessToken()).toBe(accessToken);
    });

    it('should return accessToken from localStorage', () => {
      localStorage.setItem('accessToken', accessToken);
      expect(service.getLocalAccessToken()).toBe(accessToken);
    });
  });
});
