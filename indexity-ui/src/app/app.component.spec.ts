import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from './test-constants';
import { jwtOptions } from './jwt-config';

describe('AppComponent', () => {
  let appComp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
    spyOn(jwtOptions, 'addToWhitelistedDomains');
    spyOn(jwtOptions, 'addToBlacklistedRoutes');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    appComp = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(appComp).toBeTruthy();
  });

  it('should initialize jwt whitelisted domains', () => {
    expect(jwtOptions.addToWhitelistedDomains).toHaveBeenCalledWith(
      indexityTestConfig.configuration.jwtSettings.whitelistedDomains.split(
        indexityTestConfig.configuration.separator,
      ),
    );
  });

  it('should initialize jwt blacklisted routes', () => {
    expect(jwtOptions.addToBlacklistedRoutes).toHaveBeenCalledWith(
      indexityTestConfig.configuration.jwtSettings.blacklistedRoutes.split(
        indexityTestConfig.configuration.separator,
      ),
    );
  });
});
