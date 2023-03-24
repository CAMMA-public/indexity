import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { FileTypeError } from '../errors/file-type.error';
import { InvalidFileNameException } from '../errors/invalid-file-name.exception';

@Catch(FileTypeError, InvalidFileNameException)
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(
    exception: FileTypeError | InvalidFileNameException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response.status(HttpStatus.BAD_REQUEST).json({
      ok: false,
      statusText: exception.message,
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      url: request.url,
    });
  }
}
