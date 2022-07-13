# Routes

The following routes are available:

## Tags

Tags allow for the quick and efficient search of layers based on associated keywords. Using Microsoft Azure Blob (https://docs.microsoft.com/en-us/azure/storage/blobs/storage-manage-find-blobs?tabs=azure-portal), ten tag fields have been created per layer and an associated value can be created.

Each tag key/value search result is stored in node-cache to improve performance,

### API

**Generate Tags**

- Request Type: GET
- Endpoint: /tags-generate,json
- Parameters: N/A

*The task will take several minutes to complete. Caution should be exercised when using this endpoint.*

**Get List of All Tags**
- Request Type: GET
- Endpoint: /tags.json
- Parameters: N/A

**Find Tags**
- Request Type: GET
- Endpoint: /tags-search.json
- Parameters: tags
- Example: `/tags.json?tags=electricity,health`

**Tag Cache Warmup**
- Request Type: GET
- Endpoint: /tags-cache-warmup.json
- Parameters: N/A

## STAC 

The SpatioTemporal Asset Catalog (STAC) family of specifications aim to standardize the way geospatial asset metadata is structured and queried. A 'spatiotemporal asset' is any file that represents information about the earth captured in a certain space and time.

A file, `/data/stac.json`, contains an array of STAC catalogues that are loaded by GeoHub.

### API 

**Generate STAC Catalog and Containers**
- Request Type: GET
- Endpoint: /stac-generate.json
- Parameters: N/A

*A file listing the root containers will be created for each catalogue in the directory `/data`.*

**List COGs for each catalogue and container**
- Request Type: GET
- Endpoint: /stac.json
- Parameters: id (catalogue ID), path (container path)
- Example: `/stac.json?id=msft&path=msft/hrea/kenya-2020`


 



