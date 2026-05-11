# Use official Bun image
FROM oven/bun:1 as base

WORKDIR /app

# Install Node dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy Source Code
COPY . .

# Required environment variables (set in Dokploy)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["bun", "run", "src/index.ts"]
