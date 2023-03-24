import { SETTING_NAMES, Setting } from './../models/settings';
import { BaseEntity, Column, Entity, PrimaryColumn, Index } from 'typeorm';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'settings' })
export class SettingEntity extends BaseEntity implements Setting {
  @ApiProperty()
  @PrimaryColumn()
  @IsEnum(SETTING_NAMES)
  @Index({ unique: true })
  @IsNotEmpty()
  @IsString()
  key: SETTING_NAMES;

  @ApiProperty()
  @IsString()
  @Column()
  @IsString()
  value: string;
}
