export const applyMixins = (derivedCtor: any, baseCtors: any[]): void =>
  baseCtors.forEach(baseCtor =>
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (undefined === derivedCtor.prototype[name]) {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name),
        );
      }
    }),
  );
