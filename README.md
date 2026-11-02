# Blossom Reader

A cross-platform manga reader (iOS / Android / web) built with Expo, Expo Router,
React Query and Supabase. Catalog data comes from the MangaDex public API.

## Get started

```bash
npm install
cp .env.example .env   # fill in Supabase URL + anon key
npx expo start
```

## Architecture

Feature-first layout with strict layer boundaries. Dependencies only ever
point downward: `app → features → shared / api / lib`.

```
app/                  # ROUTES ONLY. Thin wrappers that render a feature screen.
  (tabs)/             #   home · search · library · profile
  manga/[id]/         #   detail — passes params as props into the feature
  reader/[mangaId]/[chapterId]/
  +not-found.tsx      # unmatched deep links
  _layout.tsx         # providers + root ErrorBoundary

features/             # ONE folder per product feature; owns its screen,
  home/               # components, hooks and domain helpers.
  search/
  library/
  profile/
  manga-detail/
  reader/             #   reader-settings.ts · scroll-progress.ts (+ tests)

components/           # Cross-feature building blocks (no feature may be
  manga/              #   the sole consumer): MangaCard lives here because
  ui/                 #   search, library and carousels all render it.
  layout/

api/mangadex/         # The ONLY place that knows about MangaDex:
  client.ts           #   raw HTTP (typed errors, timeout)
  endpoints.ts        #   endpoint facades returning domain models
  transform.ts        #   wire → domain mapping (pure, unit-tested)
  queries.ts          #   react-query hooks — screens never fetch directly
  mangadex.types.ts   #   wire types live next to their adapter

lib/                  # App-wide infrastructure: env validation, Supabase client
mocks/                # Placeholder fixtures awaiting auth/reading-history.
types/                # Domain contracts shared across layers (manga.types.ts),
                      # generated DB types.
constants/theme.ts    # Design tokens — the single source of styling truth.
```

### Principles in practice

- **Thin routes** — `app/` files are ~6 lines; everything testable lives in a feature.
- **Dependency rule** — features import `shared`/`api`/`lib`; never each other.
- **Domain over wire** — screens consume `Manga`, never MangaDex payloads;
  `transform.ts` is the only translator and is pure enough to unit-test.
- **Fail fast on config** — missing env vars crash at boot with a clear message
  (`lib/env.ts`) instead of failing deep inside a screen.
- **Crash containment** — root `ErrorBoundary` keeps one bad screen from
  white-screening the app.
- **Perf-aware rendering** — e.g. the reader's progress rail re-renders only when
  a percent partition flips, not on every scroll frame.

## Commands

```bash
npm run lint    # eslint (expo config)
npx tsc --noEmit # typecheck
npm test        # jest unit tests
npm run ios     # run on iOS simulator
npm run android # run on Android emulator
```
