// used in @Transform to include only wanted properties
import { ApiProperty } from '@nestjs/swagger';

export class CleanUserDto {
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
