import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import { User } from 'src/users/entities/user.entity';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { BookSeat } from './book-seat';
import { INotificationService } from 'src/core/ports/notification.interface';

describe('Feature: Book a seat in a webinar', () => {
  let useCase: BookSeat;
  let participationRepository: InMemoryParticipationRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let notificationService: jest.Mocked<INotificationService>;

  const user = new User({
    id: 'user-1',
    email: 'user@test.com',
    password: 'password',
  });

  const organizer = new User({
    id: 'organizer-1',
    email: 'organizer@test.com',
    password: 'password',
  });

  const webinar = new Webinar({
    id: 'webinar-1',
    organizerId: organizer.props.id,
    title: 'Test Webinar',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-01'),
    seats: 2,
  });

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository();
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    notificationService = {
      notifyNewParticipant: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new BookSeat(
      participationRepository,
      webinarRepository,
      notificationService,
    );
  });

  describe('Scenario: Successfully booking a seat', () => {
    it('should create a participation', async () => {
      await useCase.execute({
        webinarId: webinar.props.id,
        user,
      });

      const participations = await participationRepository.findByWebinarId(
        webinar.props.id,
      );
      expect(participations).toHaveLength(1);
      expect(participations[0].props.userId).toBe(user.props.id);
    });

    it('should notify about new participant', async () => {
      await useCase.execute({
        webinarId: webinar.props.id,
        user,
      });

      expect(notificationService.notifyNewParticipant).toHaveBeenCalledWith(
        webinar,
        user,
      );
    });
  });

  describe('Scenario: No seats available', () => {
    beforeEach(async () => {
      const otherUser = new User({
        id: 'user-2',
        email: 'other@test.com',
        password: 'password',
      });

      await useCase.execute({
        webinarId: webinar.props.id,
        user: otherUser,
      });
      await useCase.execute({
        webinarId: webinar.props.id,
        user: organizer,
      });
    });

    it('should throw an error', async () => {
      await expect(
        useCase.execute({
          webinarId: webinar.props.id,
          user,
        }),
      ).rejects.toThrow('No seats available for this webinar');
    });
  });

  describe('Scenario: Already participating', () => {
    beforeEach(async () => {
      await useCase.execute({
        webinarId: webinar.props.id,
        user,
      });
    });

    it('should throw an error', async () => {
      await expect(
        useCase.execute({
          webinarId: webinar.props.id,
          user,
        }),
      ).rejects.toThrow('User is already participating in this webinar');
    });
  });
});
