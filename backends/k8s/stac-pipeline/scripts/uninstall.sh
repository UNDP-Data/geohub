kubectl delete secret stac-secrets --ignore-not-found -n stac
kubectl delete -f ../yaml/deployment.yaml

