---
title: Filtering vector data
---

# Filtering vector data

---

## Filter tab

Sometimes you may want to hide some features by using indicators. 

For example, only show where HDI is less than X value. In such case, filtering feature in GeoHub might be useful for you to visualize only focused features.

---

### Add new filter rule

To use filtering, firstly please move to **FILTER** tab, then click **NEW RULE** button.

![Adding new filter rule](../assets/visualization/visualize_vector_filter_1.png){:style="width: 300px;"}

<!-- .element style="height: 200px" -->

---

### Select a property

Then, select a property you wish to filter by certain values.

![Selecting a property to apply this rule of filtering](../assets/visualization/visualize_vector_filter_2.png){:style="width: 300px;"}

<!-- .element style="height: 300px" -->

---

### Choose an operator

After selecting a property, you need to choose what operator is used for filtering.

![Select an operator that is used for this rule](../assets/visualization/visualize_vector_filter_3.png){:style="width: 300px;"}

<!-- .element style="height: 300px" -->

---

### Choose a threshold to filter

After selecting a property and an operator, you need to select a value for filtering. 

The user interface can vary according to the data type of selected property. 

--

The below diagram is an example when you select a numeric field with _Larger_ / _Smaller_ operator. After selecting a value, click **APPLY** button. Your filtering rule will be applied to the map layer immediately.

![Apply value for this rule to filter](../assets/visualization/visualize_vector_filter_4.png){:style="width: 300px;"}

<!-- .element style="height: 300px" -->

---

### Result after applying a filter

![An example after filtering where HDI is more than a threshold](../assets/visualization/visualize_vector_filter_6.png)

<!-- .element style="height: 400px" -->

---

### Continue adding or removing filter

You can continue adding another rule if you wish

![Viewing and managing existing filtering rules](../assets/visualization/visualize_vector_filter_5.png){:style="width: 300px;"}

<!-- .element style="height: 200px" -->

<hidden>

!!! note

    When you add more than one rules to the layer, the toggle button on the top of **FILTER** tab might be important. As default, `All conditions must be true` (AND filter) is selected. You might need to change to `One condition must be true` (OR filter) to achieve your desired result.

</hidden>

---

## Next step

In the next step, you will learn how to add additional information as labels to vector dataset.