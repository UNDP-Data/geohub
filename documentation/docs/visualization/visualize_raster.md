---
title: Raster data visualization
---

# Raster data visualization

---

## The types of raster data layer

![Three types of raster data in GeoHub. First layer is true color raster, second layer is unique value raster, and the last one is the most general raster which has linear values](../assets/visualization/visualize_raster_types.png){:style="width: 400px;"}

<!-- .element style="height: 400px" -->

--

There are three types of raster layers as follows.

- A raster data that has a linear values (General raster in GeoHub)
- A raster data that has a unique values with label information (Call `Unique value raster` in GeoHub)
- A raster data that has true color image with 3 or 4 bands (RGB or RGBA).

---

<hidden>

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

</hidden>

### Color

#### General raster layer

Most raster datasets in GeoHub has this **Color** property to able to switch between **Simple linear legend** and **Categorized legend** from dropdown menu.

--

##### Simple linear legend

As default, this simple legend is selected. You only can change colormap for this legend. Minimum and maximum values from raster statistics are also shown in the legend. If `Unit` tag is available in the dataset, you maybe can see unit name together.

![Simple raster color legend](../assets/visualization/visualize_raster_color_simple.png){:style="width: 300px;"}

<!-- .element style="height: 200px" -->

--

##### Categorized legend

