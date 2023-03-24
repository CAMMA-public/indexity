### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:10-alpine as builder


COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN apk add --no-cache python3 make g++ git
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app

## Move to /ng-app (eq: cd /ng-app)
WORKDIR /ng-app


# Copy everything from host to /ng-app in the container
COPY . .

## Build the angular app and store the artifacts in dist folder
ARG NG_ENV=local
RUN npm run build:prod -- --configuration=$NG_ENV


### STAGE 2: Setup ###

FROM nginx:1.14.1-alpine

LABEL Name="indexity-ui" \
      Description="This image runs an angular app to annotate videos."

RUN apk --update add bash jq
## Add the start script
COPY scripts/update_config.sh /update_config.sh
RUN chmod +x /update_config.sh

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

CMD /update_config.sh /usr/share/nginx/html/assets/config.json && nginx -g 'daemon off;'
