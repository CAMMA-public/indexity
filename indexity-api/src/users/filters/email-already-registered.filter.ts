import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { EmailAlreadyUsedError } from '../errors/email-already-used.error';

@Catch(EmailAlreadyUsedError)
export class EmailAlreadyRegisteredFilter implements ExceptionFilter {
  catch(exception: EmailAlreadyUsedError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response.status(HttpStatus.CONFLICT).json({
      ok: false,
      statusText: exception.message,
      statusCode: HttpStatus.CONFLICT,
      timestamp: new Date().toISOString(),
      url: request.url,
    });
  }
}
