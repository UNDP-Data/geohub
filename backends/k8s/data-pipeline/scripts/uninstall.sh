kubectl delete secret ingest-secrets --ignore-not-found -n data
kubectl delete -f ../yaml/ingest-environment.yaml

