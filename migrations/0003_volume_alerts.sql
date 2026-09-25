-- Live tape of sudden volume / open-interest events (unowned).
alter table gems add column if not exists last_conviction integer not null default 0;
alter table gems add column if not exists last_oi_usd numeric not null default 0;
alter table gems add column if not exists last_burst_usd numeric not null default 0;

create table if not exists volume_alerts (
  id           text primary key,
  symbol       text not null,
  pair         text not null default '',
  name         text not null default '',
  kind         text not null,
  severity     text not null default 'info',
  title        text not null,
  detail       text not null default '',
  quote_usd    numeric not null default 0,
  price        numeric not null default 0,
  change_24h   numeric not null default 0,
  venues       text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists volume_alerts_created_at_idx
  on volume_alerts (created_at desc);

create index if not exists volume_alerts_symbol_time_idx
  on volume_alerts (symbol, created_at desc);
