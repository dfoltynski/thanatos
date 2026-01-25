FROM node:24-alpine AS build-stage 
WORKDIR /building-stage
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile

ARG SERVER_PORT
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ENV SERVER_PORT=${SERVER_PORT}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}

COPY . .
RUN pnpm build

FROM node:24-alpine AS running-stage
WORKDIR /app
COPY --from=build-stage /building-stage/dist ./dist 

CMD [ "npm", "start" ]