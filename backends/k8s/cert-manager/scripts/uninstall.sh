#!/bin/bash


kubectl delete -f yaml/le-cluster-issuer.yaml
kubectl delete -f yaml/zerossl-cluster-issuer.yaml
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.9.1/cert-manager.yaml
