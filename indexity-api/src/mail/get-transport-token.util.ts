export const getTransportToken = (name = 'default'): string =>
  `MAIL_MODULE_${name}_TRANSPORT`;
