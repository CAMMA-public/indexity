import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum STRUCTURE_TRACKER_STATUS {
  START = 'tracking_started',
  SUCCESS = 'tracking_success',
  FAILURE = 'tracking_failure',
}

export class TrackerStatusMsgDto {
  @ApiProperty({
    enum: ['tracking_started', 'tracking_success', 'tracking_failure'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(STRUCTURE_TRACKER_STATUS)
  status: STRUCTURE_TRACKER_STATUS;
}
