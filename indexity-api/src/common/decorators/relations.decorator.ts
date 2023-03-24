import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { defaultTo, isArray, isEmpty } from 'lodash';

export const Relations = createParamDecorator((data, req: Request):
  | string[]
  | undefined => {
  const join = defaultTo(req.query.join, req.query.relation);
  return isArray(join) && !isEmpty(join) ? join : undefined;
});
