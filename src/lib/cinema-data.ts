export interface FilmStill {
  url: string;
  caption?: string;
  aspectRatio?: string;
}

export interface FilmReview {
  critic: string;
  publication: string;
  quote: string;
  rating?: string;
}

export interface FilmSpecs {
  format?: string;
  aspectRatio?: string;
  sound?: string;
  color?: string;
}

export interface FilmScreeningSlot {
  time: string;
  date: string;
  format: string;
  auditorium: string;
  availability: 'Selling Fast' | 'Available' | 'Few Seats Left';
}

export interface CinemaFilm {
  id: number;
  slug: string;
  title: string;
  image: string;
  category: string;
  imdbRating: string;
  director: string;
  year: number;
  duration: string;
  tagline: string;
  synopsis: string;
  stills: FilmStill[];
  reviews: FilmReview[];
  specs: FilmSpecs;
}

export interface CinemaHall {
  id: string;
  name: string;
  shortName: string;
  type: 'vip' | 'standard' | 'kids';
  capacity: number;
  sound: string;
  projection: string;
  description: string;
}

export interface Screening {
  id: string;
  filmId: number;
  date: string; // YYYY-MM-DD e.g. "2026-09-28"
  time: string; // HH:mm e.g. "18:00"
  hallId: string;
  tag: 'VIP Salle' | 'Kids Only' | 'Standard' | 'Director Q&A' | 'Midnight Special';
  format: string;
  availability: 'Available' | 'Selling Fast' | 'Few Seats Left';
  notes?: string;
}

export const CINEMA_HALLS: CinemaHall[] = [
  {
    id: 'vip-salle',
    name: 'VIP Salle — Salon Privé',
    shortName: 'VIP Salle',
    type: 'vip',
    capacity: 34,
    sound: 'Dolby Atmos 64-Channel Private Array',
    projection: 'Artisanal Salon Presentation',
    description: 'Ultra-plush leather recliners with dedicated artisanal beverage service.',
  },
  {
    id: 'screen-1',
    name: 'Screen 1 — Grand Auditorium',
    shortName: 'Screen 1',
    type: 'standard',
    capacity: 280,
    sound: '12-Channel Custom Immersive Audio',
    projection: 'Grand Auditorium Presentation',
    description: 'Our flagship auditorium equipped for grand premiere presentations.',
  },
  {
    id: 'auditorium-2',
    name: 'Auditorium 2 — Main Hall',
    shortName: 'Auditorium 2',
    type: 'standard',
    capacity: 160,
    sound: 'Spatial Audio Precision Soundstage',
    projection: 'Digital Main Hall Presentation',
    description: 'Reference black levels and spatial audio precision.',
  },
  {
    id: 'kids-arena',
    name: 'Kids Arena — Hall 3',
    shortName: 'Kids Arena',
    type: 'kids',
    capacity: 85,
    sound: 'Soft Adaptive Family Acoustics',
    projection: 'Family-Friendly Presentation',
    description: 'Gentle ambient lighting, tiered family seating, and sound calibrated for younger ears.',
  },
];

