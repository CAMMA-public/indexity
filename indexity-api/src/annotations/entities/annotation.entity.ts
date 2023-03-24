import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsBoolean,
  IsInt,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { SurgShape } from '../interfaces/surg-shape.interface';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoEntity } from '../../videos/entities/video.entity';
import { AnnotationInterface } from '../interfaces/annotation.interface';
import { AnnotationLabelEntity } from './annotation-label.entity';
import { Exclude, Transform, Type } from 'class-transformer';
import { ValidationGroups } from '../../common/enums/validation-groups.enum';
import { ApiProperty } from '@nestjs/swagger';
import { CleanUserDto } from '../../users/dtos/clean-user.dto';

const ONE_SHOT_DURATION = 33;

@Entity({ name: 'annotations' })
export class AnnotationEntity implements AnnotationInterface {
  @ApiProperty()
  @IsPositive({ groups: [ValidationGroups.UPDATE] })
  @IsInt({ groups: [ValidationGroups.UPDATE] })
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @IsNotEmpty({ always: true })
  @Column({ default: 'comment' })
  category: string;

  @ApiProperty()
  @IsOptional({ always: true })
  @Column({ type: 'json', nullable: true })
  shape?: SurgShape; // TODO Define SurgShape as a proper class to perform validation

  @ApiProperty()
  @IsOptional({ always: true })
  @IsString({ always: true })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty()
  @IsOptional({ groups: [ValidationGroups.UPDATE] })
  @IsInt({ always: true })
  @IsPositive({ always: true })
  @Column({ type: 'integer' })
  duration: number;

  @ApiProperty()
  @IsOptional({ groups: [ValidationGroups.UPDATE] })
  @IsInt({ always: true })
  @Min(0, { always: true })
  @Column({ type: 'integer' })
  timestamp: number;

  @Exclude()
  @IsOptional({ always: true })
  @IsIP()
  @Column({ nullable: true })
  ipAdress?: string;

  // No validation here since this property is server-side defined.
  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(
    () => UserEntity,
    user => user.annotations,
    { nullable: false },
  )
  @Transform(user => new CleanUserDto(user.id, user.name))
  user: UserEntity;

  // No validation here since this property is server-side defined.
  @RelationId((a: AnnotationEntity) => a.user)
  @Column()
  userId: number;

  @ApiProperty({
    type: () => VideoEntity,
  })
  // No validation here since this property is server-side defined.
  @ManyToOne(
    () => VideoEntity,
    video => video.annotations,
    {
      onDelete: 'CASCADE',
    },
  )
  video: VideoEntity;

  @ApiProperty()
  @IsOptional({ groups: [ValidationGroups.UPDATE] })
  @IsPositive({ always: true })
  @IsInt({ always: true })
  @RelationId((a: AnnotationEntity) => a.video)
  @Column()
  videoId: number;

  @RelationId((a: AnnotationEntity) => a.label)
  @Column()
  labelName: string;

  @ApiProperty()
  @IsOptional({ groups: [ValidationGroups.UPDATE] })
  @ValidateNested({ always: true })
  @Type(() => AnnotationLabelEntity)
  @ManyToOne(() => AnnotationLabelEntity, {
    nullable: false,
    eager: true,
    cascade: ['insert', 'update'],
  })
  label: AnnotationLabelEntity;

  @ApiProperty()
  @Column({ default: false })
  isOneShot: boolean;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @Matches(/[a-z0-9]+(_[a-z0-9]+)*/) // Snake case
  @IsNotEmpty({ always: true })
  @Column({ nullable: true })
  instance?: string;

  @ApiProperty()
  @IsOptional({ always: true })
  @IsBoolean({ always: true })
  @Column({ default: false })
  isFalsePositive: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  setIsOneShot(): void {
    this.isOneShot = this.duration === ONE_SHOT_DURATION;
  }
}
