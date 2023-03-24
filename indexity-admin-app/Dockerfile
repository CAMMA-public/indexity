### STAGE 1: Build ###

FROM node:10-alpine as builder

COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app

## Move to /ng-app (eq: cd /ng-app)
WORKDIR /ng-app

# Copy everything from host to /ng-app in the container
COPY . .

## Build the angular app and store the artifacts in www folder
RUN npm run build -- --configuration=production


### STAGE 2: Setup ###
FROM nginx:1.14.0-alpine

LABEL Name="indexity-admin-app" \
      Description="This image runs an angular app to manage indexity users."

# Install dynamic configuration dependencies
RUN apk --update add bash jq

# Copy the script used for dynamic configuration
COPY scripts/update_config.sh /update_config.sh
RUN chmod +x /update_config.sh

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in www folder to default nginx public folder
COPY --from=builder /ng-app/www /usr/share/nginx/html

# Update the config using environment variables
CMD /update_config.sh /usr/share/nginx/html/assets/config.json && nginx -g 'daemon off;'
