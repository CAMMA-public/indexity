import { CONFIGURATION } from '../../configuration/configuration.module';
import { Inject } from '@nestjs/common';

export const Configuration = (): ParameterDecorator => Inject(CONFIGURATION);
