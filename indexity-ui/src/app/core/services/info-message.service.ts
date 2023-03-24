import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class InfoMessageService {
  message$: Subject<{
    content: string;
    redirect: boolean;
  }> = new Subject();

  dialogMessage$: Subject<{
    title: string;
    message: string;
  }> = new Subject();

  constructor(public dialog: MatDialog) {}

  setMessage(content: string, redirect = false): void {
    this.message$.next({
      content,
      redirect,
    });
  }

  setDialog(title: string, message: string): void {
    this.dialogMessage$.next({
      title,
      message,
    });
  }

  setConfirm(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      data: { title, message, askUser: true },
      disableClose: true,
    });
    return dialogRef.afterClosed().toPromise();
  }
}
