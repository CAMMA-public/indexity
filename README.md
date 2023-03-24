# Indexity

## Description

**Indexity** is a web-based tool designed for medical video annotation in surgical data science projects.

![](indexity.jpg)


## Disclaimer

This application was developed by
**Ircad France** and **IHU Strasbourg** between 2019 and 2020 within the CONDOR project.

**Indexity** is **not maintained** and this code base
is provided for archive purposes only.

## How to run Indexity

### Before starting

- Install [Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
  and [docker-compose](https://docs.docker.com/compose/install/)

### Run the stack locally

Run docker compose

```bash
docker-compose up
```

The API will be available on http://localhost:8082/, UI on http://localhost:8083/ and admin interface on http://localhost:8085/.

Default admin user is `admin@indexity.local` with password `indexity-password` (to be changed).

### License

Indexity is publicly available under the BSD3-Clause open source license.