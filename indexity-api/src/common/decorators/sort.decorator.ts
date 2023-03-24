import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { isEmpty, isUndefined } from 'lodash';
import { ensureArray } from '../helpers';

export const Sort = createParamDecorator((data, req: Request): {
  [key: string]: 'ASC' | 'DESC';
} => {
  const sort = ensureArray(
    !isUndefined(req.query.sort) ? req.query.sort : req.query.order,
  );
  if (isEmpty(sort)) {
    return undefined;
  }
  const order = {};
  sort.map(s => {
    const property = s.split(',')[0];
    const direction = s.split(',')[1];
    order[property] = direction;
  });
  return order;
});
