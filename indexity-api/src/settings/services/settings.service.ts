import { Type, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Configuration } from '../../common/decorators';
import { AppConfiguration } from '../../config';
import { GenericCRUDService } from '../../common/services';
import { SettingEntity } from '../entities/settings.entity';
import { SETTING_NAMES } from '../models/settings';

export class SettingsService extends GenericCRUDService<SettingEntity> {
  constructor(
    @InjectEntityManager() manager: EntityManager,
    @Configuration() protected readonly configuration: AppConfiguration,
  ) {
    super(manager);
  }
  protected get target(): Type<SettingEntity> {
    return SettingEntity;
  }
  async maintenanceMode(): Promise<Partial<SettingEntity>> {
    try {
      return await this.getOne({
        where: { key: SETTING_NAMES.MAINTENANCE_MODE },
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        return {
          key: SETTING_NAMES.MAINTENANCE_MODE,
          value: `${this.configuration.maintenanceMode}`,
        };
      }
      throw err;
    }
  }
}
