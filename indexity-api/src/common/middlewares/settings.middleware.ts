import {
  NestMiddleware,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { SettingsService } from '../../settings/services/settings.service';
import { isUndefined } from 'lodash';

@Injectable()
export class MaintenanceSettingMiddleware implements NestMiddleware {
  constructor(private settingsService: SettingsService) {}
  async use(req: Request, res: Response, next: Function): Promise<any> {
    if (
      req.originalUrl.startsWith('/admin') ||
      req.originalUrl.startsWith('/auth')
    ) {
      return next();
    }
    const maintenanceSetting = await this.settingsService.maintenanceMode();
    if (
      !isUndefined(maintenanceSetting) &&
      maintenanceSetting.value === 'true'
    ) {
      throw new HttpException(
        'System is under Maintenance',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return next();
  }
}
