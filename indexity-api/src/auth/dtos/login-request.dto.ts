import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'user@mail.com', description: 'User email' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'xxxx', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
