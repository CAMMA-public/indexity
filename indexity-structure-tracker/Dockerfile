FROM node:10-alpine as builder

WORKDIR /build

COPY package.json package-lock.json /build/
RUN apk add --no-cache python3 make g++
RUN npm ci
COPY . /build
RUN npm run build

# ---

FROM nikolaik/python-nodejs:python3.6-nodejs12

ENV NODE_ENV production
ENV CRON_SCHEDULE="0 0 * * *"
ENV DELETE_LOGS_AFTER_DAYS="10"

ARG CRON_VERSION=3.0pl1-134+deb10u1

WORKDIR /indexity-tracker

COPY --from=builder /build/package*.json /indexity-tracker/
COPY --from=builder /build/dist/ /indexity-tracker/dist/
COPY --from=builder /build/node_modules /indexity-tracker/node_modules
COPY --from=builder /build/python/ /indexity-tracker/python/

RUN pip install --upgrade pip && pip install -r python/requirements.txt

RUN apt-get update && apt-get -y install "cron=${CRON_VERSION}"
RUN mkdir /indexity-tracker/logs

RUN chmod 0744 /etc/crontab \
    && echo "${CRON_SCHEDULE} \ 
          find /indexity-tracker/logs/ -name '*.log' -ctime +${DELETE_LOGS_AFTER_DAYS} -exec rm -v -f {} \; \ 
          > /proc/1/fd/1 2>/proc/1/fd/2" >> /etc/crontab \
    && echo "#" >> /etc/crontab \
    && crontab /etc/crontab

COPY docker-entrypoint.sh /
ENTRYPOINT ["sh", "/docker-entrypoint.sh"]