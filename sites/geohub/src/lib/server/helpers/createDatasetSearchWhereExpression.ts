import { DatasetSearchQueryParams } from '$lib/constants'

export const createDatasetSearchWhereExpression = async (url: URL, tableAlias: string, user_email?: string) => {
  let query = url.searchParams.get('query')
  const storage_id = url.searchParams.get('storage_id')
  const bbox = url.searchParams.get('bbox')
  let bboxCoordinates: number[]
  if (bbox) {
    bboxCoordinates = bbox.split(',').map((val) => Number(val))
    if (bboxCoordinates.length !== 4) {
      throw new Error('Invalid bbox')
    }
  }

  const operatorOptions = ['and', 'or']
  const operator = url.searchParams.get('operator') ?? operatorOptions[0]
  if (!(operator && operatorOptions.includes(operator.toLowerCase()))) {
    throw new Error(`Bad parameter for 'operator'. It must be one of '${operatorOptions.join(', ')}'`)
  }

  const filters: { key: string; value: string }[] = []
  url.searchParams.forEach((key, value) => {
    if (DatasetSearchQueryParams.includes(value)) return
    filters.push({
      key: value,
      value: key.toLowerCase(),
    })
  })

  const _onlyStar = url.searchParams.get('staronly') || 'false'
  const onlyStar = _onlyStar.toLowerCase() === 'true'

  const values = []
  if (query) {
    // normalise query text for to_tsquery function
    query = query
      .toLowerCase()
      .replace(/\r?\s+and\s+/g, ' & ') // convert 'and' to '&'
      .replace(/\r?\s+or\s+/g, ' | ') // convert 'or' to '|'
    values.push(query)
  }

  const sql = `
    WHERE 
    NOT ST_IsEmpty(${tableAlias}.bounds)
    ${
      !query
        ? ''
        : `
    AND (
      to_tsvector(${tableAlias}.name) @@ to_tsquery($1)
     OR to_tsvector(${tableAlias}.description) @@ to_tsquery($1)
     )`
    }
    ${getStorageIdFilter(storage_id, values, tableAlias)}
    ${operator === 'and' ? getTagFilterAND(filters, values, tableAlias) : getTagFilterOR(filters, values, tableAlias)}
    ${getBBoxFilter(bboxCoordinates, values, tableAlias)}
    ${
      onlyStar && user_email
        ? `
    and exists (
      SELECT dataset_id FROM geohub.dataset_favourite WHERE dataset_id=${tableAlias}.id AND user_email='${user_email}'
    )
    `
        : ''
    }
    `

  return {
    sql,
    values,
  }
}

const getStorageIdFilter = (storage_id: string, values: string[], tableAlias: string) => {
  if (storage_id) {
    values.push(storage_id)
  } else {
    return ''
  }
  return `AND ${tableAlias}.storage_id=$${values.length} `
}

const getTagFilterOR = (filters: { key?: string; value: string }[], values: string[], tableAlias: string) => {
  if (filters.length === 0) return ''
  return `
      AND EXISTS(
        SELECT a.id 
        FROM geohub.tag as a 
        INNER JOIN geohub.dataset_tag as b
        ON a.id = b.tag_id
        WHERE b.dataset_id = ${tableAlias}.id AND (
      ${filters
        .map((filter) => {
          values.push(filter.key)
          const keyLength = values.length
          values.push(`'${filter.value}'`)
          const valueLength = values.length
          return `(a.key = $${keyLength} and to_tsvector(a.value) @@ to_tsquery($${valueLength})) `
        })
        .join('OR')}
      ))`
}

const getTagFilterAND = (filters: { key?: string; value: string }[], values: string[], tableAlias: string) => {
  if (filters.length === 0) return ''
  return `
      AND EXISTS(
        SELECT dataset_id FROM (
      ${filters
        .map((filter) => {
          values.push(filter.key)
          const keyLength = values.length
          values.push(`'${filter.value}'`)
          const valueLength = values.length
          return `
          SELECT b.dataset_id
          FROM geohub.tag as a 
          INNER JOIN geohub.dataset_tag as b
          ON a.id = b.tag_id
          WHERE a.key =$${keyLength} and to_tsvector(a.value) @@ to_tsquery($${valueLength}) 
          `
        })
        .join('INTERSECT')}
        ) y
        WHERE dataset_id = ${tableAlias}.id
      )`
}

const getBBoxFilter = (bbox: number[], values: string[], tableAlias: string) => {
  if (!(bbox && bbox.length === 4)) return ''
  bbox.forEach((val) => {
    values.push(val.toString())
  })
  return `
    AND ST_INTERSECTS(
      ${tableAlias}.bounds, 
      ST_MakeEnvelope(
        $${values.length - 3}::double precision,
        $${values.length - 2}::double precision,
        $${values.length - 1}::double precision,
        $${values.length}::double precision
        , 4326
      )
    )
    `
}
