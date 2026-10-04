"use client"

import * as React from "react"
import { Calendar, Film } from "lucide-react"

import {
  WorksWheel,
  type WorksWheelItem,
  type WorksWheelHandle,
} from "@/registry/crafterui/ui/works-wheel"
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { Component as ExperienceHero } from "@/components/ui/experience-hero"
import { useCinemaTransition } from "@/components/cinema-page-curtains"
import { CinemaLogo } from "@/components/cinema-logo"

const WORKS: WorksWheelItem[] = [
  {
    "id": 1,
    "title": "The Shawshank Redemption",
    "image": "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#the-shawshank-redemption",
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
    },
    "screenings": [
      "Fri 17:30 — Screen 1",
      "Fri 20:45 — Auditorium 2",
      "Sat 19:00 — VIP Salle"
    ],
    "screeningSlots": [
      {
        "time": "17:30",
        "date": "Fri Sep 28",
        "format": "Standard",
        "auditorium": "Screen 1",
        "availability": "Few Seats Left"
      },
      {
        "time": "20:45",
        "date": "Fri Sep 28",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Available"
      },
      {
        "time": "19:00",
        "date": "Sat Sep 29",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Selling Fast"
      }
    ]
  },
  {
    "id": 2,
    "title": "The Godfather",
    "image": "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#the-godfather",
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
    },
    "screenings": [
      "Fri 18:00 — VIP Salle",
      "Fri 21:30 — Screen 1",
      "Sat 17:00 — Auditorium 2"
    ],
    "screeningSlots": [
      {
        "time": "18:00",
        "date": "Fri Sep 28",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Selling Fast"
      },
      {
        "time": "21:30",
        "date": "Fri Sep 28",
        "format": "Standard",
        "auditorium": "Screen 1",
        "availability": "Few Seats Left"
      },
      {
        "time": "17:00",
        "date": "Sat Sep 29",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Available"
      }
    ]
  },
  {
    "id": 3,
    "title": "The Dark Knight",
    "image": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    "href": "#the-dark-knight",
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
    },
    "screenings": [
      "Fri 19:30 — Grand Auditorium",
      "Fri 22:45 — VIP Salle",
      "Sat 20:15 — Grand Auditorium"
    ],
    "screeningSlots": [
      {
        "time": "19:30",
        "date": "Fri Sep 28",
        "format": "IMAX Laser",
        "auditorium": "Grand Auditorium",
        "availability": "Selling Fast"
      },
      {
        "time": "22:45",
        "date": "Fri Sep 28",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Few Seats Left"
      },
      {
        "time": "20:15",
        "date": "Sat Sep 29",
        "format": "IMAX Laser",
        "auditorium": "Grand Auditorium",
        "availability": "Available"
      }
    ]
  },
  {
    "id": 4,
    "title": "The Godfather Part II",
    "image": "https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#the-godfather-part-ii",
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
    },
    "screenings": [
      "Fri 16:45 — Screen 1",
      "Fri 20:30 — Auditorium 2",
      "Sat 18:30 — VIP Salle"
    ],
    "screeningSlots": [
      {
        "time": "16:45",
        "date": "Fri Sep 28",
        "format": "Standard",
        "auditorium": "Screen 1",
        "availability": "Available"
      },
      {
        "time": "20:30",
        "date": "Fri Sep 28",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Selling Fast"
      },
      {
        "time": "18:30",
        "date": "Sat Sep 29",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Few Seats Left"
      }
    ]
  },
  {
    "id": 5,
    "title": "The Lord of the Rings: The Return of the King",
    "image": "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#the-lord-of-the-rings-the-return-of-the-king",
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
    },
    "screenings": [
      "Fri 17:00 — Grand Auditorium",
      "Fri 21:00 — Auditorium 2",
      "Sat 16:30 — Grand Auditorium"
    ],
    "screeningSlots": [
      {
        "time": "17:00",
        "date": "Fri Sep 28",
        "format": "Roadshow 4K",
        "auditorium": "Grand Auditorium",
        "availability": "Selling Fast"
      },
      {
        "time": "21:00",
        "date": "Fri Sep 28",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Available"
      },
      {
        "time": "16:30",
        "date": "Sat Sep 29",
        "format": "Roadshow 4K",
        "auditorium": "Grand Auditorium",
        "availability": "Few Seats Left"
      }
    ]
  },
  {
    "id": 6,
    "title": "12 Angry Men",
    "image": "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#12-angry-men",
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
    },
    "screenings": [
      "Fri 15:00 — Salon Privé",
      "Fri 18:30 — Screen 1",
      "Sat 21:15 — Salon Privé"
    ],
    "screeningSlots": [
      {
        "time": "15:00",
        "date": "Fri Sep 28",
        "format": "Archival 35mm",
        "auditorium": "Salon Privé",
        "availability": "Available"
      },
      {
        "time": "18:30",
        "date": "Fri Sep 28",
        "format": "Standard",
        "auditorium": "Screen 1",
        "availability": "Few Seats Left"
      },
      {
        "time": "21:15",
        "date": "Sat Sep 29",
        "format": "Archival 35mm",
        "auditorium": "Salon Privé",
        "availability": "Selling Fast"
      }
    ]
  },
  {
    "id": 7,
    "title": "The Lord of the Rings: The Fellowship of the Ring",
    "image": "https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#the-lord-of-the-rings-the-fellowship-of-the-ring",
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
    },
    "screenings": [
      "Fri 14:30 — Grand Auditorium",
      "Fri 19:15 — Auditorium 2",
      "Sat 15:30 — Grand Auditorium"
    ],
    "screeningSlots": [
      {
        "time": "14:30",
        "date": "Fri Sep 28",
        "format": "Roadshow 4K",
        "auditorium": "Grand Auditorium",
        "availability": "Available"
      },
      {
        "time": "19:15",
        "date": "Fri Sep 28",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Selling Fast"
      },
      {
        "time": "15:30",
        "date": "Sat Sep 29",
        "format": "Roadshow 4K",
        "auditorium": "Grand Auditorium",
        "availability": "Few Seats Left"
      }
    ]
  },
  {
    "id": 8,
    "title": "Pulp Fiction",
    "image": "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#pulp-fiction",
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
    },
    "screenings": [
      "Fri 19:45 — Screen 1",
      "Fri 22:30 — Auditorium 2",
      "Sat 21:00 — VIP Salle"
    ],
    "screeningSlots": [
      {
        "time": "19:45",
        "date": "Fri Sep 28",
        "format": "35mm Vintage",
        "auditorium": "Screen 1",
        "availability": "Selling Fast"
      },
      {
        "time": "22:30",
        "date": "Fri Sep 28",
        "format": "Midnight Special",
        "auditorium": "Auditorium 2",
        "availability": "Few Seats Left"
      },
      {
        "time": "21:00",
        "date": "Sat Sep 29",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Available"
      }
    ]
  },
  {
    "id": 9,
    "title": "Fight Club",
    "image": "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#fight-club",
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
    },
    "screenings": [
      "Fri 20:00 — Auditorium 2",
      "Fri 23:00 — Screen 1",
      "Sat 22:15 — VIP Salle"
    ],
    "screeningSlots": [
      {
        "time": "20:00",
        "date": "Fri Sep 28",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Available"
      },
      {
        "time": "23:00",
        "date": "Fri Sep 28",
        "format": "Midnight 35mm",
        "auditorium": "Screen 1",
        "availability": "Selling Fast"
      },
      {
        "time": "22:15",
        "date": "Sat Sep 29",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Few Seats Left"
      }
    ]
  },
  {
    "id": 10,
    "title": "Gladiator",
    "image": "https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "href": "#gladiator",
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
    },
    "screenings": [
      "Fri 18:15 — Grand Auditorium",
      "Fri 21:45 — Auditorium 2",
      "Sat 19:30 — VIP Salle"
    ],
    "screeningSlots": [
      {
        "time": "18:15",
        "date": "Fri Sep 28",
        "format": "70mm Large Format",
        "auditorium": "Grand Auditorium",
        "availability": "Available"
      },
      {
        "time": "21:45",
        "date": "Fri Sep 28",
        "format": "Dolby Atmos",
        "auditorium": "Auditorium 2",
        "availability": "Selling Fast"
      },
      {
        "time": "19:30",
        "date": "Sat Sep 29",
        "format": "VIP Salle",
        "auditorium": "VIP Salle",
        "availability": "Few Seats Left"
      }
    ]
  }
];

