# ── Stage 1: Build ──
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN yarn build

# ── Stage 2: Production ──
FROM node:20-alpine AS runtime

RUN apk add --no-cache libssl3

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package.json ./

RUN npx prisma generate

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
