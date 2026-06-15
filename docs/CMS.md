# Visual CMS Editor

A Webflow-style visual editor integrated into the Holdsworth wedding site.

## Quick Start (Dev — no Supabase)

1. Run `npm run dev`
2. Go to `/admin/login`
3. Click **Dev: Sign in as Admin**
4. Return to the site — click **Edit Mode** in the top toolbar
5. Click any text to edit inline; click images to upload; drag section handles to reorder

Content saves to `localStorage` automatically when Supabase is not configured.

## Production Setup (Supabase)

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/migrations/001_cms_schema.sql` in the SQL editor
3. Create a storage bucket named `site-media` (public)
4. Copy `.env.example` → `.env.local` and add your keys
5. Create a client row: `insert into clients (slug, name) values ('holdsworth', 'Holdsworth Wedding');`
6. Create an auth user and profile:
   ```sql
   insert into profiles (id, client_id, email, role)
   values ('USER_UUID', 'CLIENT_UUID', 'you@email.com', 'admin');
   ```

## Features

| Feature | Status |
|---------|--------|
| Admin / Viewer roles | ✅ |
| Edit Mode toggle | ✅ |
| Inline text editing | ✅ |
| Image upload + compression | ✅ |
| Section drag-and-drop | ✅ |
| Properties panel (styles) | ✅ |
| Desktop / tablet / mobile preview | ✅ |
| Auto-save + Saving/Saved indicator | ✅ |
| Undo / Redo | ✅ |
| Multi-client schema | ✅ |
| Admin dashboard | ✅ |
| Dynamic DB rendering | ✅ (with local fallback) |
| Rich text (Tiptap) | ✅ Info, Story, Registry pages |
| Resize handles | ✅ E / S / SE drag on selected blocks |
| Photos CMS | ✅ Album labels + per-gallery image uploads |
| Next.js migration | 🔲 Optional |

## Architecture

```
clients → pages → sections → content_blocks
                         ↘ media_assets
```

Each wedding site instance is isolated by `client_id` (multi-tenant SaaS ready).

## Tech Stack

- **React + Vite** (Next.js migration path documented)
- **TypeScript** (CMS layer)
- **Supabase** (Auth, Postgres, Storage)
- **dnd-kit** (section reordering)
- **Tiptap** (rich text — Phase 2)
- **browser-image-compression** (upload optimization)
- **Immer** (immutable state + undo history)
