#!/bin/bash

kubectl delete -f yaml/titiler-ingress.yaml
kubectl delete -f yaml/titiler-service.yaml
kubectl delete -f yaml/titiler-deployment.yaml
kubectl delete -f yaml/titiler-namespace.yaml