import { inject, TestBed } from '@angular/core/testing';

import { HomeGuard } from './home.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../test-constants';

describe('HomeGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        HomeGuard,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    });
  });

  it('should create', inject([HomeGuard], (guard: HomeGuard) => {
    expect(guard).toBeTruthy();
  }));
});
