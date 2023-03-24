export enum SETTING_NAMES {
  RESCALE_AFTER_IMPORT = 'rescale_after_import',
  MAINTENANCE_MODE = 'maintenance_mode',
}

export interface Setting {
  key: SETTING_NAMES;
  value: string;
}
