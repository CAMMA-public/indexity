import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { defaultTo, isString } from 'lodash';

export const Select = createParamDecorator((data, req: Request):
  | string[]
  | undefined => {
  const select = defaultTo(req.query.fields, req.query.select);
  return isString(select) ? select.split(',') : undefined;
});