When you select **Categories** from dropdown, this categorized legend is generated automatically. <hidden>This legend can provide you more advanced visualization. Like color classification component for [vector](./visualize_vector.md#fill-color), the key elements for raster are almost the same.</hidden> You can increase or descrease the number of steps, and change classification method in addition to changing a colormap.

![Categorized raster color legend](../assets/visualization/visualize_raster_color_categories.png){:style="width: 300px;"}

<!-- .element style="height: 300px" -->

--

#### Unique value raster layer

As mentioned ealier, some raster datasets are unique value raster. In this case, **Color** property is also available, but its functionality is limited. <hidden>GeoHub automatically assign a colormap randomly from diverging category to create categorized legend unless you have default style predefinied. You can change a default colormap to another one to make it look better.</hidden>

![Unique values raster color legend](../assets/visualization/visualize_raster_color_uniquevalue.png){:style="width: 300px;"}

<!-- .element style="height: 300px" -->

---

### Rescale Min/Max Values

When the default visualization does not look good, you may need to adjust minimum and maximum values to rescale to achieve the better visualization.

![Adjust Minimum and Max Values to rescale](../assets/visualization/visualize_raster_rescale.png){:style="width: 300px;"}

<!-- .element style="height: 200px" -->

<hidden>

Please have a look at [histogram](#how-histogram-can-be-used-for-visualization) section, it describes how you can use statistics in histogram to adjust rescale values.

</hidden>

---

### Resampling

The resampling/interpolation method to use for overscaling, also known as texture magnification filter.

- `Bi-linear`: (Bi)linear filtering interpolates pixel values using the weighted average of the four closest original source pixels creating a smooth but blurry look when overscaled

- `Nearest neighbor` (default): Nearest neighbor filtering interpolates pixel values using the nearest original source pixel creating a sharp but pixelated look when overscaled

---

### Brightness Max

Yoou can increase or reduce the brightness of the image between 0 and 1. The value is the maximum brightness, and default is 1.

---

### Brightness Min

You can increase or reduce the brightness of the image between 0 and 1. The value is the minimum brightness, and default is 0.

---

### Contrast

You can increase or reduce the contrast of the image between -1 and 1.

---

### Hue Rotate

You can adjust rotates hues around the color wheel between 0 and 359.

---

### Saturation

You can increase or reduce the saturation of the image between -1 and 1.

---

## How Histogram can be used for visualization

GeoHub offers the user to display their data set’s statistical information using a histogram which enables the user to determine skewness and kurtosis of the data set.

--

The first example displays the histogram for the Long-term Average Of Direct Normal Irradiation data set with a normal distribution and the second example is from the highly sked data set for the Population Density of 2020.

![Normal distribution example from Long-term Average Of Direct Normal Irradiation data in GeoHub](../assets/visualization/visualize_raster_histogram_normaldistribution.png)

<!-- .element style="height: 400px" -->

--

![Highly skewed data example from Population Density of 2020 data in GeoHub](../assets/visualization/visualize_raster_histogram_skewed.png)

<!-- .element style="height: 400px" -->

As you can see, normal distribution data can be visualized quite well as default. However, visualization of highly skewed data is a little bit tricky although GeoHub is trying to optimize default setting. You may need to adjust rescale property for better visualization.

--

The below example is the Population Density of 2020 layer after adjusting rescale property. Now you can see the significant difference between before and after rescaling.

![Highly skewed data example after rescaled from Population Density of 2020 data in GeoHub](../assets/visualization/visualize_raster_histogram_skewed_rescaled.png)

<!-- .element style="height: 400px" -->

<hidden>

It is worth to check how the data distribution looks like in case the default visualization does not look good.

</hidden>

---

## Transform tab (Advanced)

The **raster transform tab** provides an ability to filter the data in a different way of rescaling.

Here, we use _Digital Elevation Model (DEM) 10m resolution, Rwanda_ dataset as an example to show each step how you can transform it.

--

- Click **Add** button under **TRANSFORM** tab

Open a layer editor panel, move to the **TRASFORM** tab, then click **ADD** button.

![Click Add button at TRANSFORM tab to start adding new filter rule](../assets/visualization/visualize_raster_transform_1.png)

<!-- .element style="height: 400px" -->

--

- Select a math operator for filtering.

Firstly, you will be asked to select a mathmatics operator.

![Select an operator for filtering value](../assets/visualization/visualize_raster_transform_2.png)

<!-- .element style="height: 400px" -->

--

the following operators are available for raster transform.

- `=`: Equals. Only show pixels which exactly matched threshold
- `≠`: Differs. Show pixels except exactly matched to threshold.
- `>`: Larger than. Show pixels which have greather than threshold value.

--

- `<`: Smaller than. Show pixels which have less than threshold value.
- `>=`: Larger than or equal to. Show pixels which have greater than or equal to threshold value.
- `<=`: Smaller than or equal to. Show pixels which have less than or equal to threshold value.

Here, we select `< (less than)` operator.

--

- Select a threahold and apply filter

Then, select a threshold and click **APPLY** button to apply new filtering rule for a raster dataset.

--

![Select a threshold which is applied for filtering together with the operator you selected in last step](../assets/visualization/visualize_raster_transform_3.png)

<!-- .element style="height: 400px" -->

<hidden>

!!! note

    You can use a slider to roughly move it to the place which you disire to filter. Then, use `← (-)` or `→ (+)` butto, or manually input at textbox in your keyboard to adjust the threshold precisely.

!!! warning

    If you have changed layer minimum and maximum values from **Rescale** property, your rescale setting will be removed when new transform rule is applied. But you can still can change rescale after applying transforming rule.

</hidden>

--

- The result after transforming

The following figure shows the result after applying the rule which the first band value is less than or equal to 1999m. If you compare the screenshot before applying a filter, you can clearly see what the difference is.

![After applying a filter rule in a raster data layer](../assets/visualization/visualize_raster_transform_4.png)

<!-- .element style="height: 400px" -->

--

This raster transform can retain the original colormap after adding new transform rule, but it changes rescale setting from the latest layer statistics. In this example, the pixels which have altitude is less than 2000 use the same colormap with before. But pixels more than 1999m altitude shows dark brown color. To achieve the best result of visualization, it is recommended to visit [Rescale property](#rescale-minmax-values), and set the appropriate min and max values as well.

---

## Next step

We have explored how raster layer can be visualized in this section. We are going to explore about colormaps used in GeoHub.
