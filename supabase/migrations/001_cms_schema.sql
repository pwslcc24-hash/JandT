-- Multi-tenant visual CMS schema for Holdsworth Wedding / SaaS platform

-- ── Clients (multi-tenant) ──
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── User profiles & roles ──
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  email text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz default now()
);

-- ── Pages ──
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  slug text not null,
  title text not null default '',
  meta jsonb default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (client_id, slug)
);

-- ── Sections (draggable layout units) ──
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  section_key text not null,
  section_type text not null default 'generic',
  sort_order int not null default 0,
  styles jsonb default '{}'::jsonb,
  styles_tablet jsonb default '{}'::jsonb,
  styles_mobile jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (page_id, section_key)
);

-- ── Content blocks (editable text, images, etc.) ──
create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  block_key text not null,
  block_type text not null default 'text' check (block_type in ('text', 'rich_text', 'image', 'json')),
  value jsonb not null default '{}'::jsonb,
  styles jsonb default '{}'::jsonb,
  styles_tablet jsonb default '{}'::jsonb,
  styles_mobile jsonb default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (section_id, block_key)
);

-- ── Media library ──
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  file_name text,
  mime_type text,
  width int,
  height int,
  size_bytes int,
  alt_text text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ── Site-wide settings ──
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade unique,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ── Revision history (undo / version restore) ──
create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  page_slug text,
  snapshot jsonb not null,
  label text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ── Indexes ──
create index if not exists idx_pages_client on pages(client_id);
create index if not exists idx_sections_page on sections(page_id, sort_order);
create index if not exists idx_blocks_section on content_blocks(section_id);
create index if not exists idx_media_client on media_assets(client_id);
create index if not exists idx_revisions_client on content_revisions(client_id, created_at desc);

-- ── Updated_at trigger ──
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pages_updated before update on pages
  for each row execute function set_updated_at();
create trigger sections_updated before update on sections
  for each row execute function set_updated_at();
create trigger content_blocks_updated before update on content_blocks
  for each row execute function set_updated_at();

-- ── RLS ──
alter table clients enable row level security;
alter table profiles enable row level security;
alter table pages enable row level security;
alter table sections enable row level security;
alter table content_blocks enable row level security;
alter table media_assets enable row level security;
alter table site_settings enable row level security;
alter table content_revisions enable row level security;

-- Public read for published site content
create policy "Public read clients" on clients for select using (true);
create policy "Public read pages" on pages for select using (true);
create policy "Public read sections" on sections for select using (true);
create policy "Public read blocks" on content_blocks for select using (true);
create policy "Public read settings" on site_settings for select using (true);

-- Admin write (authenticated admin of same client)
create policy "Admin manage pages" on pages for all using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
      and p.client_id = pages.client_id
  )
);

create policy "Admin manage sections" on sections for all using (
  exists (
    select 1 from profiles p
    join pages pg on pg.client_id = p.client_id
    where p.id = auth.uid() and p.role = 'admin'
      and pg.id = sections.page_id
  )
);

create policy "Admin manage blocks" on content_blocks for all using (
  exists (
    select 1 from profiles p
    join pages pg on pg.client_id = p.client_id
    join sections s on s.page_id = pg.id
    where p.id = auth.uid() and p.role = 'admin'
      and s.id = content_blocks.section_id
  )
);

create policy "Admin manage media" on media_assets for all using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
      and p.client_id = media_assets.client_id
  )
);

create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Admin read profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Storage bucket (run in Supabase dashboard or via CLI):
-- insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true);
