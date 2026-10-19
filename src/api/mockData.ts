import { MediaDetails, MediaItem, TMDBResponse } from '../types/media';

/**
 * Curated Fallback Catalog (Films & TV Series)
 * WHAT: Provides a rich, production-grade dataset of cinematic films and prestige TV series.
 * WHY:  Enables zero-friction evaluation during recruitment reviews if the recruiter
 *       hasn't yet configured VITE_TMDB_KEY in their local .env, and enables offline resilience.
 */
export const FALLBACK_CATALOG: MediaDetails[] = [
  // --- MOVIES ---
  {
    id: 157336,
    mediaType: 'movie',
    title: 'Interstellar',
    year: '2014',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    rating: 8.4,
    voteCount: 36240,
    runtime: 169,
    creator: 'Christopher Nolan',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    status: 'Released',
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' }
    ],
    credits: {
      cast: [
        { id: 10297, name: 'Matthew McConaughey', character: 'Joseph Cooper', profile_path: null, order: 0 },
        { id: 1813, name: 'Anne Hathaway', character: 'Dr. Amelia Brand', profile_path: null, order: 1 },
        { id: 3895, name: 'Michael Caine', character: 'Professor John Brand', profile_path: null, order: 2 },
        { id: 83002, name: 'Jessica Chastain', character: 'Murphy Cooper', profile_path: null, order: 3 }
      ],
      crew: [{ id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }]
    }
  },
  {
    id: 335984,
    mediaType: 'movie',
    title: 'Blade Runner 2049',
    year: '2017',
    overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    posterPath: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropPath: '/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg',
    rating: 8.0,
    voteCount: 13200,
    runtime: 164,
    creator: 'Denis Villeneuve',
    tagline: 'There\'s still a page left.',
    status: 'Released',
    genres: [
      { id: 878, name: 'Science Fiction' },
      { id: 18, name: 'Drama' },
      { id: 9648, name: 'Mystery' }
    ],
    credits: {
      cast: [
        { id: 30614, name: 'Ryan Gosling', character: 'Officer K', profile_path: null, order: 0 },
        { id: 12835, name: 'Harrison Ford', character: 'Rick Deckard', profile_path: null, order: 1 },
        { id: 110609, name: 'Ana de Armas', character: 'Joi', profile_path: null, order: 2 }
      ],
      crew: [{ id: 137427, name: 'Denis Villeneuve', job: 'Director', department: 'Directing' }]
    }
  },
  {
    id: 438631,
    mediaType: 'movie',
    title: 'Dune',
    year: '2021',
    overview: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.',
    posterPath: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdropPath: '/eeijXm355xDqlZvNc3umSC9Wz6g.jpg',
    rating: 7.8,
    voteCount: 12100,
    runtime: 155,
    creator: 'Denis Villeneuve',
    tagline: 'Beyond fear, destiny awaits.',
    status: 'Released',
    genres: [
      { id: 878, name: 'Science Fiction' },
      { id: 12, name: 'Adventure' }
    ],
    credits: {
      cast: [
        { id: 1190668, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: null, order: 0 },
        { id: 505710, name: 'Zendaya', character: 'Chani', profile_path: null, order: 1 }
      ],
      crew: [{ id: 137427, name: 'Denis Villeneuve', job: 'Director', department: 'Directing' }]
    }
  },
  {
    id: 496243,
    mediaType: 'movie',
    title: 'Parasite',
    year: '2019',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    posterPath: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPath: '/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    rating: 8.5,
    voteCount: 18200,
    runtime: 132,
    creator: 'Bong Joon-ho',
    tagline: 'Act like you own the place.',
    status: 'Released',
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 53, name: 'Thriller' },
      { id: 18, name: 'Drama' }
    ],
    credits: {
      cast: [
        { id: 20738, name: 'Song Kang-ho', character: 'Kim Ki-taek', profile_path: null, order: 0 },
        { id: 1110756, name: 'Lee Sun-kyun', character: 'Park Dong-ik', profile_path: null, order: 1 }
      ],
      crew: [{ id: 21684, name: 'Bong Joon-ho', job: 'Director', department: 'Directing' }]
    }
  },

  // --- TV SERIES ---
  {
    id: 1396,
    mediaType: 'tv',
    title: 'Breaking Bad',
    year: '2008',
    overview: 'A chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture and sell crystal meth in order to secure his family\'s future.',
    posterPath: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdropPath: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    rating: 8.9,
    voteCount: 14500,
    runtime: 47,
    numberOfSeasons: 5,
    numberOfEpisodes: 62,
    creator: 'Vince Gilligan',
    tagline: 'Change the equation.',
    status: 'Ended',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' }
    ],
    credits: {
      cast: [
        { id: 17419, name: 'Bryan Cranston', character: 'Walter White', profile_path: null, order: 0 },
        { id: 84497, name: 'Aaron Paul', character: 'Jesse Pinkman', profile_path: null, order: 1 },
        { id: 134531, name: 'Anna Gunn', character: 'Skyler White', profile_path: null, order: 2 }
      ],
      crew: [{ id: 66633, name: 'Vince Gilligan', job: 'Executive Producer', department: 'Production' }]
    }
  },
  {
    id: 76331,
    mediaType: 'tv',
    title: 'Succession',
    year: '2018',
    overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down from the company.',
    posterPath: '/7nRjvul4UZZ3ivYPpuPySY0xy2n.jpg',
    backdropPath: '/r0Skq3lGeqB43d4R5uR47i6r9iB.jpg',
    rating: 8.6,
    voteCount: 3800,
    runtime: 60,
    numberOfSeasons: 4,
    numberOfEpisodes: 39,
    creator: 'Jesse Armstrong',
    tagline: 'Power, politics, money. It\'s all in the family.',
    status: 'Ended',
    genres: [
      { id: 18, name: 'Drama' }
    ],
    credits: {
      cast: [
        { id: 20211, name: 'Brian Cox', character: 'Logan Roy', profile_path: null, order: 0 },
        { id: 120536, name: 'Jeremy Strong', character: 'Kendall Roy', profile_path: null, order: 1 },
        { id: 139572, name: 'Sarah Snook', character: 'Shiv Roy', profile_path: null, order: 2 }
      ],
      crew: [{ id: 1215456, name: 'Jesse Armstrong', job: 'Creator', department: 'Writing' }]
    }
  },
  {
    id: 93405,
    mediaType: 'tv',
    title: 'Severance',
    year: '2022',
    overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',
    posterPath: '/b47lFvVdG1gL65i5B27xWz1H5gH.jpg',
    backdropPath: '/fP1jM242tZ5yK6PqLqf1vB6m8hV.jpg',
    rating: 8.4,
    voteCount: 2200,
    runtime: 52,
    numberOfSeasons: 2,
    numberOfEpisodes: 19,
    creator: 'Dan Erickson',
    tagline: 'Please do not attempt to adjust your memory.',
    status: 'Returning Series',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 9648, name: 'Mystery' },
      { id: 878, name: 'Sci-Fi' }
    ],
    credits: {
      cast: [
        { id: 16851, name: 'Adam Scott', character: 'Mark Scout', profile_path: null, order: 0 },
        { id: 124584, name: 'Patricia Arquette', character: 'Harmony Cobel', profile_path: null, order: 1 },
        { id: 12835, name: 'John Turturro', character: 'Irving Bailiff', profile_path: null, order: 2 }
      ],
      crew: [{ id: 137452, name: 'Ben Stiller', job: 'Director', department: 'Directing' }]
    }
  },
  {
    id: 87108,
    mediaType: 'tv',
    title: 'Chernobyl',
    year: '2019',
    overview: 'The true story of one of the worst man-made catastrophes in history: the catastrophic nuclear accident at the Chernobyl Nuclear Power Plant in April 1986.',
    posterPath: '/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    backdropPath: '/uL6Ad12W90Q95P6oZ5r45u31j9a.jpg',
    rating: 8.7,
    voteCount: 6500,
    runtime: 65,
    numberOfSeasons: 1,
    numberOfEpisodes: 5,
    creator: 'Craig Mazin',
    tagline: 'What is the cost of lies?',
    status: 'Ended',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' }
    ],
    credits: {
      cast: [
        { id: 19398, name: 'Jared Harris', character: 'Valery Legasov', profile_path: null, order: 0 },
        { id: 1640, name: 'Stellan Skarsgård', character: 'Boris Shcherbina', profile_path: null, order: 1 }
      ],
      crew: [{ id: 58535, name: 'Craig Mazin', job: 'Creator', department: 'Writing' }]
    }
  }
];

export const FALLBACK_MOVIES = FALLBACK_CATALOG;

/**
 * Filter mock catalog by query string with client-side media matching.
 */
export function filterMockMedia(query: string, page = 1, pageSize = 8): TMDBResponse<MediaItem> {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? FALLBACK_CATALOG.filter((m) =>
        m.title.toLowerCase().includes(normalized) ||
        m.overview.toLowerCase().includes(normalized)
      )
    : FALLBACK_CATALOG;

  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    page,
    results: paginated,
    total_pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    total_results: filtered.length,
  };
}

export const filterMockMovies = filterMockMedia;
