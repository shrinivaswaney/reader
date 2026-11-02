import { ContinueReadingItem, Manga } from "@/types/manga.types";

// Swap for real MangaDex cover URLs once the API is wired in.
const cover = (seed: string) => `https://picsum.photos/seed/${seed}/400/600`;

export const continueReading: ContinueReadingItem[] = [
  {
    externalId: '1', title: 'Ashfall Requiem', coverUrl: cover('ashfall'),
    type: 'manhwa', genres: ['Action', 'Fantasy'], rating: 8.7,
    lastChapter: 142, lastPage: 12, totalPagesInChapter: 34,
  },
  {
    externalId: '2', title: 'The Quiet Wolf', coverUrl: cover('quietwolf'),
    type: 'manga', genres: ['Drama', 'Slice of Life'], rating: 9.1,
    lastChapter: 58, lastPage: 20, totalPagesInChapter: 22,
  },
  {
    externalId: '3', title: 'Nine Lanterns', coverUrl: cover('lanterns'),
    type: 'manhua', genres: ['Mystery'], rating: 8.2,
    lastChapter: 76, lastPage: 3, totalPagesInChapter: 28,
  },
];

export const trending: Manga[] = [
  { externalId: '4', title: 'Iron Magnolia', coverUrl: cover('magnolia'), type: 'manhwa', genres: ['Action', 'Romance'], rating: 9.4, latestChapter: 201 },
  { externalId: '5', title: 'Static Season', coverUrl: cover('static'), type: 'manga', genres: ['Sci-Fi'], rating: 8.9, latestChapter: 44 },
  { externalId: '6', title: 'Paper Moon Diner', coverUrl: cover('papermoon'), type: 'manga', genres: ['Comedy', 'Slice of Life'], rating: 8.5, latestChapter: 112 },
  { externalId: '7', title: 'Crimson Ferryman', coverUrl: cover('ferryman'), type: 'manhua', genres: ['Horror'], rating: 8.8, latestChapter: 67 },
  { externalId: '8', title: 'Lowtide City', coverUrl: cover('lowtide'), type: 'manhwa', genres: ['Thriller'], rating: 9.0, latestChapter: 88 },
];

export const newReleases: Manga[] = [
  { externalId: '9', title: 'Glasswing', coverUrl: cover('glasswing'), type: 'manhwa', genres: ['Fantasy'], rating: 8.3, latestChapter: 3 },
  { externalId: '10', title: 'Hollow Orchard', coverUrl: cover('orchard'), type: 'manga', genres: ['Drama'], rating: 8.6, latestChapter: 5 },
  { externalId: '11', title: 'Wire & Marrow', coverUrl: cover('wiremarrow'), type: 'manhua', genres: ['Sci-Fi', 'Action'], rating: 8.1, latestChapter: 2 },
  { externalId: '12', title: 'Salt Cathedral', coverUrl: cover('saltcathedral'), type: 'manhwa', genres: ['Mystery'], rating: 8.9, latestChapter: 7 },
];

export const genreShelf = ['Action', 'Romance', 'Fantasy', 'Horror', 'Comedy', 'Sci-Fi', 'Slice of Life', 'Mystery'];
