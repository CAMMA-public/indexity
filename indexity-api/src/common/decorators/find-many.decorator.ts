import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { FindManyOptions } from 'typeorm';
import { defaultTo, isEmpty, isNumber, isString, toNumber } from 'lodash';
import { buildFindConditions, ensureArray } from '../helpers';

export const FindMany = createParamDecorator(
  (data, req: Request): FindManyOptions => {
    const options: FindManyOptions = {};

    const fieldsQuery = defaultTo(req.query.fields, req.query.select);
    if (isString(fieldsQuery) && !isEmpty(fieldsQuery)) {
      options.select = fieldsQuery.split(',');
    }

    const joinQuery = ensureArray(
      defaultTo(req.query.join, req.query.relation),
    );
    if (!isEmpty(joinQuery)) {
      options.relations = joinQuery;
    }

    const sortQuery = ensureArray(defaultTo(req.query.sort, req.query.order));
    if (!isEmpty(sortQuery)) {
      options.order = sortQuery.reduce((accumulator, value: string) => {
        const [property, direction] = value.split(',');
        return { ...accumulator, [property]: direction };
      }, {});
    }

    const filterQuery = ensureArray<string>(
      defaultTo(req.query.filter, req.query.where),
    );
    if (!isEmpty(filterQuery)) {
      options.where = buildFindConditions(filterQuery);
    }

    const takeQuery = toNumber(defaultTo(req.query.limit, req.query.take));
    if (isNumber(takeQuery) && takeQuery > -1) {
      options.take = takeQuery;
    }

    const skipQuery = toNumber(defaultTo(req.query.offset, req.query.skip));
    if (isNumber(skipQuery) && skipQuery > -1) {
      options.skip = skipQuery;
    }

    return options;
  },
);