export const INITIAL_FILMS: CinemaFilm[] = [
  {
    "id": 1,
    "slug": "the-shawshank-redemption",
    "title": "The Shawshank Redemption",
    "image": "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Drama",
    "imdbRating": "9.3",
    "director": "Frank Darabont",
    "year": 1994,
    "duration": "2h 22m",
    "tagline": "Nominated for 7 Oscars. 21 wins & 43 nominations total",
    "synopsis": "Chronicles the experiences of a formerly successful banker as a prisoner in the gloomy jailhouse of Shawshank after being found guilty of a crime he did not commit. The film portrays the man's unique way of dealing with his new, torturous life; along the way he befriends a number of fellow prisoners, most notably a wise long-term inmate named Red.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "The Shawshank Redemption — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Roger Ebert",
        "publication": "Chicago Sun-Times",
        "quote": "The Shawshank Redemption is a film that ennobles human dignity and hope, achieving true cinematic grandeur through patience and deep humanity.",
        "rating": "4/4 ★"
      },
      {
        "critic": "Vincent Canby",
        "publication": "The New York Times",
        "quote": "A triumphant, quietly uplifting prison drama directed with remarkable sensitivity and masterly narrative command.",
        "rating": "Essential"
      }
    ],
    "specs": {
      "format": "35mm Archival Print / 4K Digital Master",
      "aspectRatio": "1.85:1 Academy Flat",
      "sound": "Dolby Atmos 5.1 Restored Array",
      "color": "Technicolor Laboratory"
    }
  },
  {
    "id": 2,
    "slug": "the-godfather",
    "title": "The Godfather",
    "image": "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Crime · Drama",
    "imdbRating": "9.2",
    "director": "Francis Ford Coppola",
    "year": 1972,
    "duration": "2h 55m",
    "tagline": "Won 3 Oscars. 31 wins & 31 nominations total",
    "synopsis": "The Godfather \"Don\" Vito Corleone is the head of the Corleone mafia family in New York. He is at the event of his daughter's wedding. Michael, Vito's youngest son and a decorated WWII Marine is also present at the wedding. Michael seems to be uninterested in being a part of the family business. Vito is a powerful man, and is kind to all those who give him respect but is ruthless against those who do not. But when a powerful and treacherous rival wants to sell drugs and needs the Don's influence for the same, Vito refuses to do it. What follows is a clash between Vito's fading old values and the new ways which may cause Michael to do the thing he was most reluctant in doing and wage a mob war against all the other mafia families which could tear the Corleone family apart.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "The Godfather — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Roger Ebert",
        "publication": "Chicago Sun-Times",
        "quote": "The Godfather is not only a great popular entertainment, but an inspired work of cinematic art. One of the undisputed masterworks of world cinema.",
        "rating": "4/4 ★"
      },
      {
        "critic": "Pauline Kael",
        "publication": "The New Yorker",
        "quote": "If ever there was a great example of how the best popular movies come out of a merger of commerce and art, The Godfather is it.",
        "rating": "Essential"
      }
    ],
    "specs": {
      "format": "35mm Theatrical Preservation Print",
      "aspectRatio": "1.85:1 Academy Flat",
      "sound": "Restored 5.1 DTS-HD Master Audio",
      "color": "Technicolor Dye-Transfer Process"
    }
  },
  {
    "id": 3,
    "slug": "the-dark-knight",
    "title": "The Dark Knight",
    "image": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    "category": "Action · Crime · Drama",
    "imdbRating": "9.1",
    "director": "Christopher Nolan",
    "year": 2008,
    "duration": "2h 32m",
    "tagline": "Won 2 Oscars. 163 wins & 165 nominations total",
    "synopsis": "Set within a year after the events of Batman Begins (2005), Batman, Lieutenant James Gordon, and new District Attorney Harvey Dent successfully begin to round up the criminals that plague Gotham City, until a mysterious and sadistic criminal mastermind known only as \"The Joker\" appears in Gotham, creating a new wave of chaos. Batman's struggle against The Joker becomes deeply personal, forcing him to \"confront everything he believes\" and improve his technology to stop him. A love triangle develops between Bruce Wayne, Dent, and Rachel Dawes.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
        "caption": "The Dark Knight — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Peter Travers",
        "publication": "Rolling Stone",
        "quote": "The Dark Knight is pitch-black, brilliant, and unforgettable. Heath Ledger's Joker is an explosive tour de force for the ages.",
        "rating": "4/4 ★"
      },
      {
        "critic": "Manohla Dargis",
        "publication": "The New York Times",
        "quote": "Christopher Nolan bridges the divide between artistic ambition and blockbuster spectacle with unprecedented cinematic muscle.",
        "rating": "Critics Pick"
      }
    ],
    "specs": {
      "format": "70mm IMAX 15/70 Presentation",
      "aspectRatio": "1.43:1 IMAX / 2.39:1 Scope",
      "sound": "Dolby Atmos 64-Channel Array",
      "color": "Original Photochemical Color Master"
    }
  },
  {
    "id": 4,
    "slug": "the-godfather-part-ii",
    "title": "The Godfather Part II",
    "image": "https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Crime · Drama",
    "imdbRating": "9.0",
    "director": "Francis Ford Coppola",
    "year": 1974,
    "duration": "3h 22m",
    "tagline": "Won 6 Oscars. 17 wins & 21 nominations total",
    "synopsis": "The continuing saga of the Corleone crime family tells the story of a young Vito Corleone growing up in Sicily and in 1910s New York; and follows Michael Corleone in the 1950s as he attempts to expand the family business into Las Vegas, Hollywood and Cuba.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "The Godfather Part II — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Vincent Canby",
        "publication": "The New York Times",
        "quote": "The Godfather Part II is a brilliant, operatic tapestry that deepens and expands upon its predecessor with Shakespearean tragedy.",
        "rating": "Masterpiece"
      },
      {
        "critic": "Gene Siskel",
        "publication": "Chicago Tribune",
        "quote": "One of the greatest sequels ever made, featuring transcendent performances from Al Pacino and Robert De Niro.",
        "rating": "4/4 ★"
      }
    ],
    "specs": {
      "format": "35mm Studio Archival Reference",
      "aspectRatio": "1.85:1 Academy Flat",
      "sound": "Restored 5.1 Discrete Surround",
      "color": "Technicolor Dye-Transfer Process"
    }
  },
  {
    "id": 5,
    "slug": "the-lord-of-the-rings-the-return-of-the-king",
    "title": "The Lord of the Rings: The Return of the King",
    "image": "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Adventure · Drama · Fantasy",
    "imdbRating": "9.0",
    "director": "Peter Jackson",
    "year": 2003,
    "duration": "3h 21m",
    "tagline": "Won 11 Oscars. 215 wins & 124 nominations total",
    "synopsis": "The final confrontation between the forces of good and evil fighting for control of the future of Middle-earth. Frodo and Sam reach Mordor in their quest to destroy the One Ring, while Aragorn leads the forces of good against Sauron's evil army at the stone city of Minas Tirith.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "The Lord of the Rings: The Return of the King — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Richard Corliss",
        "publication": "TIME Magazine",
        "quote": "Peter Jackson delivers a staggering triumph. A monumental climax to the greatest fantasy trilogy in motion picture history.",
        "rating": "10/10"
      },
      {
        "critic": "Roger Ebert",
        "publication": "Chicago Sun-Times",
        "quote": "A masterpiece of visual storytelling, emotional resonance, and sheer scale that will stand untouched for generations.",
        "rating": "4/4 ★"
      }
    ],
    "specs": {
      "format": "4K Laser Extended Roadshow Edition",
      "aspectRatio": "2.39:1 Anamorphic Scope",
      "sound": "Dolby Atmos 12-Channel Immersive",
      "color": "Digital Intermediate Color Grade"
    }
  },
  {
    "id": 6,
    "slug": "12-angry-men",
    "title": "12 Angry Men",
    "image": "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Crime · Drama",
    "imdbRating": "9.0",
    "director": "Sidney Lumet",
    "year": 1957,
    "duration": "1h 36m",
    "tagline": "Nominated for 3 Oscars. 16 wins & 12 nominations total",
    "synopsis": "The defense and the prosecution have rested, and the jury is filing into the jury room to decide if a young man is guilty or innocent of murdering his father. What begins as an open-and-shut case of murder soon becomes a detective story that presents a succession of clues creating doubt, and a mini-drama of each of the jurors' prejudices and preconceptions about the trial, the accused, AND each other. Based on the play, all of the action takes place on the stage of the jury room.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "12 Angry Men — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "A.H. Weiler",
        "publication": "The New York Times",
        "quote": "12 Angry Men is a tense, absorbing, and compelling drama that reaches into the very conscience of jury deliberation and human justice.",
        "rating": "Classic"
      },
      {
        "critic": "Roger Ebert",
        "publication": "Chicago Sun-Times",
        "quote": "Sidney Lumet uses camera angles and claustrophobic framing with unmatched precision. A textbook in pure dramatic mastery.",
        "rating": "4/4 ★"
      }
    ],
    "specs": {
      "format": "35mm Black & White Fine-Grain Master",
      "aspectRatio": "1.66:1 European Aspect",
      "sound": "Uncompressed Monaural Archival Sound",
      "color": "Kodak Double-X Monochrome"
    }
  },
  {
    "id": 7,
    "slug": "the-lord-of-the-rings-the-fellowship-of-the-ring",
    "title": "The Lord of the Rings: The Fellowship of the Ring",
    "image": "https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Adventure · Drama · Fantasy",
    "imdbRating": "8.9",
    "director": "Peter Jackson",
    "year": 2001,
    "duration": "2h 58m",
    "tagline": "Won 4 Oscars. 126 wins & 127 nominations total",
    "synopsis": "An ancient Ring thought lost for centuries has been found, and through a strange twist of fate has been given to a small Hobbit named Frodo. When Gandalf discovers the Ring is in fact the One Ring of the Dark Lord Sauron, Frodo must make an epic quest to Mount Doom in order to destroy it. However, he does not go alone. He is joined by Gandalf, Legolas the elf, Gimli the Dwarf, Aragorn, Boromir, and his three Hobbit friends Merry, Pippin, and Samwise. Through mountains, snow, darkness, forests, rivers and plains, facing evil and danger at every corner the Fellowship of the Ring must go. Their quest to destroy the One Ring is the only hope for the end of the Dark Lords reign.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "The Lord of the Rings: The Fellowship of the Ring — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Kenneth Turan",
        "publication": "Los Angeles Times",
        "quote": "Jackson creates an immersive mythical universe of breathtaking beauty, profound camaraderie, and visceral adventure.",
        "rating": "A+"
      },
      {
        "critic": "Peter Travers",
        "publication": "Rolling Stone",
        "quote": "The Fellowship of the Ring captures the pure majesty of Tolkien's epic world with heart-stopping grandeur.",
        "rating": "4/4 ★"
      }
    ],
    "specs": {
      "format": "4K Laser Extended Roadshow Edition",
      "aspectRatio": "2.39:1 Anamorphic Scope",
      "sound": "Dolby Atmos 12-Channel Immersive",
      "color": "Digital Intermediate Color Grade"
    }
  },
  {
    "id": 8,
    "slug": "pulp-fiction",
    "title": "Pulp Fiction",
    "image": "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Crime · Drama",
    "imdbRating": "8.8",
    "director": "Quentin Tarantino",
    "year": 1994,
    "duration": "2h 34m",
    "tagline": "Won 1 Oscar. 69 wins & 72 nominations total",
    "synopsis": "Jules Winnfield (Samuel L. Jackson) and Vincent Vega (John Travolta) are two hitmen who are out to retrieve a suitcase stolen from their employer, mob boss Marsellus Wallace (Ving Rhames). Wallace has also asked Vincent to take his wife Mia (Uma Thurman) out a few days later when Wallace himself will be out of town. Butch Coolidge (Bruce Willis) is an aging boxer who is paid by Wallace to lose his fight. The lives of these seemingly unrelated people are woven together comprising of a series of funny, bizarre and uncalled-for incidents.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "Pulp Fiction — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Todd McCarthy",
        "publication": "Variety",
        "quote": "Pulp Fiction is a tour de force of intoxicating dialogue, non-linear swagger, and pop-culture brilliance that redefined American indie cinema.",
        "rating": "Palme d'Or"
      },
      {
        "critic": "Janet Maslin",
        "publication": "The New York Times",
        "quote": "Quentin Tarantino strikes pure cinematic gold. Hypnotic, wildly entertaining, and razor-sharp from first frame to last.",
        "rating": "Critics Pick"
      }
    ],
    "specs": {
      "format": "35mm Vintage 1994 Theatrical Print",
      "aspectRatio": "2.35:1 Panavision Scope",
      "sound": "Dolby Digital 5.1 Discrete",
      "color": "Deluxe Color Laboratory"
    }
  },
  {
    "id": 9,
    "slug": "fight-club",
    "title": "Fight Club",
    "image": "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Crime · Drama · Thriller",
    "imdbRating": "8.8",
    "director": "David Fincher",
    "year": 1999,
    "duration": "2h 19m",
    "tagline": "Nominated for 1 Oscar. 12 wins & 38 nominations total",
    "synopsis": "A nameless first-person narrator attends support groups in an attempt to subdue his emotional state and relieve his insomniac state. When he meets Marla, another fake attendee of support groups, his life seems to become a little more bearable. However, when he associates himself with Tyler he is dragged into an underground fight club and soap-making scheme. Together the two men spiral out of control and engage in competitive rivalry for love and power.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "Fight Club — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "David Ansen",
        "publication": "Newsweek",
        "quote": "David Fincher directs with ferociously dark wit and breathtaking visual ingenuity. An unforgettable satirical sledgehammer.",
        "rating": "Cult Icon"
      },
      {
        "critic": "Peter Travers",
        "publication": "Rolling Stone",
        "quote": "Fight Club is a visionary adrenaline shot—bold, subversive, and undeniably brilliant filmmaking.",
        "rating": "4/4 ★"
      }
    ],
    "specs": {
      "format": "35mm Special Midnight Exhibition",
      "aspectRatio": "2.39:1 Super 35 Scope",
      "sound": "5.1 Surround Sound Discrete",
      "color": "Technicolor Enriched Bleach Bypass"
    }
  },
  {
    "id": 10,
    "slug": "gladiator",
    "title": "Gladiator",
    "image": "https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Action · Adventure · Drama",
    "imdbRating": "8.5",
    "director": "Ridley Scott",
    "year": 2000,
    "duration": "2h 35m",
    "tagline": "Won 5 Oscars. 61 wins & 105 nominations total",
    "synopsis": "Maximus is a powerful Roman general, loved by the people and the aging Emperor, Marcus Aurelius. Before his death, the Emperor chooses Maximus to be his heir over his own son, Commodus, and a power struggle leaves Maximus and his family condemned to death. The powerful general is captured and put into the Gladiator games until he dies. The only desire that fuels him now is the chance to rise to the top so that he will be able to look into the eyes of the man who will feel his revenge.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "Gladiator — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Elvis Mitchell",
        "publication": "The New York Times",
        "quote": "Ridley Scott crafts a colossal, visceral sword-and-sandals epic anchored by Russell Crowe's towering, soulful authority.",
        "rating": "Critics Pick"
      },
      {
        "critic": "Roger Ebert",
        "publication": "Chicago Sun-Times",
        "quote": "Gladiator brings the Colosseum roaring back to life with sweeping operatic scale and heartfelt tragic power.",
        "rating": "3.5/4 ★"
      }
    ],
    "specs": {
      "format": "70mm Large Format Exhibition",
      "aspectRatio": "2.39:1 Panavision Scope",
      "sound": "Dolby Atmos Discrete Array",
      "color": "Deluxe Color Master"
    }
  },
  {
    "id": 11,
    "slug": "spider-man-across-the-spider-verse",
    "title": "Spider-Man: Across the Spider-Verse",
    "image": "https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Animation · Action · Adventure",
    "imdbRating": "8.5",
    "director": "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
    "year": 2023,
    "duration": "2h 20m",
    "tagline": "Nominated for 1 Oscar. 107 wins & 164 nominations total",
    "synopsis": "Miles Morales returns for the next chapter of the Oscar®-winning Spider-Verse saga, an epic adventure that will transport Brooklyn's full-time, friendly neighborhood Spider-Man across the Multiverse to join forces with Gwen Stacy and a new team of Spider-People to face off with a villain more powerful than anything they have ever encountered.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "Spider-Man: Across the Spider-Verse — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "David Ehrlich",
        "publication": "IndieWire",
        "quote": "Spider-Man: Across the Spider-Verse is an eye-popping visual miracle, reinventing what animation can achieve on the big screen.",
        "rating": "A"
      },
      {
        "critic": "A.O. Scott",
        "publication": "The New York Times",
        "quote": "Dazzling, exuberant, and emotionally rich. A kaleidoscopic superhero masterpiece.",
        "rating": "Critics Pick"
      }
    ],
    "specs": {
      "format": "Dolby Vision Multiverse Digital Master",
      "aspectRatio": "2.39:1 Anamorphic",
      "sound": "Dolby Atmos 3D Immersive",
      "color": "Sony Pictures Animation Color Pipeline"
    }
  },
  {
    "id": 12,
    "slug": "whiplash",
    "title": "Whiplash",
    "image": "https://m.media-amazon.com/images/M/MV5BMDFjOWFkYzktYzhhMC00NmYyLTkwY2EtYjViMDhmNzg0OGFkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "category": "Drama · Music",
    "imdbRating": "8.5",
    "director": "Damien Chazelle",
    "year": 2014,
    "duration": "1h 46m",
    "tagline": "Won 3 Oscars. 100 wins & 144 nominations total",
    "synopsis": "Nineteen year old Andrew Niemann wants to be the greatest jazz drummer in the world, in a league with Buddy Rich. This goal is despite not coming from a pedigree of greatest, musical or otherwise, with Jim, his high school teacher father, being a failed writer. Andrew is starting his first year at Shaffer Conservatory of Music, the best music school in the United States. At Shaffer, being the best means being accepted to study under Terence Fletcher and being asked to play in his studio band, which represents the school at jazz competitions. Based on their less than positive first meeting, Andrew is surprised that Fletcher asks him to join the band, albeit in the alternate drummer position which he is more than happy to do initially. Andrew quickly learns that Fletcher operates on fear and intimidation, never settling for what he considers less than the best each and every time. Being the best in Fletcher's mind does not only entail playing well, but knowing that you're playing well and if not what you're doing wrong. His modus operandi creates an atmosphere of fear and of every man or woman for him/herself within the band. Regardless, Andrew works hard to be the best. He has to figure out his life priorities and what he is willing to sacrifice to be the best. The other question becomes how much emotional abuse he will endure by Fletcher to reach that greatness, which he may believe he can only achieve with the avenues opened up by Fletcher.",
    "stills": [
      {
        "url": "https://m.media-amazon.com/images/M/MV5BMDFjOWFkYzktYzhhMC00NmYyLTkwY2EtYjViMDhmNzg0OGFkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        "caption": "Whiplash — Official Archival Exhibition Artwork",
        "aspectRatio": "2:3 Theatrical"
      }
    ],
    "reviews": [
      {
        "critic": "Peter Travers",
        "publication": "Rolling Stone",
        "quote": "Whiplash is a thrilling, blood-soaked musical collision between obsession and perfection. J.K. Simmons is terrifyingly brilliant.",
        "rating": "4/4 ★"
      },
      {
        "critic": "Manohla Dargis",
        "publication": "The New York Times",
        "quote": "Damien Chazelle conducts a fiercely electric, nerve-shredding duel that leaves you breathless.",
        "rating": "Critics Pick"
      }
    ],
    "specs": {
      "format": "35mm Festival Archival Print",
      "aspectRatio": "2.39:1 Scope",
      "sound": "5.1 DTS Master Surround",
      "color": "Arri Raw Color Master"
    }
  }
];

