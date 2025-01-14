import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation-repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  private participations: Participation[] = [];

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.participations.filter((p) => p.props.webinarId === webinarId);
  }

  async save(participation: Participation): Promise<void> {
    this.participations.push(participation);
  }
}
