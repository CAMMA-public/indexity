import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'password-reset-hashes' })
export class PasswordResetHashEntity {
  @PrimaryColumn()
  userId: UserEntity['id'];

  @OneToOne(() => UserEntity, { primary: true })
  @JoinColumn()
  user: UserEntity;

  @Column()
  hash: string;
}
