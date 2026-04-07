# Stage 1: Base - Chỉ cài dependencies hệ thống cần thiết
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
    libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
    libpangocairo-1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
    libxrender1 libxss1 libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Deps - Chỉ cài node_modules
FROM base AS deps
WORKDIR /app
# [TIP] Bỏ qua download Chromium nếu bạn muốn cài thủ công hoặc dùng gói có sẵn
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer_cache
COPY package.json package-lock.json* ./
# Dùng --prefer-offline để lấy từ cache cục bộ nếu có
RUN npm ci --prefer-offline --no-audit

# Stage 3: Builder - Build Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.puppeteer_cache ./.puppeteer_cache
COPY . .
# Next.js build
RUN npm run build

# Stage 4: Runner - Stage nhẹ nhất để chạy app
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer_cache

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# [OPTIMIZE] Chỉ copy những gì thực sự cần thiết để chạy
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.puppeteer_cache ./.puppeteer_cache

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Dùng trực tiếp node để khởi động nhanh hơn
CMD ["node_modules/.bin/next", "start"]