# Deploy an Indexity stack

This repo contains the HELM package for Indexity platform deployment on a Kubernetes cluster.

IMPORTANT: This documentation assumes that you've already setup a Kubernetes cluster, configured kubectl and installed HELM v3

If it's not the case, please refer to [CLUSTER_SETUP.md](./CLUSTER_SETUP.md) before proceeding.

## Namespaces

Create `dev` and `prod` namespaces:

```bash
kubectl create namespace indexity-dev
kubectl create namespace indexity-prod
```

## Deploy NGINX Ingress controller (distributes traffic inside the cluster)

```bash
helm install nginx-ingress stable/nginx-ingress
```

## Dev deployment (make sure the config values are correct)

```bash
export DB_VOLUME_PATH="/path/dev/indexity-db_data"
export API_VOLUME_PATH="/path/dev/indexity-storage"
export DOMAIN="dev.indexity.local"

helm install indexity-dev . \
    --namespace indexity-dev \
    --set env=production \
    --set domainName=${DOMAIN} \
    --set dbVolumeMountPath=${DB_VOLUME_PATH} \
    --set apiVolumeMountPath=${API_VOLUME_PATH} \
    --set indexityUiImage.apiConfigBaseUrl=https://api.dev.indexity.local \
    --set indexityUiImage.socketConfigBaseUrl=https://api.dev.indexity.local \
    --set indexityUiImage.jwtSettingsWhitelistedDomains=api.dev.indexity.local \
    --set indexityApiImage.enableSwagger=true \
    --set indexityApiImage.adminEmail=<put-admin-email-here> \
    --set indexityApiImage.mailFrom=<mail_from> \
    --set postfixImage.smtpServer=<put-smtp-host-here> \
    --set postfixImage.smtpPort=<put-smtp-port-here> \
    --set postfixImage.username=<put-smtp-username-here> \
    --set postfixImage.password=<put-smtp-password-here> \
    --set postfixImage.serverHostname=<put-hostname-here> \
    --set postfixImage.overwriteFrom=<put-overwrite-from-here> \
    --set postfixImage.senderCanonical=<put-sender-canonical-here> \
    --set trackerEmail=<put-tracker-email-here> \
    --set trackerPassword=<put-tracker-password-here> \
    --set indexityAdminImage.apiConfigBaseUrl=https://api.dev.indexity.local \
    --set indexityAdminImage.socketConfigBaseUrl=https://api.dev.indexity.local \
    --set dockerConfigJson=<put-your-base64-encoded-docker-json-configuration-here>
```

| :warning: **WARNING**: At the first time you start the indexity stack, don't forget to create a user for the tracker with the same values as those passed to : `trackerEmail` and `trackerPassword`. |
| --- |

*TIP: See `values.yml` file for more params*

## Production deployment (make sure the config values are correct)

```bash
export DB_VOLUME_PATH="/path/stable/indexity-db_data"
export API_VOLUME_PATH="/path/stable/indexity-storage"
export DOMAIN="indexity.local"

helm install indexity-prod . \
    --namespace indexity-prod \
    --set env=production \
    --set domainName=${DOMAIN} \
    --set dbVolumeMountPath=${DB_VOLUME_PATH} \
    --set apiVolumeMountPath=${API_VOLUME_PATH} \
    --set indexityUiImage.tag=1.0.0 \
    --set indexityUiImage.apiConfigBaseUrl=https://api.indexity.local \
    --set indexityUiImage.socketConfigBaseUrl=https://api.indexity.local \
    --set indexityUiImage.jwtSettingsWhitelistedDomains=api.indexity.local \
    --set indexityTrackerImage.tag=1.0.0 \
    --set indexityAdminImage.tag=1.0.0 \
    --set indexityApiImage.tag=1.0.0 \
    --set indexityAdminImage.apiConfigBaseUrl=https://api.indexity.local \
    --set indexityAdminImage.socketConfigBaseUrl=https://api.indexity.local \
    --set indexityApiImage.enableSwagger=false \
    --set indexityApiImage.adminEmail=<put-admin-email-here> \
    --set indexityApiImage.mailFrom=<mail_from> \
    --set postfixImage.smtpServer=<put-smtp-host-here> \
    --set postfixImage.smtpPort=<put-smtp-port-here> \
    --set postfixImage.username=<put-smtp-username-here> \
    --set postfixImage.password=<put-smtp-password-here> \
    --set postfixImage.serverHostname=<put-hostname-here> \
    --set postfixImage.overwriteFrom=<put-overwrite-from-here> \
    --set postfixImage.senderCanonical=<put-sender-canonical-here> \
    --set trackerEmail=<put-tracker-email-here> \
    --set trackerPassword=<put-tracker-password-here> \
    --set dockerConfigJson=<put-your-base64-encoded-docker-json-configuration-here>
```

