// src/mocks/mangadexSample.ts
import type { Manga } from '@/types/manga.types';
import { ContinueReading } from '@/types/userPreferences.types';
import { MANGA_TAGS_BY_GROUP } from './mangaTags';

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/400/600`;

export const continueReading: ContinueReading[] = [
  {
    id: 'md-01',
    title: 'Solo Leveling',
    coverUrl: cover('sololeveling'),
    type: 'manhwa',
    genres: ['Action', 'Fantasy'],
    rating: 9.2,
    lastChapter: 142,
    lastPage: 12,
    totalPagesInChapter: 34,
  },
  {
    id: 'md-09',
    title: 'Chainsaw Man',
    coverUrl: cover('chainsawman'),
    type: 'manga',
    genres: ['Action', 'Horror'],
    rating: 8.8,
    lastChapter: 158,
    lastPage: 8,
    totalPagesInChapter: 19,
  },
  {
    id: 'md-04',
    title: 'Omniscient Reader',
    coverUrl: cover('orv'),
    type: 'manhwa',
    genres: ['Fantasy', 'Drama'],
    rating: 9.1,
    lastChapter: 76,
    lastPage: 3,
    totalPagesInChapter: 28,
  },
  {
    id: 'md-16',
    title: 'Battle Through the Heavens',
    coverUrl: cover('btth'),
    type: 'manhua',
    genres: ['Action', 'Fantasy', 'Martial Arts'],
    rating: 7.9,
    lastChapter: 512,
    lastPage: 20,
    totalPagesInChapter: 22,
  },
];

export const trending: Manga[] = [
  {
    id: 'md-14',
    title: 'Berserk',
    coverUrl: cover('berserk'),
    type: 'manga',
    genres: ['Action', 'Horror', 'Fantasy'],
    rating: 9.5,
    latestChapter: 375,
  },
  {
    id: 'md-11',
    title: 'One Piece',
    coverUrl: cover('onepiece'),
    type: 'manga',
    genres: ['Action', 'Adventure', 'Comedy'],
    rating: 9.3,
    latestChapter: 1120,
  },
  {
    id: 'md-12',
    title: 'Vagabond',
    coverUrl: cover('vagabond'),
    type: 'manga',
    genres: ['Action', 'Historical', 'Drama'],
    rating: 9.4,
    latestChapter: 327,
  },
  {
    id: 'md-02',
    title: 'Tower of God',
    coverUrl: cover('towerofgod'),
    type: 'manhwa',
    genres: ['Action', 'Fantasy', 'Mystery'],
    rating: 8.7,
    latestChapter: 605,
  },
  {
    id: 'md-15',
    title: 'Attack on Titan',
    coverUrl: cover('aot'),
    type: 'manga',
    genres: ['Action', 'Horror', 'Mystery'],
    rating: 9.1,
    latestChapter: 139,
  },
  {
    id: 'md-10',
    title: 'Jujutsu Kaisen',
    coverUrl: cover('jjk'),
    type: 'manga',
    genres: ['Action', 'Supernatural'],
    rating: 8.9,
    latestChapter: 271,
  },
];

// NOTE: latestChapter values here are deliberately small to simulate "just added"
// titles for this shelf — not the real current chapter counts for these series.
// Once the sync worker is live, this shelf should be driven by createdAt/updatedAt
// from MangaDex, not a hand-picked chapter number.
export const newReleases: Manga[] = [
  {
    id: 'md-06',
    title: 'Sweet Home',
    coverUrl: cover('sweethome'),
    type: 'manhwa',
    genres: ['Horror', 'Survival'],
    rating: 8.5,
    latestChapter: 5,
  },
  {
    id: 'md-17',
    title: "The King's Avatar",
    coverUrl: cover('tka'),
    type: 'manhua',
    genres: ['Sports', 'Drama'],
    rating: 8.2,
    latestChapter: 3,
  },
  {
    id: 'md-19',
    title: 'Apotheosis',
    coverUrl: cover('apotheosis'),
    type: 'manhua',
    genres: ['Action', 'Fantasy', 'Martial Arts'],
    rating: 7.6,
    latestChapter: 2,
  },
  {
    id: 'md-07',
    title: 'The Legendary Moonlight Sculptor',
    coverUrl: cover('lmsculptor'),
    type: 'manhwa',
    genres: ['Action', 'Fantasy', 'Isekai'],
    rating: 8.4,
    latestChapter: 7,
  },
];

export const genreShelf: string[] = MANGA_TAGS_BY_GROUP.genre.map((tag) => tag.name);
