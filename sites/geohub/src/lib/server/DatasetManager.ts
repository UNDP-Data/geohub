import type { PoolClient } from 'pg'
import type { DatasetFeature } from '$lib/types'
import type TagManager from './TagManager'

class DatasetManager {
  private dataset: DatasetFeature
  public getDataset() {
    return this.dataset
  }

  constructor(dataset: DatasetFeature) {
    this.dataset = dataset
  }

  public addTags(tags: TagManager) {
    const masterTags = tags.getTags()
    this.dataset.properties.tags?.forEach((x) => {
      const tag = masterTags.find((y) => y.value === x.value && y.key === x.key)
      if (!tag) {
        tags.add(x)
      }
    })
  }

  public updateTags(tags: TagManager) {
    const masterTags = tags.getTags()
    this.dataset.properties.tags?.forEach((x) => {
      const tag = masterTags.find((y) => y.value === x.value && y.key === x.key)
      x.id = tag?.id
    })
  }

  public async upsert(client: PoolClient) {
    const rings = this.dataset.geometry.coordinates as [number, number][][]
    const coordinates = rings[0]
    const wkt = `POLYGON((
		${coordinates[0].join(' ')},
		${coordinates[1].join(' ')},
		${coordinates[2].join(' ')},
		${coordinates[3].join(' ')},
		${coordinates[4].join(' ')}
	))`
    let query = {
      text: `
			INSERT INTO geohub.dataset (
			  id, 
			  url, 
			  name, 
			  description, 
			  is_raster, 
			  license, 
			  bounds, 
			  createdat, 
			  created_user,
			  updatedat,
			  updated_user
			) 
			values (
			  $1, 
			  $2, 
			  $3, 
			  $4, 
			  $5, 
			  $6, 
			  ST_GeomFROMTEXT('${wkt}', 4326), 
			  $7::timestamptz, 
			  $8,
			  $9::timestamptz,
			  $10
			) 
			ON CONFLICT (id)
			DO
			UPDATE
			 SET
			  url=$2, 
			  name=$3, 
			  description=$4, 
			  is_raster=$5, 
			  license=$6, 
			  bounds=ST_GeomFROMTEXT('${wkt}', 4326), 
			  createdat=$7::timestamptz, 
			  updatedat=$9::timestamptz,
			  updated_user=$10`,
      values: [
        this.dataset.properties.id,
        this.dataset.properties.url,
        this.dataset.properties.name,
        this.dataset.properties.description,
        this.dataset.properties.is_raster,
        this.dataset.properties.license,
        this.dataset.properties.createdat,
        this.dataset.properties.created_user,
        this.dataset.properties.updatedat,
        this.dataset.properties.updated_user,
      ],
    }
    await client.query(query)

    query = {
      text: `DELETE FROM geohub.dataset_tag WHERE dataset_id=$1`,
      values: [this.dataset.properties.id],
    }
    await client.query(query)

    if (this.dataset.properties.tags && this.dataset.properties.tags.length > 0) {
      const sql = `
			INSERT INTO geohub.dataset_tag (dataset_id, tag_id) values ${this.dataset.properties.tags
        .map((t) => `('${this.dataset.properties.id}', ${t.id})`)
        .join(',')}`
      await client.query({ text: sql })
    }

    return this.dataset
  }

  public async delete(client: PoolClient, datasetId: string) {
    console.debug(`started deleting ${datasetId}`)
    const queryDatasetTag = {
      text: `
			DELETE FROM geohub.dataset_tag WHERE dataset_id = $1
			`,
      values: [datasetId],
    }
    await client.query(queryDatasetTag)
    console.debug(`deleted it from dataset_tag table`)

    const queryStar = {
      text: `DELETE FROM geohub.dataset_favourite WHERE dataset_id = $1`,
      values: [datasetId],
    }
    await client.query(queryStar)
    console.debug(`deleted it from dataset_favourite table`)

    const queryDataset = {
      text: `DELETE FROM geohub.dataset WHERE id = $1`,
      values: [datasetId],
    }
    await client.query(queryDataset)
    console.debug(`deleted it from dataset table`)
    console.debug(`ended deleting ${datasetId}`)
  }
}

export default DatasetManager
