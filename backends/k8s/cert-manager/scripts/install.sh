#!/bin/bash

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.9.1/cert-manager.yaml
. scripts/.env
envsubst < yaml/cloudflare-apitoken-secret.yaml | kubectl apply -f -
envsubst < yaml/zerossl-hmac-secret.yaml | kubectl apply -f -
unset CLOUDFLARE_API_TOKEN
unset ZEROSSL_HMAC_KEY
wait_time=300
echo "going to wait ${wait_time} seconds to create a clusterissuer"
sleep ${wait_time}
kubectl apply -f yaml/le-cluster-issuer.yaml
kubectl apply -f yaml/zerossl-cluster-issuer.yaml