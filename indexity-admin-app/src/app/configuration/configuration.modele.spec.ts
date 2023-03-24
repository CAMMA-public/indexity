import { getTestBed, inject, TestBed } from '@angular/core/testing';
import { ConfigurationModule } from './configuration.module';
import { ConfigurationService } from './configuration.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('ConfigurationModule', () => {
  describe('.forRoot', () => {
    let injector: TestBed;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          ConfigurationModule.forRoot({
            path: '/fake_config_path.json',
          }),
        ],
      }).compileComponents();
      injector = getTestBed();
      httpMock = injector.get(HttpTestingController);
    });

    it('should provide ServiceConfiguration', () => {
      inject([ConfigurationService], (service: ConfigurationService) => {
        expect(service).toBeTruthy();
      });
    });

    it('should have initialized the ServiceConfiguration instance against the route /fake_config_path.json', () => {
      httpMock.expectOne(`/fake_config_path.json`).flush({});
    });
  });
});
