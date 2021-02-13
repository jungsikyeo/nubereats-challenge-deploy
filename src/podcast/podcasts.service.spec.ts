import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';

import { PodcastsService } from './podcasts.service';

export type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockedRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const podcastObj1: Podcast = {
  id: 1,
  title: 'Pod1',
  category: 'Music Story',
  rating: 3,
  episodes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const podcastObj2: Podcast = {
  id: 2,
  title: 'Pod2',
  category: 'Live Music',
  rating: 5,
  episodes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const episodeObj1: Episode = {
  id: 10,
  title: 'Music is my life',
  category: 'Life',
  createdAt: new Date(),
  updatedAt: new Date(),
  podcast: podcastObj1,
};

const episodeObj2: Episode = {
  id: 20,
  title: 'Dance Live',
  category: 'Dance',
  createdAt: new Date(),
  updatedAt: new Date(),
  podcast: podcastObj2,
};

const InternalServerErrorOutput = {
  ok: false,
  error: 'Internal server error occurred.',
};

describe('PodcastService', () => {
  let service: PodcastsService;
  let podcastRepository: MockRepository<Podcast>;
  let episodeRepository: MockRepository<Episode>;

  podcastObj1.episodes.push(episodeObj1);
  podcastObj2.episodes.push(episodeObj2);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodcastsService,
        {
          provide: getRepositoryToken(Podcast),
          useValue: mockedRepository(),
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockedRepository(),
        },
      ],
    }).compile();

    service = module.get<PodcastsService>(PodcastsService);
    podcastRepository = module.get(getRepositoryToken(Podcast));
    episodeRepository = module.get(getRepositoryToken(Episode));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(podcastRepository).toBeDefined();
    expect(episodeRepository).toBeDefined();
  });

  describe('getAllPodcasts', () => {
    it('should success to return podcasts', async () => {
      const podcasts = [podcastObj1, podcastObj2];
      podcastRepository.find.mockResolvedValueOnce(podcasts);
      const result = await service.getAllPodcasts();
      expect(podcastRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        ok: true,
        podcasts,
      });
    });

    it('should fail on exception', async () => {
      podcastRepository.find.mockRejectedValueOnce(new Error());

      const result = await service.getAllPodcasts();
      expect(podcastRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('createPodcast', () => {
    it('should success to create Podcast', async () => {
      const createArgs = {
        title: podcastObj1.title,
        category: podcastObj1.category,
      };
      podcastRepository.create.mockReturnValueOnce(createArgs);
      podcastRepository.save.mockResolvedValueOnce(podcastObj1);

      const result = await service.createPodcast(createArgs);

      expect(podcastRepository.create).toHaveBeenCalledTimes(1);
      expect(podcastRepository.create).toHaveBeenCalledWith(createArgs);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(createArgs);
      expect(result).toMatchObject({ ok: true, id: podcastObj1.id });
    });

    it('should failed to create Podcast', async () => {
      const createArgs = {
        title: podcastObj1.title,
        category: podcastObj1.category,
      };
      podcastRepository.create.mockReturnValueOnce(createArgs);
      podcastRepository.save.mockRejectedValueOnce(new Error());

      const result = await service.createPodcast(createArgs);
      expect(podcastRepository.create).toHaveBeenCalledTimes(1);
      expect(podcastRepository.create).toHaveBeenCalledWith(createArgs);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(createArgs);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('getPodcast', () => {
    it('should find an existing podcast', async () => {
      const createArgs = podcastObj1.id;
      const findOneArgs = [{ id: podcastObj1.id }, { relations: ['episodes'] }];
      podcastRepository.findOne.mockResolvedValueOnce(podcastObj1);
      const result = await service.getPodcast(createArgs);

      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(...findOneArgs);
      expect(result).toMatchObject({ ok: true, podcast: podcastObj1 });
    });

    it('should fail if no podcast is found', async () => {
      const createArgs = podcastObj1.id;
      const findOneArgs = [{ id: podcastObj1.id }, { relations: ['episodes'] }];
      podcastRepository.findOne.mockResolvedValueOnce(null);
      const result = await service.getPodcast(createArgs);

      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(...findOneArgs);
      expect(result).toMatchObject({
        ok: false,
        error: `Podcast with id ${podcastObj1.id} not found`,
      });
    });

    it('should fail on exception', async () => {
      const createArgs = podcastObj1.id;
      const findOneArgs = [{ id: podcastObj1.id }, { relations: ['episodes'] }];
      podcastRepository.findOne.mockRejectedValueOnce(new Error());
      const result = await service.getPodcast(createArgs);

      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(...findOneArgs);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('deletePodcast', () => {
    it('should success to delete', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));
      const result = await service.deletePodcast(podcastObj1.id);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ ok: true });
    });
    it('should fail on exception', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));
      podcastRepository.delete.mockRejectedValueOnce(new Error());
      const result = await service.deletePodcast(podcastObj1.id);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });

    it('should failed to delete, because of no podcast is found', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: false,
        error: `Podcast with id ${id} not found`,
      }));
      const result = await service.deletePodcast(podcastObj1.id);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.delete).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject({
        ok: false,
        error: `Podcast with id ${podcastObj1.id} not found`,
      });
    });
  });

  describe('updatePodcast', () => {
    it('should success to update Podcast', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));
      const payload = { rating: 3 };
      const result = await service.updatePodcast({
        id: podcastObj1.id,
        payload,
      });
      const expectedArgs = { ...podcastObj1, ...payload };

      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(expectedArgs);
      expect(result).toMatchObject({ ok: true });
    });
    it('should success to update Podcast without rating', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));
      const payload = { rating: null };
      const result = await service.updatePodcast({
        id: podcastObj1.id,
        payload,
      });
      const expectedArgs = { ...podcastObj1, ...payload };

      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(expectedArgs);
      expect(result).toMatchObject({ ok: true });
    });
    it('should fail on exception', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));
      const payload = { rating: 3 };
      podcastRepository.save.mockRejectedValueOnce(new Error());
      const result = await service.updatePodcast({
        id: podcastObj1.id,
        payload,
      });
      const expectedArgs = { ...podcastObj1, ...payload };

      expect(payload.rating).not.toBeNull();
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(expectedArgs);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
    it('should fail if invalid payload', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));
      const payload = { rating: 200 };
      const result = await service.updatePodcast({
        id: podcastObj1.id,
        payload,
      });

      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.save).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject({
        ok: false,
        error: 'Rating must be between 1 and 5.',
      });
    });
    it('should failed to update, because of no podcast is found', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: false,
        error: `Podcast with id ${id} not found`,
      }));
      const payload = { rating: 3 };
      const result = await service.updatePodcast({
        id: podcastObj1.id,
        payload,
      });

      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(podcastRepository.save).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject({
        ok: false,
        error: `Podcast with id ${podcastObj1.id} not found`,
      });
    });
  });

  describe('getEpisodes', () => {
    it('should success to get episodes', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));

      const result = await service.getEpisodes(podcastObj1.id);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(result).toMatchObject({
        ok: true,
        episodes: [episodeObj1],
      });
    });
    it('should failed to get episodes, because of no podcast is found', async () => {
      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: false,
        error: `Podcast with id ${id} not found`,
      }));
      const result = await service.getEpisodes(podcastObj1.id);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(result).toMatchObject({
        ok: false,
        error: `Podcast with id ${podcastObj1.id} not found`,
      });
    });
    it('should fail on exception', async () => {
      jest.spyOn(service, 'getPodcast').mockRejectedValue(new Error());
      const result = await service.getEpisodes(podcastObj1.id);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('getEpisode', () => {
    it('should succuess to get episode', async () => {
      jest.spyOn(service, 'getEpisodes').mockImplementationOnce(async id => ({
        ok: true,
        episodes: [episodeObj1],
      }));

      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      };

      const result = await service.getEpisode(inputArgs);
      expect(service.getEpisodes).toHaveBeenCalledTimes(1);
      expect(service.getEpisodes).toHaveBeenCalledWith(podcastObj1.id);
      expect(result).toMatchObject({ ok: true, episode: episodeObj1 });
    });
    it('should failed to get episode, because of no podcast is found', async () => {
      jest.spyOn(service, 'getEpisodes').mockImplementationOnce(async id => ({
        ok: false,
        error: `Podcast with id ${id} not found`,
      }));

      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      };

      const result = await service.getEpisode(inputArgs);
      expect(service.getEpisodes).toHaveBeenCalledTimes(1);
      expect(service.getEpisodes).toHaveBeenCalledWith(podcastObj1.id);
      expect(result).toMatchObject({
        ok: false,
        error: `Podcast with id ${podcastObj1.id} not found`,
      });
    });
    it('should fail if no episode is found', async () => {
      jest.spyOn(service, 'getEpisodes').mockImplementationOnce(async id => ({
        ok: true,
        episodes: [episodeObj1],
      }));

      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj2.id,
      };

      const result = await service.getEpisode(inputArgs);
      expect(service.getEpisodes).toHaveBeenCalledTimes(1);
      expect(service.getEpisodes).toHaveBeenCalledWith(podcastObj1.id);

      expect(result).toMatchObject({
        ok: false,
        error: `Episode with id ${inputArgs.episodeId} not found in podcast with id ${inputArgs.podcastId}`,
      });
    });
    it('should fail on exception', async () => {
      jest.spyOn(service, 'getEpisodes').mockRejectedValue(new Error());

      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj2.id,
      };

      const result = await service.getEpisode(inputArgs);
      expect(service.getEpisodes).toHaveBeenCalledTimes(1);
      expect(service.getEpisodes).toHaveBeenCalledWith(podcastObj1.id);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('createEpisode', () => {
    it('should success to create Episode', async () => {
      const createArgs = {
        title: episodeObj1.title,
        category: episodeObj1.category,
      };
      const inputArgs = {
        podcastId: podcastObj1.id,
        ...createArgs,
      };
      const expectedSaveArgs = {
        ...createArgs,
        podcast: podcastObj1,
      };

      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));

      episodeRepository.create.mockReturnValueOnce({ ...createArgs });
      episodeRepository.save.mockResolvedValueOnce(episodeObj1);
      const result = await service.createEpisode(inputArgs);

      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(episodeRepository.create).toHaveBeenCalledTimes(1);
      expect(episodeRepository.create).toHaveBeenCalledWith(createArgs);
      expect(episodeRepository.save).toHaveBeenCalledTimes(1);
      expect(episodeRepository.save).toHaveBeenCalledWith(expectedSaveArgs);
      expect(result).toMatchObject({
        ok: true,
        id: episodeObj1.id,
      });
    });

    it('should failed to create episode, because of no podcast is found', async () => {
      const createArgs = {
        title: episodeObj1.title,
        category: episodeObj1.category,
      };
      const inputArgs = {
        podcastId: podcastObj1.id,
        ...createArgs,
      };

      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: false,
        error: `Podcast with id ${id} not found`,
      }));

      const result = await service.createEpisode(inputArgs);
      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(episodeRepository.create).toHaveBeenCalledTimes(0);
      expect(episodeRepository.save).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject({
        ok: false,
        error: `Podcast with id ${podcastObj1.id} not found`,
      });
    });

    it('should fail on exception', async () => {
      const createArgs = {
        title: episodeObj1.title,
        category: episodeObj1.category,
      };
      const inputArgs = {
        podcastId: podcastObj1.id,
        ...createArgs,
      };
      const expectedSaveArgs = {
        ...createArgs,
        podcast: podcastObj1,
      };

      jest.spyOn(service, 'getPodcast').mockImplementationOnce(async id => ({
        ok: true,
        podcast: podcastObj1,
      }));

      episodeRepository.create.mockReturnValue({ ...createArgs });
      episodeRepository.save.mockRejectedValueOnce(new Error());
      const result = await service.createEpisode(inputArgs);

      expect(service.getPodcast).toHaveBeenCalledTimes(1);
      expect(service.getPodcast).toHaveBeenCalledWith(podcastObj1.id);
      expect(episodeRepository.create).toHaveBeenCalledTimes(1);
      expect(episodeRepository.create).toHaveBeenCalledWith(createArgs);
      expect(episodeRepository.save).toHaveBeenCalledTimes(1);
      expect(episodeRepository.save).toHaveBeenCalledWith(expectedSaveArgs);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('deleteEpisode', () => {
    it('should success to delete Episode', async () => {
      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      };

      jest
        .spyOn(service, 'getEpisode')
        .mockImplementationOnce(async ({ podcastId, episodeId }) => ({
          ok: true,
          episode: episodeObj1,
        }));

      const result = await service.deleteEpisode(inputArgs);

      expect(service.getEpisode).toHaveBeenCalledTimes(1);
      expect(service.getEpisode).toHaveBeenCalledWith(inputArgs);
      expect(episodeRepository.delete).toHaveBeenCalledTimes(1);
      expect(episodeRepository.delete).toHaveBeenCalledWith({
        id: episodeObj1.id,
      });
      expect(result).toMatchObject({ ok: true });
    });

    it('should failed to delete episode, because of no podcast is found', async () => {
      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      };

      jest
        .spyOn(service, 'getEpisode')
        .mockImplementationOnce(async ({ podcastId, episodeId }) => ({
          ok: false,
          error: `Episode with id ${episodeId} not found in podcast with id ${podcastId}`,
        }));

      const result = await service.deleteEpisode(inputArgs);

      expect(service.getEpisode).toHaveBeenCalledTimes(1);
      expect(service.getEpisode).toHaveBeenCalledWith(inputArgs);
      expect(episodeRepository.delete).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject({
        ok: false,
        error: `Episode with id ${inputArgs.episodeId} not found in podcast with id ${inputArgs.podcastId}`,
      });
    });
    it('should fail on exception', async () => {
      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      };

      jest
        .spyOn(service, 'getEpisode')
        .mockImplementationOnce(async ({ podcastId, episodeId }) => ({
          ok: true,
          episode: episodeObj1,
        }));

      episodeRepository.delete.mockRejectedValue(new Error());
      const result = await service.deleteEpisode(inputArgs);

      expect(service.getEpisode).toHaveBeenCalledTimes(1);
      expect(service.getEpisode).toHaveBeenCalledWith(inputArgs);
      expect(episodeRepository.delete).toHaveBeenCalledTimes(1);
      expect(episodeRepository.delete).toHaveBeenCalledWith({
        id: episodeObj1.id,
      });
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('updateEpisode', () => {
    it('should success to update', async () => {
      const updateArgs = { title: 'R&B Live' };
      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
        ...updateArgs,
      };

      jest
        .spyOn(service, 'getEpisode')
        .mockImplementationOnce(async ({ podcastId, episodeId }) => ({
          ok: true,
          episode: episodeObj1,
        }));

      const result = await service.updateEpisode(inputArgs);
      const expectedSaveArgs = {
        ...episodeObj1,
        ...updateArgs,
      };

      expect(service.getEpisode).toHaveBeenCalledTimes(1);
      expect(service.getEpisode).toHaveBeenCalledWith({
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      });
      expect(episodeRepository.save).toHaveBeenCalledTimes(1);
      expect(episodeRepository.save).toHaveBeenCalledWith(expectedSaveArgs);
      expect(result).toMatchObject({ ok: true });
    });

    it('should failed to update, because of no episode is found', async () => {
      const updateArgs = { title: 'R&B Live' };
      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
        ...updateArgs,
      };

      jest
        .spyOn(service, 'getEpisode')
        .mockImplementationOnce(async ({ podcastId, episodeId }) => ({
          ok: false,
          error: `Episode with id ${episodeId} not found in podcast with id ${podcastId}`,
        }));

      const result = await service.updateEpisode(inputArgs);

      expect(service.getEpisode).toHaveBeenCalledTimes(1);
      expect(service.getEpisode).toHaveBeenCalledWith({
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      });
      expect(episodeRepository.save).toHaveBeenCalledTimes(0);
      expect(result).toMatchObject({
        ok: false,
        error: `Episode with id ${inputArgs.episodeId} not found in podcast with id ${inputArgs.podcastId}`,
      });
    });
    it('should fail on exception', async () => {
      const updateArgs = { title: 'R&B Live' };
      const inputArgs = {
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
        ...updateArgs,
      };

      jest
        .spyOn(service, 'getEpisode')
        .mockImplementationOnce(async ({ podcastId, episodeId }) => ({
          ok: true,
          episode: episodeObj1,
        }));

      episodeRepository.save.mockRejectedValueOnce(new Error());

      const result = await service.updateEpisode(inputArgs);
      const expectedSaveArgs = {
        ...episodeObj1,
        ...updateArgs,
      };

      expect(service.getEpisode).toHaveBeenCalledTimes(1);
      expect(service.getEpisode).toHaveBeenCalledWith({
        podcastId: podcastObj1.id,
        episodeId: episodeObj1.id,
      });
      expect(episodeRepository.save).toHaveBeenCalledTimes(1);
      expect(episodeRepository.save).toHaveBeenCalledWith(expectedSaveArgs);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });
});
