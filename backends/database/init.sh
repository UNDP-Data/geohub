
USER=docker
DATABASE=geodata
HOST=localhost
POST=25432

echo
echo "------------------------------------------------------------------"
echo "Initialising geodata database"
echo "------------------------------------------------------------------"
psql -f ./geohub-database.sql -U $USER -d $DATABASE -h $HOST -p $POST
