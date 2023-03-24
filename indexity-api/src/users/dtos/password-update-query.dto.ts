import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordUpdateQueryDto {
  @ApiProperty()
  @IsString()
  hash: string;
}
