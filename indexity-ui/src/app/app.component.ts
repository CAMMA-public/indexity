import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigurationService } from 'angular-configuration-module';
import { jwtOptions } from './jwt-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private readonly configurationService: ConfigurationService) {
    jwtOptions.addToWhitelistedDomains(
      configurationService.configuration.jwtSettings.whitelistedDomains.split(
        configurationService.configuration.separator,
      ),
    );
    jwtOptions.addToBlacklistedRoutes(
      configurationService.configuration.jwtSettings.blacklistedRoutes.split(
        configurationService.configuration.separator,
      ),
    );
  }
}
