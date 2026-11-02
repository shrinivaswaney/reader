-- ─────────────────────────────────────────────
-- 1. profiles
-- Extends Supabase's built-in auth.users with app-specific fields.
-- ─────────────────────────────────────────────

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique,
    avatar_url text,
    created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username)
    values (new.id, split_part(new.email, '@', 1));
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. library_items
-- A user's saved manga. Denormalized (title/cover stored here) so the
-- Library screen renders instantly without extra API calls to MangaDex.
-- manga_external_id = the MangaDex manga UUID (source of truth for content).
-- ─────────────────────────────────────────────
create type public.library_status as enum (
    'reading',
    'on_hold',
    'completed',
    'dropped',
    'plan_to_read',
    'unfollowed'
);

create table public.library_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    manga_external_id text not null,          -- MangaDex manga id
    manga_title text not null,                -- cached at time of add, refreshed on view
    manga_cover_url text,
    status public.library_status not null default 'unfollowed',
    is_favorite boolean not null default false,
    added_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (user_id, manga_external_id)       -- one entry per manga per user
);

create index library_items_user_idx on public.library_items(user_id);
create index library_items_favorite_idx on public.library_items(user_id, is_favorite) where is_favorite = true;

-- ─────────────────────────────────────────────
-- 3. reading_progress
-- Tracks the last chapter/page read per manga, for "Continue Reading".
-- ─────────────────────────────────────────────
create table public.reading_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    manga_external_id text not null,
    chapter_external_id text not null,        -- MangaDex chapter id
    chapter_number numeric,                   -- e.g. 12, 12.5 (nullable — some chapters are unnumbered)
    page_number integer not null default 0,
    updated_at timestamptz not null default now(),

    unique (user_id, manga_external_id)       -- one progress row per manga per user
);

create index reading_progress_user_idx on public.reading_progress(user_id);

-- ─────────────────────────────────────────────
-- 4. updated_at auto-touch trigger (reusable)
-- ─────────────────────────────────────────────
create function public.touch_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger touch_library_items
    before update on public.library_items
    for each row execute procedure public.touch_updated_at();

create trigger touch_reading_progress
    before update on public.reading_progress
    for each row execute procedure public.touch_updated_at();

-- ─────────────────────────────────────────────
-- 5. Row Level Security
-- Every table here is user-owned data — lock it down so a user can only
-- ever read/write their own rows. This is enforced at the database level,
-- so even if your app code has a bug, other users' data stays protected.
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.library_items enable row level security;
alter table public.reading_progress enable row level security;

create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can view own library"
    on public.library_items for select
    using (auth.uid() = user_id);

create policy "Users can insert into own library"
    on public.library_items for insert
    with check (auth.uid() = user_id);

create policy "Users can update own library"
    on public.library_items for update
    using (auth.uid() = user_id);

create policy "Users can delete from own library"
    on public.library_items for delete
    using (auth.uid() = user_id);

create policy "Users can view own reading progress"
    on public.reading_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert own reading progress"
    on public.reading_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update own reading progress"
    on public.reading_progress for update
    using (auth.uid() = user_id);