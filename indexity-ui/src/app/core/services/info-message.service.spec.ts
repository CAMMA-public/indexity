import { InfoMessageService } from './info-message.service';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';

describe('InfoMessageService', () => {
  let injector;
  let service: InfoMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, MatDialogModule],
      providers: [InfoMessageService, MatDialog],
    });
    injector = getTestBed();
    service = injector.get(InfoMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setMessage', () => {
    it('should set message', () => {
      const message = 'message';
      const redirect = true;
      service.message$.subscribe((received) => {
        expect(received).toEqual({ content: message, redirect });
      });
      service.setMessage(message, redirect);
    });

    it('should set redirect to false', () => {
      const message = 'message';
      service.message$.subscribe((received) => {
        expect(received).toEqual({ content: message, redirect: false });
      });
      service.setMessage(message);
    });
  });

  describe('setDialog', () => {
    const title = 'title';
    const message = 'message';

    it('should set dialog message', () => {
      const expected = { title, message };
      service.dialogMessage$.subscribe((received) => {
        expect(received).toEqual(expected);
      });
      service.setDialog(expected.title, expected.message);
    });
  });

  describe('setConfirm', () => {
    it('should return value of dialog', async () => {
      const expected = false;
      const dialogMock = {
        afterClosed: () => of(expected),
      };
      spyOn(service.dialog, 'open').and.returnValue(
        dialogMock as MatDialogRef<InfoDialogComponent>,
      );
      const received = await service.setConfirm('title', 'message');
      expect(received).toEqual(expected);
    });
  });
});
