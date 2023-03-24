import { IsString } from 'class-validator';
import { HasSameValue } from '../helpers/has-same-value.validation-decorator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordUpdateRequestDto {
  @ApiProperty()
  @IsString()
  password: string;
  @HasSameValue('password', {
    message: 'The given password values do not match.',
  })
  confirmation: string;
}
