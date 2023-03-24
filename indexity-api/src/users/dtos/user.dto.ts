import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserEntity } from '../entities/user.entity';
import { USER_ROLE } from '../models/user-roles';
import { DeepPartial } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_MIN_LENGTH = 7;

export abstract class UserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;

  @ApiProperty()
  isActivated: boolean;

  buildEntity(): DeepPartial<UserEntity> {
    const user = new UserEntity();
    user.name = this.name;
    user.email = this.email;
    user.password = this.password;
    return user;
  }
}

export class CreateAnnotatorDto extends UserDto {
  buildEntity(): DeepPartial<UserEntity> {
    const user = super.buildEntity();
    user.roles = [USER_ROLE.ANNOTATOR];
    return user;
  }
}
