import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationsToolsComponent } from '@app/annotations/modules/videos/components/annotations-tools/annotations-tools.component';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../../test-constants';
import { InfoMessageService } from '@app/services/info-message.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';

describe('AnnotationsToolsComponent', () => {
  let component: AnnotationsToolsComponent;
  let fixture: ComponentFixture<AnnotationsToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnnotationsToolsComponent],
      imports: [OverlayModule, MatDialogModule],
      providers: [
        MatDialog,
        InfoMessageService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnotationsToolsComponent);
    component = fixture.componentInstance;
    component.settings = {
      activateJsonExport: true,
      showLabels: true,
      activateJsonImport: true,
      activateAnnotationInterpolation: false,
      annotationInterpolationStep: 30,
      frameStep: 15,
      videoHeight: 480,
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
