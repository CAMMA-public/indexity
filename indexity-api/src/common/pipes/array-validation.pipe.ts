// import { ArgumentMetadata, mixin, PipeTransform, Type, ValidationPipe } from '@nestjs/common';
// import { memoize } from 'lodash';
//
// export const ArrayValidationPipe: <T>(
//   itemType: Type<T>,
// ) => Type<PipeTransform> = memoize(createArrayValidationPipe);
//
// function createArrayValidationPipe<T>(itemType: Type<T>): Type<PipeTransform> {
//   class MixinArrayValidationPipe extends ValidationPipe
//     implements PipeTransform {
//     transform(values: T[], metadata: ArgumentMetadata): Promise<any[]> {
//       if (!Array.isArray(values)) {
//         return values;
//       }
//
//       return Promise.all(
//         values.map(value =>
//           super.transform(value, { ...metadata, metatype: itemType }),
//         ),
//       );
//     }
//   }
//
//   return mixin(MixinArrayValidationPipe);
// }

import {
  ArgumentMetadata,
  Injectable,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

@Injectable()
export class ArrayValidationPipe<T> extends ValidationPipe {
  constructor(readonly type: Type<T>, options?: ValidationPipeOptions) {
    super(options);
  }

  transform(values: T[], metadata: ArgumentMetadata): Promise<any[]> {
    if (!Array.isArray(values)) {
      return values;
    }
    return Promise.all(
      values.map(value =>
        super.transform(value, { ...metadata, metatype: this.type }),
      ),
    );
  }
}
