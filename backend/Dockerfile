# Use official Bun image
FROM oven/bun:1 as base

WORKDIR /app

# 1. Install Python & build dependencies
# We need python3 and pip to run the Local AI model
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-venv \
  && rm -rf /var/lib/apt/lists/*

# 2. Create Virtual Environment & Install AI Deps
# We utilize a venv to avoid PEP 668 issues and install CPU-only torch to save space (150MB vs 800MB)
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install dependencies:
# - torch (CPU version)
# - transformers, pillow
# NOTE: This step takes time during build but is cached
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
  pip install --no-cache-dir transformers pillow

# 3. Install Node dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# 4. Copy Source Code
COPY . .

# 5. Build/Run
ENV NODE_ENV=production
# Ensure we use Local AI by default on server
ENV AI_PROVIDER=local
ENV PORT=8000

EXPOSE 8000

CMD ["bun", "run", "src/index.ts"]
