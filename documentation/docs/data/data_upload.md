---
title: Uploading your own data
---

Uploading your datasets to GeoHub is quite straightforward. You can follow the steps descibed in this section to upload them easily.

## Data upload

Firstly, please open **datasets** page from this [link](https://geohub.data.undp.org/data).

You can first **DATA UPLOAD** button at the header of datasets page. If you cannot see **upload** button, that means you have not signed in. Please follow this [steps](../getting-started/signin.md) to login first.

<figure markdown="span">
  ![dataupload_1](../assets/data/dataupload_1.png){:style="width: 600px;"}
  <figcaption>DATA UPLAOD button at datasets page</figcaption>
</figure>

You will be redirected to data upload page. The basic operation flow is shown in the following figure.

<figure markdown="span">
  ![dataupload_2](../assets/data/dataupload_2.png)
  <figcaption>Data upload page</figcaption>
</figure>

1. Drag and drop files to a box or select files from **select files** button.
1. Check all selected files appears in the table.
1. As default, GeoHub will split all datasets into each file. If you want to convert multiple datasets into a file, please tick the checkbox.
1. Once everything is ready, you can click **UPLOAD** button to proceed.

Please stay in this page until all uploads will be completed, you will be automatically redirected to **datasets** page once all uploads are done.

!!! note

    Most of geospatial data formats are a single file. However, if you want to upload some specific formats like **ESRI Shapefile**, please make sure you have selected all essential files (`.shp`, `.prj`, `.dbf`, `.shx`, etc) or make a **zip** file.

    ArcGIS FileGeoDatabase (`.fgb`) also needs to be archived as a **zip** file to upload.

## Check your data at My data

Once your file is uploaded, you will be able to see it in **My Data** tab at datasets page.

<figure markdown="span">
  ![dataupload_3](../assets/data/dataupload_3.png)
  <figcaption>Uploaded dataset at MY DATA tab</figcaption>
</figure>

If status becomes **Processed**, your file is ready to publish.

The following status maybe appears.

- **Downloaded**: Pipeline received a task and downloaded your file.
- **Processing**: Pipeline started ingesting your file
- **Processed**: Pipeline finished ingesting, but not published yet. The table will be automatically refreshed.
- **Partially done**: Some files completed ingesting, but some files are failure.
- **Error**: Failed to ingest all files.
- **Published**: all datasets associated to this uploaded dataset were published

### Uploaded dataset menu

You can open the operation menu for uploaded dataset.

<figure markdown="span">
  ![dataupload_5](../assets/data/dataupload_5.png)
  <figcaption>Uploaded dataset operation menu</figcaption>
</figure>

- **Download**: You can download original dataset from here
- **Show logs**: See [this section](#check-data-pipeline-logs)
- **Cancel**: You only can see this before ingesting is completed. You can cancel ingesting by the pipeline.
- **Delete**: You can delete this data. but you cannot delete it if one of ingested datasets are published.

### Check data pipeline logs

Sometimes you might want to see logs from data pipeline.

The following screenshot shows how you can show logs for your dataset.

1. Click three dotted button at the end of row of a dataset.
1. Click **Show logs** menu.

<figure markdown="span">
  ![dataupload_4](../assets/data/dataupload_4.png)
  <figcaption>Steps to show logs</figcaption>
</figure>

!!! note

    All logs from data pipeline can be seen as a popup dialog. If your data failed to be ingested by the data pipeline, please send all logs to GeoHub team by sending email or opening an issue at [GitHub](https://github.com/UNDP-Data/geohub/issues/new/choose).

## Next step

In next section, you are going to publish the first dataset in GeoHub.
