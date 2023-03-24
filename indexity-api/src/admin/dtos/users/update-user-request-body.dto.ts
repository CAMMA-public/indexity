import { UserEntity } from '../../../users/entities/user.entity';
import { USER_ROLE } from '../../../users/models/user-roles';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const MIN_PASSWORD_LENGTH = 7;

export class UpdateUserRequestBodyDto
  implements Pick<UserEntity, 'name' | 'password' | 'roles' | 'isActivated'> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @Length(MIN_PASSWORD_LENGTH)
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsEnum(USER_ROLE, { each: true })
  @IsOptional()
  roles: USER_ROLE[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActivated: boolean;
}
