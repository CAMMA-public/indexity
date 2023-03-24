# angular-configuration-module

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.3.

## Description

This Angular module allows to provide a URL to a configuration file (JSON). It will then inject this configuration
 making it available through a `ConfigurationService`.

## Install

```bash
npm i -S angular-configuration-module
```

## Usage

app.module.ts

```typescript
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {ConfigurationModule} from 'angular-configuration-module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ConfigurationModule.forRoot({ path: '/assets/config.json' }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

app.component.ts

```typescript
import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'angular-configuration-module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(private readonly configurationService: ConfigurationService) {}

  ngOnInit(): void {
    console.log(this.configurationService.configuration);
  }
}
```
