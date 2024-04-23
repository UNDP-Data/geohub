# Imagery based analytics

GeoHub's backend is powered by [titiler](https://developmentseed.org/titiler/) a custom Cloud Optimized Geotiff([COG](https://www.cogeo.org/)) server that converts on the fly COGs to map tiles in graphic formats. Titiler features sophisticated mechanisms that can be employed to transform the input COG files on the server side. This forms the backbone of raster based analytics.
In practice, all these details are hidden under the concepts of [algorithms](https://developmentseed.org/titiler/advanced/Algorithms/) and
[expressions](https://cogeotiff.github.io/rio-tiler/api/rio_tiler/expression/) through the UI/UX components.

Much like dynamic vector layers, specific algorithms can be applied transparently to raster layers represented by individual COGs, MosaicJSON documents or Spatio Temporal Assets Catalogs(STAC) assets.

We shall illustrate in the lines below how can one apply simple analytics to specific raster layers. We are going to create a hillshade layer
from elevation data. [Hillshade or shaded relief](https://docs.qgis.org/3.34/en/docs/training_manual/rasters/terrain_analysis.html) shows the shape of the terrain in a realistic fashion by showing how the three-dimensional surface would be illuminated from a point light source.

1.  Open GeoHub and create a new map

    ![Open new map](../assets/analytics/open_map.png)

2.  Search elevation data and load the available algorithms by clicking on the tools icon

    ![Search elevation data](../assets/analytics/load_elevation.png)

3.  Select the hillshade algorithm

    ![Select the hillshade algorithm](../assets/analytics/select_tools.png)

    ![Load elevation data  with hillshade algorithm applied](../assets/analytics/loaded_hillshade.png)

4.  Open layer Properties dialog

    ![Open layer Properties dialog](../assets/analytics/hilshade_layer_props.png)

5.  Adjust hillshade Azimuth partameter to 45 and Angle Altitude to 0

    ![Adjust hillshade Azimuth partameter to 45](../assets/analytics/hillshade_params.png)

    ![Hillshade visiualization after adjusting parameters](../assets/analytics/hillshade_params_changes.png)
