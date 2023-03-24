import {
  Between,
  Equal,
  FindConditions,
  FindOperator,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Raw,
} from 'typeorm';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsString,
  Validator,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { isEmpty, isUndefined } from 'lodash';

export const ILike = <T>(value: T | FindOperator<T>): FindOperator<T> =>
  Raw(alias => `${alias} ILIKE '${value}'`);

export const FilteringOperators = {
  eq: v => Equal(v),
  ne: v => Not(Equal(v)),
  gt: v => MoreThan(v),
  lt: v => LessThan(v),
  gte: v => MoreThanOrEqual(v),
  lte: v => LessThanOrEqual(v),
  starts: v => ILike(`${v}%`),
  ends: v => ILike(`%${v}`),
  cont: v => ILike(`%${v}%`),
  excl: v => Not(ILike(`%${v}%`)),
  in: v => In((Array.isArray(v) ? v : [v]).filter(elt => !isUndefined(elt))),
  notin: v =>
    Not(In((Array.isArray(v) ? v : [v]).filter(elt => !isUndefined(elt)))),
  isnull: () => IsNull(),
  notnull: () => Not(IsNull()),
  between: (a, b) => Between(a, b),
};

const stringValueGroups = [
  'eq',
  'ne',
  'gt',
  'lt',
  'gte',
  'lte',
  'starts',
  'ends',
  'cont',
  'excl',
];
const arrayValueGroups = ['in', 'notin'];
const noValueGroups = ['isnull', 'notnull'];

class ValidationTarget {
  @IsString({ always: true })
  @IsNotEmpty({ always: true })
  field: string;

  @IsString({ always: true })
  @IsNotEmpty({ always: true })
  operator: string;

  @IsString({ groups: stringValueGroups })
  @IsNotEmpty({ groups: stringValueGroups })
  @IsArray({ groups: arrayValueGroups })
  @ArrayNotEmpty({ groups: arrayValueGroups })
  @IsEmpty({ groups: noValueGroups })
  value: string;
}

const validator = new Validator();

export const buildFindConditions = <T extends ObjectLiteral>(
  filters: string[],
): FindConditions<T> => {
  const conditions = {};
  for (const filter of filters.map(f => f.split('||'))) {
    const [field, operator, value] = filter;
    const target = new ValidationTarget();
    target.field = field;
    target.operator = operator;
    const errors = [];
    if (arrayValueGroups.includes(target.operator)) {
      target.value = JSON.parse(isUndefined(value) ? null : value);
      errors.push(
        ...validator.validateSync(target, { groups: arrayValueGroups }),
      );
    } else if (stringValueGroups.includes(target.operator)) {
      target.value = value;
      errors.push(
        ...validator.validateSync(target, { groups: stringValueGroups }),
      );
    } else if (noValueGroups.includes(target.operator)) {
      target.value = value;
      errors.push(...validator.validateSync(target, { groups: noValueGroups }));
    }
    if (!isEmpty(errors)) {
      throw new BadRequestException(errors);
    }
    conditions[target.field] = FilteringOperators[target.operator](
      target.value,
    );
  }
  return conditions;
};
