import type { RequestHandler } from './$types'
import { generateAzureBlobSasToken } from '$lib/server/helpers'
import type { DatasetFeature, Tag } from '$lib/types'
import DatabaseManager from '$lib/server/DatabaseManager'

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession()
  const user_email = session?.user.email

  const id = params.id
  const dbm = new DatabaseManager()
  const client = await dbm.start()
  try {
    const sql = {
      text: `
      WITH datasetTags as (
        SELECT
        x.id,
        array_to_json(array_agg(row_to_json((
          SELECT p FROM (
          SELECT
            z.key,
            z.value
          ) AS p
          )))) AS tags
        FROM geohub.dataset x
        LEFT JOIN geohub.dataset_tag y
        ON x.id = y.dataset_id
        INNER JOIN geohub.tag z
        ON y.tag_id = z.id
        GROUP BY
          x.id
      ),
      no_stars as (
        SELECT dataset_id, count(*) as no_stars FROM geohub.dataset_favourite GROUP BY dataset_id
      )
      SELECT row_to_json(feature) AS feature 
      FROM (
          SELECT
          'Feature' AS type,
          ST_AsGeoJSON(ST_TRANSFORM(x.bounds,4326))::json AS geometry,
          row_to_json((
          SELECT p FROM (
          SELECT
            x.id, 
            x.url, 
            x.name,
            x.description,
            x.is_raster, 
            x.license, 
            x.createdat, 
            x.created_user,
            x.updatedat,
            x.updated_user,
            y.tags,
            CASE WHEN z.no_stars is not null THEN z.no_stars ELSE 0 END as no_stars,
            ${
              user_email
                ? `
              CASE
                WHEN (
                SELECT count(dataset_id) as count FROM geohub.dataset_favourite 
                WHERE dataset_id=x.id and user_email='${user_email}'
                ) > 0 THEN true
                ELSE false
              END as is_star
              `
                : 'false as is_star'
            }
          ) AS p
          )) AS properties
          FROM geohub.dataset x
          LEFT JOIN datasetTags y
          ON x.id = y.id
          LEFT JOIN no_stars z
          ON x.id = z.dataset_id
          WHERE x.id=$1
        ) AS feature
      `,
      values: [id],
    }
    // console.log(sql)
    const res = await client.query(sql)
    if (res.rowCount === 0) {
      return new Response(JSON.stringify({ message: `No dataset found.` }), {
        status: 404,
      })
    }
    const feature: DatasetFeature = res.rows[0].feature

    // add SAS token if it is Azure Blob source
    const tags: Tag[] = feature.properties.tags
    const type = tags?.find((tag) => tag.key === 'type')
    if (!(type && ['martin', 'pgtileserv', 'stac'].includes(type.value))) {
      const sasToken = generateAzureBlobSasToken(feature.properties.url)
      feature.properties.url = `${feature.properties.url}${sasToken}`
    }

    return new Response(JSON.stringify(feature))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    dbm.end()
  }
}
