import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusLineComponent } from '@app/annotations/components/status-line/status-line.component';

import { VideoCardItemComponent } from './video-card-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AnnotationLabelItemComponent } from '@app/annotations/components/annotation-label-item/annotation-label-item.component';
import { MaterialCustomModule } from '@app/modules';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../test-constants';

describe('VideoCardItemComponent', () => {
  let component: VideoCardItemComponent;
  let fixture: ComponentFixture<VideoCardItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialCustomModule,
        RouterTestingModule,
        PerfectScrollbarModule,
        NoopAnimationsModule,
      ],
      declarations: [
        VideoCardItemComponent,
        AnnotationLabelItemComponent,
        StatusLineComponent,
      ],
      providers: [
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoCardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
