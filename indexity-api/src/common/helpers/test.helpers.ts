import { getRepositoryToken } from '@nestjs/typeorm';
import { ValueProvider } from '@nestjs/common/interfaces';

export const provideMockedRepository = (entity): ValueProvider => ({
  provide: getRepositoryToken(entity),
  useValue: {
    metadata: {
      columns: [],
      relations: [],
    },
  },
});
