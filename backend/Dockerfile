# Use official Bun image
FROM oven/bun:1 as base

WORKDIR /app

# 1. Install Python & build dependencies
# We need python3, pip, cmake, and build-essential for LLaVA
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-venv \
  cmake \
  build-essential \
  wget \
  && rm -rf /var/lib/apt/lists/*

# 2. Create Virtual Environment & Install AI Deps
# We utilize a venv to avoid PEP 668 issues
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install dependencies:
# - llama-cpp-python (The AI Engine)
# - huggingface_hub (Downloader)
# - transformers/pillow (Backup)
RUN CMAKE_ARGS="-DLLAMA_BLAS=ON -DLLAMA_VENDOR=OpenBLAS" pip install --no-cache-dir llama-cpp-python huggingface_hub && \
  pip install --no-cache-dir transformers pillow numpy

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
