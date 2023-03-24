import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { AboutComponent } from './about.component';
import { MatIconModule } from '@angular/material/icon';
import { MaterialCustomModule } from '@app/modules';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VideoBookmarksService } from '@app/videos/services/video-bookmarks.service';
import { ConfigurationService } from 'angular-configuration-module';
import { indexityTestConfig } from '../../../../../test-constants';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AboutComponent],
      imports: [MatIconModule, MaterialCustomModule, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        VideoBookmarksService,
        {
          provide: ConfigurationService,
          useValue: indexityTestConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
