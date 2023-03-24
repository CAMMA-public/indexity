import { isUndefined } from 'lodash';

export const getEnv = <T = string>(
  envName: string,
  defaultValue: T,
  transformer: (enValue: string) => T,
): T => {
  const envValue = process.env[envName];
  if (isUndefined(envValue)) {
    return defaultValue;
  }
  return transformer(envValue);
};
