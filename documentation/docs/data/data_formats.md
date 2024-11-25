---
title: GIS data types and GIS data formats
---

# GIS data types and GIS data formats

This section explains about the concept of geospatial data and how GeoHub manages datasets. The GeoHub hosts raster and vector data which is preprocessed.

---

![Types of geospatial data](../assets/data/types_gis_data.png)
Image source: https://volaya.github.io/gis-book/en/Data.html

---

Vector data comprises of point, lines and polygon layers in which is converted cloud optimized verctor tile - **PMTiles**. Raster data acquired from different sources have been converted to **Cloud Optimized GeoTiffs (COG)** which allows users to stream just the portion of data that it needs, improving processing times and creating real-time workflows previously not possible.

---

GeoHub uses an amazing geospatial libarary **GDAL** to convert various formats of geospatial datasets to either **COG** or **PMTiles**. Most of major GIS formats are supported by GeoHub. You can read more about supported format [here](https://geohub.data.undp.org/data/supported-formats)

---

## Next step

In next section, you will be learning how GeoHub manages these geospatial datasets as a centralized database.
