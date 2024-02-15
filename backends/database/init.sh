
USER=docker
DATABASE=geodata
HOST=localhost
POST=25432

echo
echo "------------------------------------------------------------------"
echo "Initialising geodata database"
echo "------------------------------------------------------------------"
psql -f ./backends/database/geohub-database.sql -U $USER -d $DATABASE -h $HOST -p $POST

echo
echo "------------------------------------------------------------------"
echo "Inserting datasets for Electricity Dashboard"
echo "------------------------------------------------------------------"
psql -f ./backends/database/sql/insert-electricity-dashboard-data.sql -U $USER -d $DATABASE -h $HOST -p $POST

echo
echo "------------------------------------------------------------------"
echo "Inserting country data"
echo "------------------------------------------------------------------"
psql -f ./backends/database/sql/insert-country.sql -U $USER -d $DATABASE -h $HOST -p $POST