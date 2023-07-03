FROM node:18.16 as setup
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@latest-8 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM setup as build-backend
RUN pnpm --filter-prod api... build

FROM setup as build-fullstack
RUN pnpm --filter-prod api... -F metadata-client -F radiolise build
