# syntax=docker/dockerfile:1

#
# build frontend
#
FROM node:19-alpine AS frontend
# install chrome for critical css
WORKDIR /app
RUN apk add chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN addgroup -S puppeteer && adduser -S -G puppeteer puppeteer && mkdir -p /home/runner/Downloads /app && chown -R puppeteer:puppeteer /home/puppeteer && chown -R puppeteer:puppeteer /app
USER puppeteer
CMD [ "google-chrome-stable" ]
# install node dependencies
USER root
COPY src/frontend/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN cp -R /tmp/node_modules .
# compile the frontend
USER puppeteer
COPY src/frontend .
RUN npm run build

#
# build backend
#
FROM golang:1.20-alpine AS backend
# compile the server
WORKDIR /app
COPY src/backend/go.mod src/backend/go.sum ./
RUN go mod download
COPY src/backend .
RUN go build -o dist/server

#
# run
#
FROM alpine:3.17 AS runtime
# move the compiled files
WORKDIR /app
COPY --from=frontend /app/dist public
COPY --from=backend /app/dist .
# point to the compiled server
ENTRYPOINT [ "/app/server" ]