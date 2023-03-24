import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'angular-configuration-module';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit {
  frontVersion$: Observable<string>;
  backVersion$: Observable<string>;

  constructor(
    private readonly configurationService: ConfigurationService,
    public dialogRef: MatDialogRef<AboutComponent>,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.frontVersion$ = this.http.get<string>(`assets/version`, {
      responseType: 'text' as 'json',
    });
    this.backVersion$ = this.http
      .get<{ version: string }>(
        `${this.configurationService.configuration.apiConfig.baseUrl}/version`,
      )
      .pipe(map((data: { version: string }) => data.version));
  }
}
