import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { Participation } from '../entities/participation.entity';
import { Webinar } from '../entities/webinar.entity';
import { AlreadyParticipatingException } from '../exceptions/already-participating';
import { NoSeatsAvailableException } from '../exceptions/no-seats-available';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { INotificationService } from 'src/core/ports/notification.interface';

type Request = {
  webinarId: string;
  user: User;
};

type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinar = await this.getWebinar(request.webinarId);
    await this.validateParticipation(webinar, request.user);
    await this.createParticipation(webinar, request.user);
    await this.notificationService.notifyNewParticipant(webinar, request.user);
  }

  private async getWebinar(webinarId: string): Promise<Webinar> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new Error('Webinar not found');
    }
    return webinar;
  }

  private async validateParticipation(
    webinar: Webinar,
    user: User,
  ): Promise<void> {
    const existingParticipations =
      await this.participationRepository.findByWebinarId(webinar.props.id);

    this.validateNotAlreadyParticipating(existingParticipations, user);
    this.validateSeatsAvailable(existingParticipations, webinar);
  }

  private validateNotAlreadyParticipating(
    participations: Participation[],
    user: User,
  ): void {
    const alreadyParticipating = participations.some(
      (p) => p.props.userId === user.props.id,
    );
    if (alreadyParticipating) {
      throw new AlreadyParticipatingException();
    }
  }

  private validateSeatsAvailable(
    participations: Participation[],
    webinar: Webinar,
  ): void {
    if (participations.length >= webinar.props.seats) {
      throw new NoSeatsAvailableException();
    }
  }

  private async createParticipation(
    webinar: Webinar,
    user: User,
  ): Promise<void> {
    const participation = new Participation({
      userId: user.props.id,
      webinarId: webinar.props.id,
    });
    await this.participationRepository.save(participation);
  }
}
