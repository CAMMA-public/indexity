import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '../../users/entities/user.entity';
import { defaultTo, assign } from 'lodash';
import { UserRolesGuard } from '../guards/user-roles.guard';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../common/decorators';
import { Request } from 'express';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { SettingsService } from '../../settings/services/settings.service';
import { USER_ROLE } from '../../users/models/user-roles';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
  ) {}

  @ApiOperation({ description: 'Log a user in.' })
  @ApiCreatedResponse({
    description: 'An access token has successfully been forged.',
    type: LoginResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The given credentials do not match any known user.',
  })
  @Post('login')
  login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto);
  }

  @ApiOperation({
    description: 'Validate the given JWT and get the related user.',
  })
  @ApiOkResponse({
    description: 'The given JWT is valid and matches an existing user.',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({ description: 'The given JWT is invalid.' })
  @Get('verify')
  @UseGuards(UserRolesGuard)
  async verify(
    @User() user: UserEntity,
    @Req() req: Request,
  ): Promise<UserEntity> {
    if (!user.roles.includes(USER_ROLE.ADMIN)) {
      const maintenanceMode = await this.settingsService.maintenanceMode();
      if (maintenanceMode.value === 'true') {
        throw new HttpException(
          'System is under Maintenance',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
    return this.usersService.updateOne(
      assign(user, {
        ipAddress: defaultTo(
          req.headers['x-forwarded-for'] as string,
          req.connection.remoteAddress,
        ),
      }),
    );
  }

  @ApiOperation({ description: 'Get a new access token' })
  @ApiOkResponse({
    description: 'The given refresh JWT is valid.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'The given refresh JWT is invalid' })
  @Get('refresh')
  refresh(
    @Headers('refresh-token') refreshToken: string,
  ): Promise<LoginResponseDto> {
    return this.authService.refresh(refreshToken);
  }
}
