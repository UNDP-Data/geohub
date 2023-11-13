#!/bin/bash

kubectl delete -f yaml/pgtileserv-ingress.yaml
kubectl delete -f yaml/pgtileserv-service.yaml
kubectl delete -f yaml/pgtileserv-deployment.yaml
kubectl delete -f yaml/pgtileserv-namespace.yaml