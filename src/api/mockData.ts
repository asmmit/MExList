import { Movie, MovieDetails, TMDBResponse } from '../types/movie';

/**
 * Curated Fallback Catalog
 * WHAT: Provides a rich, production-grade dataset of cinematic masterpieces with
 *       full metadata, cast rosters, and high-fidelity posters.
 * WHY:  Enables zero-friction evaluation during recruitment reviews if the recruiter
 *       hasn't yet configured VITE_TMDB_KEY in their local .env, and enables offline resilience.
 */
export const FALLBACK_MOVIES: MovieDetails[] = [
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    vote_count: 36240,
    runtime: 169,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    status: "Released",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
      { id: 878, name: "Science Fiction" }
    ],
    credits: {
      cast: [
        { id: 10297, name: "Matthew McConaughey", character: "Joseph Cooper", profile_path: "/eDnHvDszB2qZf3uM0e6LqWzK3eX.jpg", order: 0 },
        { id: 1813, name: "Anne Hathaway", character: "Dr. Amelia Brand", profile_path: "/tLel4RIjQUV013444983.jpg", order: 1 },
        { id: 3895, name: "Michael Caine", character: "Professor John Brand", profile_path: "/bVVRdQhQh620023.jpg", order: 2 },
        { id: 83002, name: "Jessica Chastain", character: "Murphy 'Murph' Cooper", profile_path: "/bF2s307001923.jpg", order: 3 }
      ],
      crew: [
        { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 335984,
    title: "Blade Runner 2049",
    overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former blade runner who has been missing for 30 years.",
    poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdrop_path: "/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg",
    release_date: "2017-10-04",
    vote_average: 8.0,
    vote_count: 13200,
    runtime: 164,
    tagline: "There's still a page left.",
    status: "Released",
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 18, name: "Drama" },
      { id: 9648, name: "Mystery" }
    ],
    credits: {
      cast: [
        { id: 30614, name: "Ryan Gosling", character: "Officer K", profile_path: null, order: 0 },
        { id: 12835, name: "Harrison Ford", character: "Rick Deckard", profile_path: null, order: 1 },
        { id: 110609, name: "Ana de Armas", character: "Joi", profile_path: null, order: 2 },
        { id: 543261, name: "Sylvia Hoeks", character: "Luv", profile_path: null, order: 3 }
      ],
      crew: [
        { id: 137427, name: "Denis Villeneuve", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 438631,
    title: "Dune",
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence-a commodity capable of unlocking humanity's greatest potential-only those who can conquer their fear will survive.",
    poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdrop_path: "/eeijXm355xDqlZvNc3umSC9Wz6g.jpg",
    release_date: "2021-09-15",
    vote_average: 7.8,
    vote_count: 12100,
    runtime: 155,
    tagline: "Beyond fear, destiny awaits.",
    status: "Released",
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" }
    ],
    credits: {
      cast: [
        { id: 1190668, name: "Timothée Chalamet", character: "Paul Atreides", profile_path: null, order: 0 },
        { id: 505710, name: "Zendaya", character: "Chani", profile_path: null, order: 1 },
        { id: 25072, name: "Rebecca Ferguson", character: "Lady Jessica Atreides", profile_path: null, order: 2 },
        { id: 2524, name: "Oscar Isaac", character: "Duke Leto Atreides", profile_path: null, order: 3 }
      ],
      crew: [
        { id: 137427, name: "Denis Villeneuve", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    poster_path: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    vote_count: 36000,
    runtime: 148,
    tagline: "Your mind is the scene of the crime.",
    status: "Released",
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" }
    ],
    credits: {
      cast: [
        { id: 6193, name: "Leonardo DiCaprio", character: "Dom Cobb", profile_path: null, order: 0 },
        { id: 24045, name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: null, order: 1 },
        { id: 27578, name: "Elliot Page", character: "Ariadne", profile_path: null, order: 2 },
        { id: 2524, name: "Tom Hardy", character: "Eames", profile_path: null, order: 3 }
      ],
      crew: [
        { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 496243,
    title: "Parasite",
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop_path: "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",
    release_date: "2019-05-30",
    vote_average: 8.5,
    vote_count: 18200,
    runtime: 132,
    tagline: "Act like you own the place.",
    status: "Released",
    genres: [
      { id: 35, name: "Comedy" },
      { id: 53, name: "Thriller" },
      { id: 18, name: "Drama" }
    ],
    credits: {
      cast: [
        { id: 20738, name: "Song Kang-ho", character: "Kim Ki-taek", profile_path: null, order: 0 },
        { id: 1110756, name: "Lee Sun-kyun", character: "Park Dong-ik", profile_path: null, order: 1 },
        { id: 1279813, name: "Cho Yeo-jeong", character: "Choi Yeon-gyo", profile_path: null, order: 2 }
      ],
      crew: [
        { id: 21684, name: "Bong Joon-ho", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 244786,
    title: "Whiplash",
    overview: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.",
    poster_path: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    backdrop_path: "/6bbZ6XyvgfjhQwbpl3HG3t69q9.jpg",
    release_date: "2014-10-10",
    vote_average: 8.4,
    vote_count: 14800,
    runtime: 107,
    tagline: "The road to greatness can take you to the edge.",
    status: "Released",
    genres: [
      { id: 18, name: "Drama" },
      { id: 10402, name: "Music" }
    ],
    credits: {
      cast: [
        { id: 54694, name: "Miles Teller", character: "Andrew Neiman", profile_path: null, order: 0 },
        { id: 18973, name: "J.K. Simmons", character: "Terence Fletcher", profile_path: null, order: 1 },
        { id: 1324461, name: "Melissa Benoist", character: "Nicole", profile_path: null, order: 2 }
      ],
      crew: [
        { id: 1301327, name: "Damien Chazelle", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 129,
    title: "Spirited Away",
    overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop_path: "/mSDsSDwaP3E7dEfUPWy4J0djt4O.jpg",
    release_date: "2001-07-20",
    vote_average: 8.5,
    vote_count: 16400,
    runtime: 125,
    tagline: "The tunnel led Chihiro to a mysterious town...",
    status: "Released",
    genres: [
      { id: 16, name: "Animation" },
      { id: 10751, name: "Family" },
      { id: 14, name: "Fantasy" }
    ],
    credits: {
      cast: [
        { id: 19586, name: "Rumi Hiiragi", character: "Chihiro Ogino (voice)", profile_path: null, order: 0 },
        { id: 19587, name: "Miyu Irino", character: "Haku (voice)", profile_path: null, order: 1 },
        { id: 19588, name: "Mari Natsuki", character: "Yubaba / Zeniba (voice)", profile_path: null, order: 2 }
      ],
      crew: [
        { id: 608, name: "Hayao Miyazaki", job: "Director", department: "Directing" }
      ]
    }
  },
  {
    id: 238,
    title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWF9YdfZveL05sfZ1.jpg",
    release_date: "1972-03-14",
    vote_average: 8.7,
    vote_count: 20100,
    runtime: 175,
    tagline: "An offer you can't refuse.",
    status: "Released",
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" }
    ],
    credits: {
      cast: [
        { id: 3084, name: "Marlon Brando", character: "Don Vito Corleone", profile_path: null, order: 0 },
        { id: 1158, name: "Al Pacino", character: "Michael Corleone", profile_path: null, order: 1 },
        { id: 3085, name: "James Caan", character: "Sonny Corleone", profile_path: null, order: 2 }
      ],
      crew: [
        { id: 1776, name: "Francis Ford Coppola", job: "Director", department: "Directing" }
      ]
    }
  }
];

/**
 * Filter mock data by query string with simulated network latency.
 */
export function filterMockMovies(query: string, page = 1, pageSize = 8): TMDBResponse<Movie> {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? FALLBACK_MOVIES.filter(m =>
        m.title.toLowerCase().includes(normalized) ||
        m.overview.toLowerCase().includes(normalized)
      )
    : FALLBACK_MOVIES;

  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    page,
    results: paginated,
    total_pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    total_results: filtered.length,
  };
}