export const INITIAL_SCREENINGS: Screening[] = [
  {
    "id": "scr-28-sp-kids",
    "filmId": 11,
    "date": "2026-09-28",
    "time": "10:00",
    "hallId": "kids-arena",
    "tag": "Kids Only",
    "format": "Family Matinee",
    "availability": "Available",
    "notes": "Calibrated acoustics for younger ears. Free Spider-Verse poster sheet."
  },
  {
    "id": "scr-28-sp-vip",
    "filmId": 11,
    "date": "2026-09-28",
    "time": "15:00",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Dolby Atmos Luxury Recliner",
    "availability": "Selling Fast",
    "notes": "Artisanal snack service and lounge admission."
  },
  {
    "id": "scr-28-sh-std",
    "filmId": 1,
    "date": "2026-09-28",
    "time": "17:30",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Archival 35mm Master",
    "availability": "Few Seats Left",
    "notes": "Original theatrical audio mix."
  },
  {
    "id": "scr-28-gf-std",
    "filmId": 2,
    "date": "2026-09-28",
    "time": "18:00",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Salon Privé 4K",
    "availability": "Selling Fast",
    "notes": "Restored under Francis Ford Coppola supervision."
  },
  {
    "id": "scr-28-dk-imax",
    "filmId": 3,
    "date": "2026-09-28",
    "time": "19:30",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "70mm IMAX Laser",
    "availability": "Selling Fast",
    "notes": "Full 1.43:1 expanded aspect ratio sequences."
  },
  {
    "id": "scr-28-pf-mid",
    "filmId": 8,
    "date": "2026-09-28",
    "time": "22:45",
    "hallId": "auditorium-2",
    "tag": "Midnight Special",
    "format": "Vintage 1994 Print",
    "availability": "Available",
    "notes": "Midnight presentation."
  },
  {
    "id": "scr-29-12a-am",
    "filmId": 6,
    "date": "2026-09-29",
    "time": "11:00",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Black & White Archival",
    "availability": "Available",
    "notes": "Restored from the original 35mm fine-grain master."
  },
  {
    "id": "scr-29-sp-kids",
    "filmId": 11,
    "date": "2026-09-29",
    "time": "13:30",
    "hallId": "kids-arena",
    "tag": "Kids Only",
    "format": "Family Matinee",
    "availability": "Available",
    "notes": "Family admission with soft lighting."
  },
  {
    "id": "scr-29-lotr1-road",
    "filmId": 7,
    "date": "2026-09-29",
    "time": "15:00",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Extended Roadshow 4K",
    "availability": "Selling Fast",
    "notes": "Includes 15-minute intermission."
  },
  {
    "id": "scr-29-whip-vip",
    "filmId": 12,
    "date": "2026-09-29",
    "time": "18:15",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Uncompressed DTS Master",
    "availability": "Few Seats Left",
    "notes": "Audiophile acoustic tuning."
  },
  {
    "id": "scr-29-gf2-std",
    "filmId": 4,
    "date": "2026-09-29",
    "time": "19:30",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Archival Technicolor",
    "availability": "Selling Fast",
    "notes": "Coppola anniversary restoration."
  },
  {
    "id": "scr-29-fc-mid",
    "filmId": 9,
    "date": "2026-09-29",
    "time": "23:00",
    "hallId": "auditorium-2",
    "tag": "Midnight Special",
    "format": "35mm Midnight Special",
    "availability": "Few Seats Left",
    "notes": "Doors close at 22:55."
  },
  {
    "id": "scr-30-glad-std",
    "filmId": 10,
    "date": "2026-09-30",
    "time": "16:00",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "70mm Large Format",
    "availability": "Available",
    "notes": "Sweeping orchestral Atmos presentation."
  },
  {
    "id": "scr-30-sh-vip",
    "filmId": 1,
    "date": "2026-09-30",
    "time": "18:30",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Salon Privé Presentation",
    "availability": "Few Seats Left",
    "notes": "Includes curator program introduction."
  },
  {
    "id": "scr-30-lotr2-road",
    "filmId": 5,
    "date": "2026-09-30",
    "time": "20:00",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Extended Roadshow 4K",
    "availability": "Selling Fast",
    "notes": "Final battle in 12-channel immersive audio."
  },
  {
    "id": "scr-30-dk-vip",
    "filmId": 3,
    "date": "2026-09-30",
    "time": "21:45",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Dolby Atmos Luxury",
    "availability": "Selling Fast",
    "notes": "Includes souvenir film strip."
  },
  {
    "id": "scr-01-gf-vip",
    "filmId": 2,
    "date": "2026-10-01",
    "time": "17:00",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Salon Privé 4K",
    "availability": "Available",
    "notes": "Private leather recliner salon."
  },
  {
    "id": "scr-01-12a-std",
    "filmId": 6,
    "date": "2026-10-01",
    "time": "19:00",
    "hallId": "auditorium-2",
    "tag": "Standard",
    "format": "Uncompressed Mono",
    "availability": "Available",
    "notes": "Acoustically tuned for dialogue clarity."
  },
  {
    "id": "scr-01-pf-std",
    "filmId": 8,
    "date": "2026-10-01",
    "time": "20:45",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "35mm Theatrical Print",
    "availability": "Selling Fast",
    "notes": "Tarantino signature presentation."
  },
  {
    "id": "scr-02-sp-kids",
    "filmId": 11,
    "date": "2026-10-02",
    "time": "14:00",
    "hallId": "kids-arena",
    "tag": "Kids Only",
    "format": "Family Matinee",
    "availability": "Available",
    "notes": "Adaptive acoustic level."
  },
  {
    "id": "scr-02-whip-std",
    "filmId": 12,
    "date": "2026-10-02",
    "time": "17:30",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Dolby Atmos Master",
    "availability": "Available",
    "notes": "High-dynamics percussion soundtrack."
  },
  {
    "id": "scr-02-fc-vip",
    "filmId": 9,
    "date": "2026-10-02",
    "time": "20:15",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Salon Privé 4K",
    "availability": "Selling Fast",
    "notes": "Fincher approved color timing."
  },
  {
    "id": "scr-03-lotr1-std",
    "filmId": 7,
    "date": "2026-10-03",
    "time": "16:00",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Roadshow 4K",
    "availability": "Available",
    "notes": "Full Fellowship journey."
  },
  {
    "id": "scr-03-glad-vip",
    "filmId": 10,
    "date": "2026-10-03",
    "time": "19:30",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Dolby Atmos Recliner",
    "availability": "Few Seats Left",
    "notes": "Zimmer score in discrete surround."
  },
  {
    "id": "scr-03-dk-std",
    "filmId": 3,
    "date": "2026-10-03",
    "time": "21:45",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "70mm IMAX Laser",
    "availability": "Selling Fast",
    "notes": "Peak evening presentation."
  },
  {
    "id": "scr-04-sh-std",
    "filmId": 1,
    "date": "2026-10-04",
    "time": "17:00",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Archival 35mm Master",
    "availability": "Selling Fast",
    "notes": "Weekend opening presentation."
  },
  {
    "id": "scr-04-lotr2-std",
    "filmId": 5,
    "date": "2026-10-04",
    "time": "19:45",
    "hallId": "screen-1",
    "tag": "Standard",
    "format": "Extended Roadshow 4K",
    "availability": "Selling Fast",
    "notes": "Grand finale."
  },
  {
    "id": "scr-04-pf-vip",
    "filmId": 8,
    "date": "2026-10-04",
    "time": "22:15",
    "hallId": "vip-salle",
    "tag": "VIP Salle",
    "format": "Salon Privé 4K",
    "availability": "Few Seats Left",
    "notes": "Late evening salon."
  }
];

