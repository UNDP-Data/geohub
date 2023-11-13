#!/bin/bash

kubectl apply -f yaml/pgtileserv-namespace.yaml
. scripts/.env
envsubst < yaml/pgtileserv-deployment.yaml | kubectl apply -f -
unset DATABASE_URL
kubectl apply -f yaml/pgtileserv-service.yaml

kubectl apply -f yaml/pgtileserv-ingress.yaml
wait_time=60
echo "going to wait ${wait_time} seconds to check the ingress"
sleep ${wait_time}
kubectl get ingress -n pgtileserv