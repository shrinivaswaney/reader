import { useLocalSearchParams } from 'expo-router';
import MangaDetailScreen from '@/features/manga-detail/MangaDetailScreen';

// Route shell only — all screen logic lives in features/manga-detail.
export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MangaDetailScreen mangaId={id} />;
}
