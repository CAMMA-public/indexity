import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const HasSameValue = (
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'hasSameValue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate: (value: any, args?: ValidationArguments): boolean => {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage: (args?: ValidationArguments): string => {
          const [relatedPropertyName] = args.constraints;
          const { value } = args;
          const relatedValue = args.object[relatedPropertyName];
          return `${value} is not the same as ${relatedValue}`;
        },
      },
    });
  };
};
