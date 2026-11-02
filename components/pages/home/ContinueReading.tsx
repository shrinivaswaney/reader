import { MangaCard } from '@/components/manga/TitleCard';
import { ContinueReading } from '@/types/userPreferences.types';

type Props = {
  item: ContinueReading;
  onPress: () => void;
};

export function ContinueReadingCard({ item, onPress }: Props) {
  const progress = item.totalPagesInChapter > 0 ? item.lastPage / item.totalPagesInChapter : 0;
  return <MangaCard manga={item} onPress={onPress} progress={progress} />;
}
