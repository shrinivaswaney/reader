import ReaderScreen from '@/features/reader/ReaderScreen';

// Route shell only — all screen logic lives in features/reader.
// The reader reads its own params (mangaId, chapterId) via useLocalSearchParams,
// so chapter switching happens in place through router.setParams.
export default function Reader() {
  return <ReaderScreen />;
}
