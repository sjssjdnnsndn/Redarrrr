-- Shared market detections (unowned — no user accounts).
create table if not exists gems (
  symbol              text primary key,
  name                text not null default '',
  pair                text not null default '',
  venue               text not null default 'alpha',
  first_seen_at       timestamptz not null default now(),
  first_price         numeric not null,
  last_price          numeric not null,
  high_since_detect   numeric not null,
  last_score          integer not null default 0,
  last_crime_risk     integer not null default 0,
  last_change_24h     numeric not null default 0,
  last_quote_volume   numeric not null default 0,
  last_market_cap     numeric not null default 0,
  last_status         text not null default 'heating',
  reasons             text not null default '',
  updated_at          timestamptz not null default now()
);

create index if not exists gems_updated_at_idx on gems (updated_at desc);
create index if not exists gems_first_seen_at_idx on gems (first_seen_at desc);
create index if not exists gems_last_score_idx on gems (last_score desc);

create table if not exists gem_snapshots (
  id             serial primary key,
  symbol         text not null,
  price          numeric not null,
  quote_volume   numeric not null,
  change_24h     numeric not null,
  score          integer not null,
  crime_risk     integer not null default 0,
  captured_at    timestamptz not null default now()
);

create index if not exists gem_snapshots_symbol_time_idx
  on gem_snapshots (symbol, captured_at desc);
