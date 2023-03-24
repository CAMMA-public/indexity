### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:10-alpine as builder

COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN apk add --no-cache python3 make g++ git
RUN npm ci && mkdir /nest-app && mv ./node_modules ./nest-app

## Move to /nest-app (eq: cd /nest-app)
WORKDIR /nest-app


# Copy everything from host to /nest-app in the container
COPY . .

## Build the nest app and store the artifacts in dist folder
ARG NG_ENV=local
RUN npm run build
RUN rm -rf src docker-compose.yml storage volumes nodemon.json test Dockerfile postman README.md .git

### STAGE 2: Setup ###

FROM node:10-alpine

LABEL Name="indexity-api" \
      Description="This image runs an nest app to annotate videos."
RUN apk add --no-cache bash ffmpeg graphicsmagick
WORKDIR /indexity-api
COPY --from=builder /nest-app ./

ENTRYPOINT ["npm", "run"]
CMD ["start:prod"]
