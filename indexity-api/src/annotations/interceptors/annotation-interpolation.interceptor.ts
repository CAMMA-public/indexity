import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { addInterpolatedPositions } from './../../common/helpers/annotations.helper';
import { config } from '../../config';

@Injectable()
export class AnnotationInterpolationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [req] = context.getArgs();

    if (req.query.withInterpolation !== 'true') {
      return next.handle();
    }

    const reqStep = parseInt(req.query.interpolationStep);
    const step =
      isNaN(reqStep) || reqStep < 0
        ? config.annotationInterpolationStep
        : reqStep;

    return next.handle().pipe(
      map(result => {
        const data = result.data ? result.data : result;

        const interpolatedData = Array.isArray(data)
          ? data.map(annotation => addInterpolatedPositions(annotation, step))
          : addInterpolatedPositions(data, step);

        return result.data
          ? { ...result, data: interpolatedData }
          : interpolatedData;
      }),
    );
  }
}
