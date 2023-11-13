#!/bin/bash

kubectl apply -f yaml/titiler-deployment.yaml

wait_time=30
echo "going to wait ${wait_time} seconds to check the ingress"
sleep ${wait_time}
kubectl get ingress -n titiler