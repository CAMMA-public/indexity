import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { defaultTo, isFinite } from 'lodash';

export const buildPaginationOptions = (
  data,
  req: Request,
): { take?: number; skip?: number } => {
  const take = parseInt(defaultTo(req.query.limit, req.query.take), 10);
  const skip = parseInt(defaultTo(req.query.offset, req.query.skip), 10);
  return isFinite(take) && isFinite(skip)
    ? { take, skip }
    : isFinite(take)
    ? { take }
    : isFinite(skip)
    ? { skip }
    : undefined;
};

export const Pagination = createParamDecorator(buildPaginationOptions);