| :warning: **WARNING**: At the first time you start the indexity stack, don't forget to create a user for the tracker with the same values as those passed to : `trackerEmail` and `trackerPassword`. |
| --- |

## Updating the stack

If files in the HELM package changed, you can update the deployment by using `helm upgrade ...` instead of `helm install ...`

Example:

```bash
export DB_VOLUME_PATH="/path/dev/indexity-db_data"
export API_VOLUME_PATH="/path/dev/indexity-storage"
export DOMAIN="dev.indexity.local"

helm upgrade indexity-dev . \
    --namespace indexity-dev \
    --set env=production \
    --set domainName=${DOMAIN} \
    --set dbVolumeMountPath=${DB_VOLUME_PATH} \
    --set apiVolumeMountPath=${API_VOLUME_PATH} \
    --set indexityUiImage.apiConfigBaseUrl=https://api.dev.indexity.local
    --set indexityUiImage.socketConfigBaseUrl=https://api.dev.indexity.local
    --set indexityUiImage.jwtSettingsWhitelistedDomains=api.dev.indexity.local
    --set indexityApiImage.enableSwagger=true \
    --set indexityApiImage.adminEmail=<put-admin-email-here> \
    --set indexityApiImage.mailFrom=<mail_from> \
    --set postfixImage.smtpServer=<put-smtp-host-here> \
    --set postfixImage.smtpPort=<put-smtp-port-here> \
    --set postfixImage.username=<put-smtp-username-here> \
    --set postfixImage.password=<put-smtp-password-here> \
    --set postfixImage.serverHostname=<put-hostname-here> \
    --set postfixImage.overwriteFrom=<put-overwrite-from-here> \
    --set postfixImage.senderCanonical=<put-sender-canonical-here> \
    --set trackerEmail=<put-tracker-email-here> \
    --set trackerPassword=<put-tracker-password-here> \
    --set indexityAdminImage.apiConfigBaseUrl=https://api.dev.indexity.local \
    --set indexityAdminImage.socketConfigBaseUrl=https://api.dev.indexity.local \
    --set dockerConfigJson=<put-your-base64-encoded-docker-json-configuration-here>
```

## Updating a service image

- UI (dev):

```bash
kubectl set image deployment/indexity-ui indexity-ui=IMAGE:TAG --namespace indexity-dev
```

- API (dev):

```bash
kubectl set image deployment/indexity-api indexity-api=IMAGE:TAG --namespace indexity-dev
```

*TIP: to update on production just change the `--namespace` arg*

## Configure your DNS

- Get the IP to the cluster:

```bash
kubectl get svc nginx-ingress-controller
```

```bash
NAME                       TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
nginx-ingress-controller   LoadBalancer   SOME_IP_ADDRESS   <pending>     80:30580/TCP,443:30074/TCP   26m
```

In your reverse proxy (example traeffik), point requests from `indexity.local` and `api.indexity.local` to the `CLUSTER-IP`
