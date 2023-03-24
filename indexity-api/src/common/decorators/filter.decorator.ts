import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { buildFindConditions, ensureArray } from '../helpers';
import { FindConditions, ObjectLiteral } from 'typeorm';
import { defaultTo, isEmpty } from 'lodash';

export const Filter = createParamDecorator(
  (data, req: Request): FindConditions<ObjectLiteral> => {
    const filters = ensureArray(defaultTo(req.query.filter, req.query.where));
    return isEmpty(filters) ? undefined : buildFindConditions(filters);
  },
);
