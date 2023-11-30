-- FUNCTION: geohub.get_vectorinfo(character varying, character varying)

-- DROP FUNCTION IF EXISTS geohub.get_vectorinfo(character varying, character varying);

CREATE OR REPLACE FUNCTION geohub.get_vectorinfo(
	schemaname character varying,
	tablename character varying)
    RETURNS TABLE(vectorinfo json) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 -- here start procedural part
DECLARE _sql text := '
    with stats_number as (
		select 
			x.col as attribute, 
			count(x.value::numeric) as count, 
			min(x.value::numeric) as min, 
			max(x.value::numeric) as max,
			avg(x.value::numeric) as mean,
			PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x.value::numeric) AS median,
			stddev(x.value::numeric) as std,
			(SELECT histogram FROM geohub.get_histogram(''' || schemaname ||''', ''' || tablename ||''', x.col)) as histogram
		from ' || schemaname ||'.' || tablename ||' t
		 cross join lateral (
			select col, value
			from jsonb_each(to_jsonb(t)) as e(col, value)
			where jsonb_typeof(e.value) = ''number''
		 ) x
		group by x.col
	)
	,data_number as (
		SELECT
			b.column_name as attribute, 
			''number'' as type,
			c.count,
			c.min,
			c.max,
			c.mean,
			c.median,
			c.std,
			c.histogram
		FROM information_schema.columns b
		INNER JOIN stats_number c
		ON b.column_name = c.attribute
		WHERE b.table_schema=''' || schemaname ||''' and b.table_name = ''' || tablename ||'''
	)
	,stats_string as (
		select 
			x.col as attribute, 
			count(x.value) as count,
			array_agg(DISTINCT x.value) as values
		from ' || schemaname ||'.' || tablename ||' t
		 cross join lateral (
			select col, value
			from jsonb_each(to_jsonb(t)) as e(col, value)
			where jsonb_typeof(e.value) = ''string''
		 ) x
		group by x.col
	)
	,data_string as (
		SELECT
			b.column_name as attribute, 
			''string'' as type,
			c.count,
			c.values
		FROM information_schema.columns b
		INNER JOIN stats_string c
		ON b.column_name = c.attribute
		WHERE b.table_schema=''' || schemaname ||''' and b.table_name = ''' || tablename ||'''
	)
	, data as (
		SELECT
			attribute, 
			type,
			count,
			min,
			max,
			mean,
			median,
			std,
			histogram,
			NULL as values
		FROM data_number
		UNION ALL
		SELECT
			attribute, 
			type,
			count,
			NULL as min,
			NULL as max,
			NULL as mean,
			NULL as median,
			NULL as std,
			NULL as histogram,
			values
		FROM data_string
	)
	-- select * from data
	SELECT json_strip_nulls(array_to_json(array_agg(row_to_json(data)))) FROM data;
';
BEGIN
	return query EXECUTE _sql;
END;
$BODY$;

ALTER FUNCTION geohub.get_vectorinfo(character varying, character varying)
    OWNER TO undpgeohub;
