# Hands-on exercise

In this exercise, we are going to create a map with a dataset from GeoHub. Let's begin.

## Open a blank map page

To create your own map to visualize, open a new blank map editor in GeoHub.

See the steps at [Open a map editor](./map_view.md#open-a-map-editor-for-new-map)

<figure markdown="span">
  ![exercise_1.png](../assets/visualization/exercise_1.png)
  <figcaption>A blank map editor for creating new map</figcaption>
</figure>

## Add a dataset to map

Then, search a dataset named `Electricity access estimate 2020` under _SDG 7_ at **Data** tab by following the steps described at [Searching datasets on Map page](../data/search_datasets_on_map.md).

<figure markdown="span">
  ![exercise_2.png](../assets/visualization/exercise_2.png)
  <figcaption>Searching Electricity access dataset at Data tab</figcaption>
</figure>

Once you found the dataset, click **ADD LAYER** button to add it to map. It will be shown under **LAYERS** tab.

There is a geolocation search tool at the top-left of the map. Search your interested place and zoom it. Here, I search `Narok` for my map.

<figure markdown="span">
  ![exercise_3.png](../assets/visualization/exercise_3.png)
  <figcaption>Search your interested location to zoom</figcaption>
</figure>

## Change layer style

This is a raster dataset, please follow the steps of [Color](./visualize_raster.md#color) section, change a colormap to suitable one. For my map, I change a colormap to one of sequential colormaps.

<figure markdown="span">
  ![exercise_4.png](../assets/visualization/exercise_4.png)
  <figcaption>Change colormap at STYLE tab in layer editing panel</figcaption>
</figure>

As default, sequential colormap is that the more higher value is, the more dark color is. But we want to focus on where there is less electricity around this city. So, I ticked **Reverse colors** checkbox on colormap picker. Now, the more dark color area, the more houses and buildings has less electricity. Now you can see the outskirts of Narok town has some area where has less electrified.

We can also make two categories (0.61 to 0.81 and 0.81 to 1.01) invisible. The result should be like the below screenshot.

<figure markdown="span">
  ![exercise_5.png](../assets/visualization/exercise_5.png)
  <figcaption>Make higher electrified area invisible in categories color property</figcaption>
</figure>

You can close editing panel now.

## Save a map

Now, we can save a public map. Follow the steps of [saving a map](./save_map.md), save your map to GeoHub. Rename title to more precise name, and change access level to Public. Then click **SHARE** button.

<figure markdown="span">
  ![exercise_6.png](../assets/visualization/exercise_6.png)
  <figcaption>Save a public map after renaming title</figcaption>
</figure>

## Share a URL with your colleague

Once your map is saved, a unique map URL is shown on the share dialog as shown in the below screenshot.

<figure markdown="span">
  ![exercise_7.png](../assets/visualization/exercise_7.png)
  <figcaption>Map URL is shown after saving a map</figcaption>
</figure>

Copy the URL and open it as new tab. Also, share it with one of your colleagues to look at it each other.

## Extra challenge

This map now has a electricity esitimate layer for a particular area of interest. For extra challenge, you can search any other datasets in addition to the data layer we have created. Try to overlay other layers to make a beautiful map. Once you have made changes, make sure saving your new map.
