-- FUNCTION: geohub.get_histogram(character varying, character varying, character varying)

-- DROP FUNCTION IF EXISTS geohub.get_histogram(character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION geohub.get_histogram(
	schemaname character varying,
	tablename character varying,
	colname character varying)
    RETURNS TABLE(schema_name character varying, table_name character varying, col_name character varying, histogram json) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 -- here start procedural part

DECLARE _sql text := '
WITH drb_stats as (
	SELECT
		min(' || colname ||') as min,
		max(' || colname ||') as max
	FROM ' || schemaname ||'.'  || tablename || '
), histogram as (
   SELECT
		width_bucket(' || colname ||', min, max + 0.01, 10) as bucket,
		min(' || colname ||') as minval,
		max(' || colname ||') as maxval,
		count(*) as freq
	FROM ' || schemaname ||'.'  || tablename || ', drb_stats
 GROUP BY bucket
 ORDER BY bucket
)
, bin_data as (
SELECT
	x.bin
FROM (
(SELECT minval as bin FROM histogram ORDER BY minval)
UNION
(SELECT max(maxval) as bin FROM histogram)
) x
ORDER BY x.bin
)
, data as (
SELECT
	ARRAY(SELECT bin FROM bin_data ORDER BY bin) as bin, 
	ARRAY(SELECT freq FROM histogram ORDER BY bucket) as count
)
SELECT
	''' || schemaname ||'''::character varying as schema_name,
	''' || tablename ||'''::character varying as table_name,
	''' || colname ||'''::character varying as col_name,
	(SELECT
		row_to_json(data)
	FROM data) as histogram
';
BEGIN
    return query EXECUTE _sql;
END;
$BODY$;

ALTER FUNCTION geohub.get_histogram(character varying, character varying, character varying)
    OWNER TO undpgeohub;
