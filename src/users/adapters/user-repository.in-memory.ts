import { User } from '../entities/user.entity';
import { IUserRepository } from '../ports/user-repository.interface';

export class InMemoryUserRepository implements IUserRepository {
  constructor(private readonly users: User[] = []) {}

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.props.id === id) ?? null;
  }
}
