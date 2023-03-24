import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { FindOneOptions } from 'typeorm';
import { defaultTo, isArray, isEmpty, isString } from 'lodash';
import { buildFindConditions, ensureArray } from '../helpers';

export const FindOne = createParamDecorator(
  (data, req: Request): FindOneOptions => {
    const options: FindOneOptions = {};

    const fieldsQuery = defaultTo(req.query.fields, req.query.select);
    if (isString(fieldsQuery) && !isEmpty(fieldsQuery)) {
      options.select = fieldsQuery.split(',');
    }

    const joinQuery = ensureArray(
      defaultTo(req.query.join, req.query.relation),
    );
    if (isArray(joinQuery) && !isEmpty(joinQuery)) {
      options.relations = joinQuery;
    }

    const sortQuery = ensureArray(defaultTo(req.query.sort, req.query.order));
    if (isArray(sortQuery) && !isEmpty(sortQuery)) {
      options.order = sortQuery.reduce((accumulator, value: string) => {
        const [property, direction] = value.split(',');
        return { ...accumulator, [property]: direction };
      }, {});
    }

    const filterQuery = ensureArray(
      defaultTo(req.query.filter, req.query.where),
    );
    if (isArray(filterQuery) && !isEmpty(filterQuery)) {
      options.where = buildFindConditions(filterQuery);
    }

    return options;
  },
);
