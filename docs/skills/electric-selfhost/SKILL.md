---
name: electric-selfhost
description: How to self-host the ElectricSQL sync engine for local-first apps.
---

# Skill: Self-Hosting ElectricSQL

This skill guides you through deploying your own ElectricSQL sync engine, allowing you to bypass cloud quotas and maintain full data privacy.

## 📋 System Requirements
- **PostgreSQL 14+**: Must have `wal_level = logical`.
- **Docker**: Engine version 20.10+.
- **Persistent Disk**: Electric caches "Shapes" on disk; use fast SSD storage for best performance.

## ⚙️ 1. Postgres Configuration
For Electric to work, your Postgres instance **must** support logical replication.

Run these commands on your Postgres server:
```sql
-- Enable logical replication
ALTER SYSTEM SET wal_level = 'logical';
ALTER SYSTEM SET max_replication_slots = '10';
ALTER SYSTEM SET max_wal_senders = '10';

-- Restart Postgres to apply changes (if using self-hosted)
-- If using Neon or Supabase, these are usually enabled by default.
```

## 🚀 2. Deploying with Dokploy

ElectricSQL is lightweight and works perfectly inside Dokploy. 

### Recommended Environment Variables:
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Your Postgres link (Direct, NOT Pooled) | `postgres://user:pass@host:5432/db` |
| `ELECTRIC_SECRET` | A secure string for signing tokens | `openssl rand -base64 32` |
| `ELECTRIC_PORT` | The internal container port | `3000` |
| `ELECTRIC_STORAGE_DIR` | Where to store shape data | `/var/lib/electric/persistent` |

---

## 🔒 3. Securing access
By default, Electric is open. You **must** set an `ELECTRIC_SECRET` and use a proxy (like the Hono proxy in this project) to protect your data.

1. Generate a secret: `openssl rand -base64 32`
2. Apply it to the Electric container.
3. Use that same secret in your Backend to sign JWTs or authorize shape requests.

## 🧹 4. Maintenance
If you ever switch databases or reset your Postgres replication slot, you must clear Electric's persistent data:
1. Stop the container.
2. Delete the contents of the `electric_data` volume.
3. Restart.
