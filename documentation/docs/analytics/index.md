<style>body {text-align: justify}</style>
# Analytics
The geospatial domain features ***three*** main types or categories of analytics that build on the main geospatial data types. 

The **first category** consists of analytics  performed exclusively on vector layers. The results of such operations are usually new vector layers or tables. These types of operations employ very often computatinal geometry methods and can be demanding in terms of resources.

<figure markdown="span">
  ![Figure 1](../assets/analytics/clip_vector.jpeg)
  <figcaption>Example of vector clip/overlay operation where roads are clipped with a circle</figcaption>
</figure>


 The **second category or type** operates on raster or imagery data, tend to be simpler and employ concepts defined in mathematical algebra. However, is is possible to build complex operations representing specific geospatial models/concepts by chaining simple map algebra expressions. 

<figure markdown="span">
  ![Figure 1](../assets/analytics/raster_algebra_sum.jpg)
  <figcaption>Example of raster algebra addition including NODATA </figcaption>
</figure>

 The **third and last category** is represented by the **mixed raster-vector** analytics where computational logic is applied to one raster type layer and another holding geometries. These types of operations are complex and require supplementary operations like converting the vector layer to raster format or reprojection to a common coordinate system.

<figure markdown="span">
  ![Figure 3](../assets/analytics/zonal_stats.gif)
  <figcaption>Zonal statistics,  mixed raster-vector analytics</figcaption>
</figure>

We have to outline that, in general any type of spatial operations between two distinct layers **require** the layers to share the same space in terms of coodinates and **at least partially overlap** like in the graphic below.

<figure markdown="span">
  ![Figure 4](../assets/analytics/intersection.png)
  <figcaption>Example of intersecting geometries/layers</figcaption>
</figure>

In the case the layers spatial coverages **do not overlap**  no spatial operations are possible except merging them into one layer or checking if they overlap. 

<figure markdown="span">
  ![Figure 4](../assets/analytics/disjunct.png)
  <figcaption>Example of geometries/layers that do not overlap</figcaption>
</figure>