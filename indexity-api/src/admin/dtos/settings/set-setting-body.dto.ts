import { Column } from 'typeorm';
import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetSettingBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Column()
  value: boolean;
}
