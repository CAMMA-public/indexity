import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivationRequestQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;
}
