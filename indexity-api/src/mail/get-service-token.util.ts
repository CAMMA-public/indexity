export const getServiceToken = (name = 'default'): string =>
  `MAIL_MODULE_${name}_SERVICE`;
