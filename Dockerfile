ARG NODE_VERSION="18.17"

FROM --platform=$BUILDPLATFORM node:$NODE_VERSION as build
COPY . /app
WORKDIR /app

RUN set -ex; \
  corepack enable; \
  corepack prepare pnpm@latest-8 --activate; \
  pnpm -F './packages/*' install --frozen-lockfile --ignore-scripts

ARG RADIOLISE_BUILD_TARGET="fullstack"
ENV RADIOLISE_BACKEND_TYPE="integrated"

RUN set -ex; \
  pnpm build:$RADIOLISE_BUILD_TARGET; \
  pnpm deploy:$RADIOLISE_BUILD_TARGET

FROM node:$NODE_VERSION-slim
ENV NODE_ENV="production"
COPY --from=build /app/pruned /app
WORKDIR /app/express/dist
EXPOSE 3000
CMD ["server"]
