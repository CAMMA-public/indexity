import { SettingEntity } from './../../../settings/entities/settings.entity';
import {
  Controller,
  Body,
  Get,
  Post,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { AdminController } from '../admin/admin.controller';
import { SettingsService } from '../../../settings/services/settings.service';
import { SETTING_NAMES } from './../../../settings/models/settings';
import { ApiTags } from '@nestjs/swagger';
import { SetSettingBodyDto } from '../../dtos/settings/set-setting-body.dto';
import { Configuration } from '../../../common/decorators';
import { AppConfiguration } from '../../../config';

@ApiTags('admin')
@Controller('admin/settings')
export class SettingsController extends AdminController {
  constructor(
    @Configuration() protected readonly configuration: AppConfiguration,
    private readonly settingsService: SettingsService,
  ) {
    super();
  }

  @Post('rescale-after-import')
  async setRescaleAfterImport(
    @Body(new ValidationPipe({ transform: true }))
    { value }: SetSettingBodyDto,
  ): Promise<SettingEntity> {
    try {
      const existing = await this.settingsService.getOne({
        where: { key: SETTING_NAMES.RESCALE_AFTER_IMPORT },
      });
      return this.settingsService.updateOne({
        ...existing,
        value: value.toString(),
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        this.settingsService.createOne({
          key: SETTING_NAMES.RESCALE_AFTER_IMPORT,
          value: value.toString(),
        });
      } else {
        throw err;
      }
    }
  }

  @Get('rescale-after-import')
  async getRescaleAfterImport(): Promise<Partial<SettingEntity>> {
    try {
      return await this.settingsService.getOne({
        where: { key: SETTING_NAMES.RESCALE_AFTER_IMPORT },
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        return {
          key: SETTING_NAMES.RESCALE_AFTER_IMPORT,
          value: `${this.configuration.rescaleAfterImport}`,
        };
      }
      throw err;
    }
  }
  @Post('maintenance-mode')
  async setSystemInMaintenanceMode(
    @Body(new ValidationPipe({ transform: true }))
    { value }: SetSettingBodyDto,
  ): Promise<SettingEntity> {
    try {
      const existing = await this.settingsService.getOne({
        where: { key: SETTING_NAMES.MAINTENANCE_MODE },
      });
      return this.settingsService.updateOne({
        ...existing,
        value: value.toString(),
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        this.settingsService.createOne({
          key: SETTING_NAMES.MAINTENANCE_MODE,
          value: value.toString(),
        });
      } else {
        throw err;
      }
    }
  }
  @Get('maintenance-mode')
  async getSystemInMaintenanceMode(): Promise<Partial<SettingEntity>> {
    return await this.settingsService.maintenanceMode();
  }
}
