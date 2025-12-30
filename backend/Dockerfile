# Use official Bun image
FROM oven/bun:1 as base

WORKDIR /app

# Install Node dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy Source Code
COPY . .

# Build/Run
ENV NODE_ENV=production
ENV AI_PROVIDER=gemini
ENV PORT=8000

EXPOSE 8000

CMD ["bun", "run", "src/index.ts"]
