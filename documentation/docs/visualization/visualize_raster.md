---
title: Raster data visualization
---

## The types of raster data layer

There are three types of raster layers as follows.

- A raster data that has a linear values (General raster in GeoHub)
- A raster data that has a unique values with label information (Call `Unique value raster` in GeoHub)
- A raster data that has true color image with 3 or 4 bands (RGB or RGBA).

<figure markdown="span">
  ![visualize_raster_types.png](../assets/visualization/visualize_raster_types.png){:style="width: 400px;"}
  <figcaption>Three types of raster data in GeoHub. First layer is true color raster, second layer is unique value raster, and the last one is the most general raster which has linear values.</figcaption>
</figure>

## Style editing components

Except the Opacity property described in the previous section, the following visualization components for a raster data layer are available in Geohub. But some of components may not be available according to the raster layer type.

| Component                                        | General raster | Unique value raster | True color raster |
| ------------------------------------------------ | -------------- | ------------------- | ----------------- |
| [Color](#color)                                  | Available      | Limited             | N/A               |
| [Rescale Min/Max Values](#rescale-minmax-values) | Available      | N/A                 | N/A               |
| [Resampling](#resampling)                        | Available      | Available           | Available         |
| [Brightness Max](#brightness-max)                | Available      | Available           | Available         |
| [Brightness Min](#brightness-min)                | Available      | Available           | Available         |
| [Contrast](#contrast)                            | Available      | Available           | Available         |
| [Hue Rotate](#hue-rotate)                        | Available      | Available           | Available         |
| [Saturation](#saturation)                        | Available      | Available           | Available         |

### Color

<figure markdown="span">
  ![visualize_raster_color_simple.png](../assets/visualization/visualize_raster_color_simple.png){:style="width: 300px;"}
  <figcaption>Simple raster color legend</figcaption>
</figure>

<figure markdown="span">
  ![visualize_raster_color_categories.png](../assets/visualization/visualize_raster_color_categories.png){:style="width: 300px;"}
  <figcaption>Categorized raster color legend</figcaption>
</figure>

<figure markdown="span">
  ![visualize_raster_color_uniquevalue.png](../assets/visualization/visualize_raster_color_uniquevalue.png){:style="width: 300px;"}
  <figcaption>Unique values raster color legend</figcaption>
</figure>

### Rescale Min/Max Values

When the default visualization does not look good, you may need to adjust minimum and maximum values to rescale to achieve the better visualization.

<figure markdown="span">
  ![visualize_raster_rescale.png](../assets/visualization/visualize_raster_rescale.png){:style="width: 300px;"}
  <figcaption>Adjust Minimum and Max Values to rescale</figcaption>
</figure>

Please have a look at [histogram](#how-histogram-can-be-used-for-visualization) section, it describes how you can use statistics in histogram to adjust rescale values.

### Resampling

The resampling/interpolation method to use for overscaling, also known as texture magnification filter.

- `Bi-linear`: (Bi)linear filtering interpolates pixel values using the weighted average of the four closest original source pixels creating a smooth but blurry look when overscaled

- `Nearest neighbor` (default): Nearest neighbor filtering interpolates pixel values using the nearest original source pixel creating a sharp but pixelated look when overscaled

### Brightness Max

Yoou can increase or reduce the brightness of the image between 0 and 1. The value is the maximum brightness, and default is 1.

### Brightness Min

You can increase or reduce the brightness of the image between 0 and 1. The value is the minimum brightness, and default is 0.

### Contrast

You can increase or reduce the contrast of the image between -1 and 1.

### Hue Rotate

You can adjust rotates hues around the color wheel between 0 and 359.

### Saturation

You can increase or reduce the saturation of the image between -1 and 1.

## How Histogram can be used for visualization

GeoHub offers the user to display their data set’s statistical information using a histogram which enables the user to determine skewness and kurtosis of the data set.

The first example displays the histogram for the Long-term Average Of Direct Normal Irradiation data set with a normal distribution and the second example is from the highly sked data set for the Population Density of 2020.

<figure markdown="span">
  ![visualize_raster_histogram_normaldistribution.png](../assets/visualization/visualize_raster_histogram_normaldistribution.png)
  <figcaption>Normal distribution example from Long-term Average Of Direct Normal Irradiation data in GeoHub</figcaption>
</figure>

<figure markdown="span">
  ![visualize_raster_histogram_skewed.png](../assets/visualization/visualize_raster_histogram_skewed.png)
  <figcaption>Highly skewed data example from Population Density of 2020 data in GeoHub</figcaption>
</figure>

As you can see, normal distribution data can be visualized quite well as default. However, visualization of highly skewed data is a little bit tricky although GeoHub is trying to optimize default setting. You may need to adjust rescale property for better visualization.

The below example is the Population Density of 2020 layer after adjusting rescale property. Now you can see the significant difference between before and after rescaling.

<figure markdown="span">
  ![visualize_raster_histogram_skewed_rescaled.png](../assets/visualization/visualize_raster_histogram_skewed_rescaled.png)
  <figcaption>Highly skewed data example after rescaled from Population Density of 2020 data in GeoHub</figcaption>
</figure>

It is worth to check how the data distribution looks like in case the default visualization does not look good.

## Transform tab (Advanced)

## Next step
