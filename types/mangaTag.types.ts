export type TagGroup = 'format' | 'genre' | 'theme' | 'content';

// One MangaDex tag. The `id` is required whenever you query MangaDex's
// /manga endpoint with includedTags/excludedTags — it takes UUIDs, not names.
export type MangaTag = {
  id: string;
  name: string;
  group: TagGroup;
};

// MangaDex's publicationDemographic field — a separate axis from tags.
export type MangaDemographic = 'shounen' | 'shoujo' | 'josei' | 'seinen';

// MangaDex's contentRating field — the actual adult-content gate, not tags.
export type ContentRating = 'safe' | 'suggestive' | 'erotica' | 'pornographic';
