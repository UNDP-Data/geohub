# How to backup dashboard data in SQL

## dataset table

create new temporary table for dashboard datasets

Change dataset IDs for new datasets.

```sql
SELECT id, url, is_raster, license, bounds, createdat, updatedat, name, description, created_user, updated_user, access_level
INTO geohub.dataset_dashboard
FROM geohub.dataset
WHERE id in (
	'2d4a3091ff7a97e6ebea5c86267ae37d',
	'3f738c54bedbc52a08735bc4efa63d20',
	'e20bcc8ef2024d811fb4cf3e69c3ae37',
	'60566fcdfe72a3bd74eebf9af0a0e078',
	'0c99b27a7ac2fdee636f17f2a8aa8854',
	'e7e87d4aea658252239e5f0814e43dc0',
	'58b0cedfafab6157c851dd650607cc71',
	'3493ef92a9609f435cd56414dd1d2db0',
	'2a0f67d579e404b0447040b55c2297e0',
	'add1242d0e4a705d75fd93fe7754e179',
	'6978ef8b35e07ca5e12e263ec5f24ca6',
	'3504d57c71101d974943410a1403cd1d',
	'23b67271e93a510e1c5fc4075fecfc9c',
	'd5252ef98bfc95ffb6b5152a5783fa70',
	'3f70e55304345faad0aacd2334ece862',
	'6befca9038ea303bfc1319415b51f923',
	'8e3ff7e2b48a07fe39b99c1e8fb7bab7',
	'f91d5b1a279ebed4daae06d2c3e55da9',
	'848131f9ba188d9a5b102ee4fbe4fed3'
)
```

Use pgadmin,

- right click on `dataset_dashboard`
- select `backup`
- select `General` tab
  - set `dashboard_dataset.sql` as Filename
  - select `Plain` as Format
- select `Data options` tab
  - only enable `Data` at Sections group
- select `Query options` tab
  - enable `Use INSERT commands` option
- click `Backup` button

Insert commands for datasets table will be generated, copy and paste to `insert-electricity-dashboard-data.sql`. Don't forget to change table name from `dataset_dashboard` to `dataset`.

## dataset_tag table

```sql
SELECT dataset_id, tag_id
INTO geohub.dataset_tag_dashboard
FROM geohub.dataset_tag a
INNER JOIN geohub.dataset_dashboard b
on a.dataset_id = b.id
```

do the same process of `dataset_dashboard` table to get insert SQLs.

## tag table

```sql
SELECT DISTINCT id, value, key
INTO geohub.tag_dashboard
FROM geohub.tag a
INNER JOIN geohub.dataset_tag_dashboard b
ON a.id = b.tag_id
```

do the same process of `tag_dashboard` table to get insert SQLs.

## Delete temporary working tables

```sql
DROP TABLE geohub.dataset_tag_dashboard;
DROP TABLE geohub.dataset_dashboard;
DROP TABLE geohub.tag_dashboard;
```

Now SQLs for docker postgis is updated!
