import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { filter, map } from 'rxjs/operators';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '@app/annotations/services/local-storage.service';
import { SettingsComponent } from '@app/annotations/components/settings/settings.component';
import { HelpComponent } from '@app/annotations/components/help/help.component';
import { SettingsStoreFacade } from '@app/settings-store/settings.store-facade';
import { InfoMessageService } from '@app/services/info-message.service';
import { Router } from '@angular/router';
import { Settings } from '@app/models/settings';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AboutComponent } from '@app/annotations/components/about/about.component';
import { InfoDialogComponent } from '../../core/components/info-dialog/info-dialog.component';

@Component({
  selector: 'app-annotations-view-layout',
  templateUrl: './annotations-view-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationsViewLayoutComponent implements OnInit, OnDestroy {
  isSideNavOpen$ = this.uiFacade.isNavBarOpen$;
  title$ = this.uiFacade.title$;

  currentUsername$ = this.usersFacade.currentUser$.pipe(
    filter((u) => !!u),
    map((u) => u.name),
  );

  settings: Settings;
  subscriptions: Array<Subscription> = [];

  constructor(
    private usersFacade: UsersFacade,
    private uiFacade: UiFacade,
    private settingsStoreFacade: SettingsStoreFacade,
    private infoMessageService: InfoMessageService,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {
    const settingsSubscription = this.settingsStoreFacade.settings$.subscribe(
      (s) => (this.settings = s),
    );
    const settings = this.localStorageService.getSettings();
    if (settings) {
      this.settingsStoreFacade.setSettings(settings);
      this.localStorageService.saveSettings(settings);
    } else {
      this.localStorageService.saveSettings(this.settings);
    }
    const messageSub = this.infoMessageService.message$.subscribe((message) => {
      if (message) {
        if (message.redirect) {
          this.router.navigate(['/']);
        }
        const snackBarRef = this.snackBar.open(message.content, null, {
          duration: 3000,
        });
        snackBarRef
          .afterDismissed()
          .pipe(map(() => this.infoMessageService.setMessage(null)));
      }
    });
    const dialogSub = this.infoMessageService.dialogMessage$.subscribe(
      ({ title, message }) => {
        this.dialog.open(InfoDialogComponent, { data: { title, message } });
      },
    );
    this.subscriptions.push(settingsSubscription, messageSub, dialogSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }

  closeSidenav(): void {
    this.uiFacade.closeSideNav();
  }

  onSideNavToggle(): void {
    this.uiFacade.toggleSideNav();
  }

  onLogout(): void {
    this.uiFacade.closeSideNav();
    this.usersFacade.logout();
  }

  async openSettings(): Promise<void> {
    const matDialogConfig: MatDialogConfig = {
      width: '450px',
      data: this.settings,
      disableClose: false,
    };
    const dialogRef = this.dialog.open(SettingsComponent, matDialogConfig);
    const data = await dialogRef.afterClosed().toPromise();
    if (data) {
      this.settingsStoreFacade.setSettings(data);
      this.localStorageService.saveSettings(data);
    }
    this.closeSidenav();
  }

  openHelp(): void {
    const dialogRef = this.dialog.open(HelpComponent, {
      width: '600px',
      disableClose: false,
    });
    const sub = dialogRef.componentInstance.openDocumentation.subscribe(() => {
      this.router.navigate([]).then(() => {
        window.open('/annotations/documentation', '_blank');
      });
    });
    dialogRef.afterClosed().subscribe(() => sub.unsubscribe());
  }

  openAbout(): void {
    this.dialog.open(AboutComponent, {
      width: '600px',
      disableClose: false,
    });
  }
}
