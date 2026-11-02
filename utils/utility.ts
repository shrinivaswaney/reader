import { Manga } from '@/types/manga.types';
import { ContinueReading } from '@/types/userPreferences.types';

const TYPE_COLOURS: Record<Manga['type'], string> = {
  manga: '#38bdf8', // blue
  manhwa: '#a855f7', // purple
  manhua: '#f59e0b', // yellow
};

export const returnColourForMangaType = (manga: Manga) => TYPE_COLOURS[manga.type];

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getProgress(item: ContinueReading) {
  const progress = item.totalPagesInChapter > 0 ? item.lastPage / item.totalPagesInChapter : 0;
  return progress;
}
