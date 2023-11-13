#!/bin/bash

. scripts/.env
envsubst < yaml/pgtileserv-deployment.yaml | kubectl apply -f -
unset DATABASE_URL

wait_time=60
echo "going to wait ${wait_time} seconds to check the ingress"
sleep ${wait_time}
kubectl get ingress -n pgtileserv