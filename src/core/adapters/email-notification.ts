import { IMailer } from 'src/core/ports/mailer.interface';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { User } from 'src/users/entities/user.entity';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { INotificationService } from '../ports/notification.interface';

export class EmailNotificationService implements INotificationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailer: IMailer,
  ) {}

  async notifyNewParticipant(
    webinar: Webinar,
    participant: User,
  ): Promise<void> {
    const organizer = await this.userRepository.findById(
      webinar.props.organizerId,
    );
    if (organizer) {
      await this.mailer.send({
        to: organizer.props.email,
        subject: `New participant for ${webinar.props.title}`,
        body: `User ${participant.props.email} has registered for your webinar.`,
      });
    }
  }
}
