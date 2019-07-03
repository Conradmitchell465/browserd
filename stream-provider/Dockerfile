# build, lint, and test
FROM node:12.4 as builder
WORKDIR /usr/app/builder
COPY ./stream-provider/src ./stream-provider/src
COPY ./stream-provider/package*.json ./stream-provider/ts*.json ./stream-provider/
ADD ./shared ./shared
WORKDIR stream-provider
RUN npm install
RUN npm run lint
RUN npm run build
RUN npm run test

FROM node:12.4 as runner
# Get all the x/os deps we need
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y curl \
  dos2unix \
  xinit \
  libnss3 \
  libxss1 \
  libasound2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libgtk-3-0 \
  xserver-xorg-video-dummy \
  x11-xserver-utils \
  cnee \
  fonts-liberation \
  fonts-roboto
# Create a lower-priv user (electron) to run as
RUN groupadd -r electron \
  && useradd -r -g electron -G audio,video,tty electron \
  && mkdir -p /home/electron/Downloads \
  && chown -R electron:electron /home/electron \
  && mkdir /home/electron/.config
WORKDIR /home/electron/browserd

FROM runner as release
# move in resources
COPY --from=builder /usr/app/builder/stream-provider/package*.json ./
COPY --from=builder /usr/app/builder/stream-provider/dist ./dist
COPY --from=builder /usr/app/builder/shared ./shared
RUN ls
RUN npm ci
COPY ./stream-provider/.docker-display.conf .
COPY ./stream-provider/.docker-x-boot.sh .
RUN dos2unix .docker-display.conf .docker-x-boot.sh
RUN chmod +x .docker-x-boot.sh
CMD /home/electron/browserd/.docker-x-boot.sh 'npm run direct-start -- --no-sandbox'
