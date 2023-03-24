import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
