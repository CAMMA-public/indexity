import { UserEntity } from '../../../users/entities/user.entity';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { USER_ROLE } from '../../../users/models/user-roles';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_MIN_LENGTH = 7;

export class CreateUserRequestBodyDto
  implements Pick<UserEntity, 'name' | 'email' | 'password' | 'roles'> {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @Length(PASSWORD_MIN_LENGTH)
  password: string;

  @ApiProperty({
    enum: ['ADMIN', 'ANNOTATOR', 'MODERATOR'],
    isArray: true,
  })
  @IsEnum(USER_ROLE, { each: true })
  roles: USER_ROLE[];
}
