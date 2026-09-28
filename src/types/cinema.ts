export type SeatTier = "standard" | "vip" | "lovers";

export interface Screening {
  id: string;
  dayLabel: "Today" | "Tomorrow" | "Weekend";
  date: string;
  time: string;
  hall: string;
  format: "70mm IMAX" | "Dolby Atmos" | "35mm Vintage" | "Laser VIP";
  price: number;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  genres: string[];
  year: number;
  duration: string;
  rating: string;
  ageRating: string;
  director: string;
  cast: string[];
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  stills: string[];
  youtubeTrailerId: string;
  dominantColor: string;
  accentColor: string;
  glowRgba: string;
  screenings: Screening[];
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  status: "available" | "selected" | "reserved";
}

export interface Ticket {
  ticketId: string;
  movieTitle: string;
  posterUrl: string;
  screeningTime: string;
  screeningDate: string;
  hall: string;
  format: string;
  seats: string[];
  seatTier: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  purchaseDate: string;
  barcode: string;
}
