import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'activation_hashes' })
export class UserActivationHashEntity {
  @PrimaryColumn()
  userId: UserEntity['id'];

  @OneToOne(() => UserEntity, { primary: true })
  @JoinColumn()
  user: UserEntity;

  @Column()
  hash: string;
}
