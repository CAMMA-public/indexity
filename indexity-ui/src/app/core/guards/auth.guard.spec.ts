import { inject, TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { StoreModule } from '@ngrx/store';
import { JwtModule } from '@auth0/angular-jwt';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../test-constants';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        JwtModule.forRoot({
          config: {
            tokenGetter: () => '',
          },
        }),
      ],
      providers: [
        AuthGuard,
        UsersFacade,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
  });
  it('should create guard', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
  it('should return false if auth token does not exists', inject(
    [AuthGuard],
    async (guard: AuthGuard) => {
      localStorage.removeItem('accessToken');
      const res = await guard.canActivateChild(null, null);
      expect(res).toBeFalsy();
    },
  ));
});
