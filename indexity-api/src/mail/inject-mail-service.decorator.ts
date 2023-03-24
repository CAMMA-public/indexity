import { Inject } from '@nestjs/common';
import { getServiceToken } from './get-service-token.util';

export const InjectMailService = (name?: string): ParameterDecorator =>
  Inject(getServiceToken(name));
