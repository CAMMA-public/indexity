import { Controller, Body, Post, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AnnotationDto } from './dtos/annotation-dto';
import { TRACKING_STARTED } from './dtos/tracker-status-msg-dto';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
  private readonly logger: Logger = new Logger('AppController', true);

  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  status(): { online: true } {
    return { online: true };
  }

  @Post('track')
  async trackAnnotation(@Body() annotation: AnnotationDto): Promise<any> {
    // no need to start tracking if we cannot contact the API
    await this.userService.getToken();

    this.appService.trackAnnotation(annotation).catch(this.logger.error);
    this.appService.sendStatus({ status: TRACKING_STARTED }, annotation.id);

    return { status: 'Request received' };
  }
}
