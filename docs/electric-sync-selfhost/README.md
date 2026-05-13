# ElectricSQL Self-Hosting Guide

This configuration allows you to run your own Electric sync engine, avoiding the quotas of Electric Cloud.

## Prerequisites
- Docker and Docker Compose installed.
- A PostgreSQL database (v14+) with **logical replication** enabled.

## Setup Instructions

1. **Configure Postgres**: Ensure your `postgresql.conf` has:
   ```conf
   wal_level = logical
   max_replication_slots = 10
   max_wal_senders = 10
   ```

2. **Create .env File**: Create a `.env` file in this directory with:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ELECTRIC_SECRET=your-secure-secret-here
   ELECTRIC_DATABASE_USE_IPV6=false
   ```

3. **Run Electric**:
   ```bash
   docker-compose up -d
   ```

4. **Update App Config**:
   Update your Mobile and Backend environment variables to point to your new Electric instance:
   - `ELECTRIC_URL=http://your-server-ip:5050`

## Important Considerations
- **Storage**: The `electric_data` volume persists the shape logs. Ensure your server has enough disk space.
- **Security**: The `ELECTRIC_SECRET` is used to sign tokens. Keep it safe.
- **Connectivity**: Ensure port `5050` is accessible from your mobile app and backend.
