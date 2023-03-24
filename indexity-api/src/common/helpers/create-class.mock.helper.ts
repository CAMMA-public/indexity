import { isFunction, isObject, isUndefined } from 'lodash';

export const createClassMock = (target, mocks?): any => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return Object.create(
    target.prototype,
    Object.getOwnPropertyNames(target.prototype)
      .concat(isObject(mocks) ? Object.keys(mocks) : [])
      .filter(
        (value, index, array) =>
          array.findIndex(elt => elt === value) === index,
      )
      .map((name: string): [string, PropertyDescriptor] => {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
          target.prototype,
          name,
        );
        const mockValue =
          isObject(mocks) && !isUndefined(mocks[name])
            ? mocks[name]
            : jest.fn();
        if (undefined === propertyDescriptor) {
          return [
            name,
            isFunction(mockValue)
              ? {
                  value: mockValue,
                  configurable: true,
                  writable: true,
                  enumerable: true,
                }
              : {
                  get: jest.fn(() => mockValue),
                  set: value =>
                    Object.defineProperty(this, name, {
                      value,
                      configurable: true,
                      writable: true,
                      enumerable: true,
                    }),
                  enumerable: true,
                  configurable: true,
                },
          ];
        }
        if (undefined !== propertyDescriptor.value) {
          propertyDescriptor.value = mockValue;
        }
        if (undefined !== propertyDescriptor.get) {
          propertyDescriptor.get = mockValue;
        }
        if (undefined !== propertyDescriptor.set) {
          propertyDescriptor.set = mockValue;
        }
        return [name, propertyDescriptor];
      })
      .reduce((previousValue, currentValue) => {
        previousValue[currentValue[0]] = currentValue[1];
        return previousValue;
      }, {}),
  );
};