export const STORAGE_FILMS_KEY = 'cenima_films_v2';
export const STORAGE_SCREENINGS_KEY = 'cenima_screenings_v2';

export function getFilms(): CinemaFilm[] {
  if (typeof window === 'undefined') return INITIAL_FILMS;
  try {
    const raw = localStorage.getItem(STORAGE_FILMS_KEY);
    if (!raw) return INITIAL_FILMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FILMS;
  } catch {
    return INITIAL_FILMS;
  }
}

export function saveFilms(films: CinemaFilm[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_FILMS_KEY, JSON.stringify(films));
    window.dispatchEvent(new Event('cenima_data_updated'));
  } catch (err) {
    console.error('Failed to save films:', err);
  }
}

export function getScreenings(): Screening[] {
  if (typeof window === 'undefined') return INITIAL_SCREENINGS;
  try {
    const raw = localStorage.getItem(STORAGE_SCREENINGS_KEY);
    if (!raw) return INITIAL_SCREENINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SCREENINGS;
  } catch {
    return INITIAL_SCREENINGS;
  }
}

export function saveScreenings(screenings: Screening[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SCREENINGS_KEY, JSON.stringify(screenings));
    window.dispatchEvent(new Event('cenima_data_updated'));
  } catch (err) {
    console.error('Failed to save screenings:', err);
  }
}

export function getScreeningsForDate(dateStr: string, screeningsList?: Screening[]): Screening[] {
  const list = screeningsList || getScreenings();
  return list
    .filter((s) => s.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getDistinctDates(screeningsList?: Screening[]): string[] {
  const list = screeningsList || getScreenings();
  const dateSet = new Set<string>();
  list.forEach((s) => dateSet.add(s.date));
  return Array.from(dateSet).sort();
}
