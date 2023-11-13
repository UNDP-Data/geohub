#!/bin/bash

. scripts/.env

kubectl delete secret pgtileserv-secrets --ignore-not-found -n pgtileserv
kubectl create secret generic pgtileserv-secrets --from-literal=DATABASE_URL=${DATABASE_URL}  -n pgtileserv

kubectl apply -f yaml/pgtileserv-deployment.yaml
unset DATABASE_URL

wait_time=60
echo "going to wait ${wait_time} seconds to check the ingress"
sleep ${wait_time}
kubectl get ingress -n pgtileserv