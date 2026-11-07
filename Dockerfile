FROM node:24-alpine AS build-stage 
WORKDIR /building-stage
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-alpine AS running-stage
WORKDIR /app
COPY --from=build-stage /building-stage/dist ./dist 

CMD [ "npm", "start" ]