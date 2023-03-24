import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCERS } from '@app/main-store';
import { EffectsModule } from '@ngrx/effects';
import { LoginFormComponent } from './core/components/login-form/login-form.component';
import { SignupFormComponent } from './core/components/signup-form/signup-form.component';
import { UsersEffects } from '@app/main-store/user/users.effects';
import { LoadingVeilComponent } from './core/components/loading-veil/loading-veil.component';

import { UiFacade } from '@app/main-store/ui/ui.facade';
import { AuthDialogComponent } from './core/components/auth-dialog/auth-dialog.component';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { HomeComponent } from '@app/views';
import { MaterialCustomModule } from '@app/modules';
import {
  ConfigurationModule,
  ConfigurationService,
} from 'angular-configuration-module';
import { jwtOptions } from './jwt-config';
import { InfoMessageService } from '@app/services/info-message.service';
import { InfoDialogComponent } from './core/components/info-dialog/info-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginFormComponent,
    SignupFormComponent,
    LoadingVeilComponent,
    AuthDialogComponent,
    InfoDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialCustomModule,
    StoreModule.forRoot(ROOT_REDUCERS, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
    }),
    StoreDevtoolsModule.instrument({ maxAge: 50 }),
    ConfigurationModule.forRoot({
      path: '/assets/config.json',
    }),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptions.options,
        deps: [ConfigurationService],
      },
    }),
    EffectsModule.forRoot([UsersEffects]),
  ],
  providers: [UiFacade, ConfigurationService, InfoMessageService],
  entryComponents: [
    AuthDialogComponent,
    LoginFormComponent,
    SignupFormComponent,
  ],
  exports: [SignupFormComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
