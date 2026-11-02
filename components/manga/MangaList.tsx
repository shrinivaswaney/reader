import { Manga } from '@/types/manga.types';
import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { MangaCard } from './TitleCard';

// 1. Define custom props for your wrapper component if needed
interface MangaListProps extends Partial<FlatListProps<Manga>> {
  mangas: Manga[];
  filterFunction?: () => void;
  onPress: () => void;
  progress: number;
}

// 2. Destructure mangas and spread the remaining optional FlatList props
const MangaList = ({ mangas, filterFunction, onPress, progress, ...restProps }: MangaListProps) => {
  return (
    <FlatList
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MangaCard manga={item} onPress={onPress} progress={progress} />}
      numColumns={2}
      data={mangas}
      {...defaultListProps} // Apply default layout configurations
      {...restProps} // Allow overriding or adding props from parent context
    />
  );
};

// 3. Define a valid JavaScript object for your default configuration settings
const defaultListProps: Partial<FlatListProps<Manga>> = {
  style: {
    backgroundColor: '#000',
  },
  contentContainerStyle: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  columnWrapperStyle: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
};

export default MangaList;