const glyph = "size-3.5 opacity-70"

export default function WorksWheelDemo() {
  const wheelRef = React.useRef<WorksWheelHandle>(null)
  const { navigate } = useCinemaTransition()

  // Handle cross-tab navigation and deep links to sections
  React.useEffect(() => {
    const handleNav = (e: CustomEvent<string>) => {
      if (e.detail === "home") {
        wheelRef.current?.to(0)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else if (e.detail === "featured") {
        wheelRef.current?.to(1)
      } else if (e.detail === "curations") {
        wheelRef.current?.to(5)
      }
    }

    const checkHash = () => {
      if (typeof window === "undefined") return
      const hash = window.location.hash
      if (hash === "#featured") {
        setTimeout(() => wheelRef.current?.to(1), 250)
      } else if (hash === "#curations" || hash === "#the-godfather") {
        setTimeout(() => wheelRef.current?.to(5), 250)
      }
    }

    checkHash()
    window.addEventListener("cinema-nav" as unknown as keyof WindowEventMap, handleNav as EventListener)
    window.addEventListener("hashchange", checkHash)

    return () => {
      window.removeEventListener("cinema-nav" as unknown as keyof WindowEventMap, handleNav as EventListener)
      window.removeEventListener("hashchange", checkHash)
    }
  }, [])

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Custom Spring Animated Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Desktop Landscape Orb Dark/Light Theme Toggle (Top-Left Corner - Desktop only) */}
      <div className="fixed top-8 left-8 z-50 hidden md:block">
        <LandscapeOrbToggle size={42} />
      </div>

      {/* Mobile Top Navigation Bar (Mobile only - eliminates floating corner clutter) */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 md:hidden px-4 flex items-center justify-between bg-[var(--color-bg-base)]/92 backdrop-blur-xl border-b border-[var(--color-border)]/60 transition-colors">
        <button
          type="button"
          onClick={() => wheelRef.current?.to(0)}
          className="flex items-center gap-1.5 cursor-pointer py-1"
        >
          <CinemaLogo size="sm" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/movies", "Complete Cinema Archive")}
            className="px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[var(--color-border)] bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Film className="size-3 text-amber-500" />
            <span>Movies</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/schedule", "Exhibition Schedule")}
            className="px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[var(--color-border)] bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="size-3 text-amber-500" />
            <span>Schedule</span>
          </button>

          <div className="pl-0.5">
            <LandscapeOrbToggle size={30} />
          </div>
        </div>
      </header>

      {/* Unified Timeline: Experience Hero (t=0) -> Works Wheel (t=1..7) -> Cinema Footer (t=8) */}
      <WorksWheel
        ref={wheelRef}
        items={WORKS}
        label="Works '26"
        action="View"
        hero={<ExperienceHero onExplore={() => wheelRef.current?.to(1)} />}
        onDiscoverAll={() => navigate("/movies", "Complete Cinema Archive")}
        onTurnChange={(t, near) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("cinema-turn-change", {
                detail: { turn: t, active: near },
              })
            )
          }
        }}
        footer={
          <CinemaFooter
            onNavigateHome={() => wheelRef.current?.to(0)}
            onNavigateMovies={() => {
              navigate("/movies", "Complete Cinema Archive")
            }}
            onNavigateSchedule={() => {
              navigate("/schedule", "Exhibition Schedule")
            }}
            onNavigateCurations={() => wheelRef.current?.to(5)}
          />
        }
      />
    </main>
  )
}
