# Simon — 30 ans d’aventure

Invitation Next.js responsive inspirée des affiches VHS et cinéma 80–90.

## Lancer le projet

```bash
pnpm install
pnpm dev
```

## Fonctionnalités

- Invitation responsive avec navigation par sections
- Date, heure et lieu affichés « À venir »
- Galerie des affiches officielles
- Livre d’or audio limité à 30 secondes
- Formulaire RSVP : nom, présence et nombre de personnes
- Enregistrement Supabase des audios, des RSVP et des photos d’invités

## Activer Supabase

Copier `.env.example` vers `.env.local`, puis renseigner l’URL et la clé anonyme Supabase. Créer les buckets `audio-messages` et `guest-photos`, puis exécuter :

```sql
create table audio_messages (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  file_name text not null,
  duration integer not null check (duration between 0 and 30),
  approved boolean default false,
  created_at timestamptz default now()
);

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  attendance text not null check (attendance in ('yes', 'maybe', 'no')),
  guest_count integer not null check (guest_count between 0 and 6),
  created_at timestamptz default now()
);

create table photo_submissions (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  message text check (char_length(message) <= 240),
  signature text not null check (char_length(signature) <= 60),
  approved boolean default false,
  created_at timestamptz default now()
);
```

Configurer les politiques RLS avant publication afin d’autoriser uniquement les insertions publiques nécessaires et de réserver la lecture des réponses à Simon.

