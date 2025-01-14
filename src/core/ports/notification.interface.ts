import { User } from 'src/users/entities/user.entity';
import { Webinar } from 'src/webinars/entities/webinar.entity';

export interface INotificationService {
  notifyNewParticipant(webinar: Webinar, participant: User): Promise<void>;
}
