
<style>body {text-align: justify}</style>
# Dynamic vector layers

The concept of *geospatial analytics* is central to Geographic Information Systems(GIS) and is assimilated with **generating** new data/information and usually results in new data layers. While traditional GIS are well equipped to handle these types of operations, conducting spatial analytics in a web environment is much more complicated due to limitations in terms of bandwidth, memory, network connecticity, etc.
It is common practive to represent a spatial analytics model or operation using graphs. This has the advantage to increase the clarity and better communicate the core of the analytical model or concept by clearly identifying the inputs, outputs and the internal operations inside the model.

<figure markdown="span">
  ![Figure 1](../assets/analytics/contour_model_qgis.png)
  <figcaption>Conceptual graph of a geospatial analytics operation or model</figcaption>
</figure>

GeoHub goes a step further and allows users to interact with such models in a simple straightforward way just by loading them as layers. Simply said, the models become layers that accept  inputs  through web interfaces like sliders, text input, etc, and  associate this inputs with specific internal parameters of the exposed model. 
 


## Heat Risk Index

To illustrate the advantage of dynamic layers or **analytics as a layer** we developed a dynamic Heat Health Risk Index (HHR).
Risk indicators are a type of layer that is particulary well suited to be imlemented as a dynamic layer. This is because a  risk layer is a composite indicator, with fixed inputs, output and a limited set of control paramerets than control the internal computation. 
HHR is composed of six variables and each one of the inputs can be controled/adjusted using slider controls. Setting a value for a given parameter results in computing the index  for all entities in the layer (admin units) with the input variable adjusted for each end every unit. For example increasing the temperature by 3 degrees Celsius  shows the potential risk the population would be exposed if the global temperature  would raise by three degrees.

<figure markdown="span">
  ![Figure 1](../assets/analytics/dyn_heat_health_index_params.png)
  <figcaption>Heat Health Risk Index parametersUI in GeoHub</figcaption>
</figure>

As a result,  the HHR dynamic layer can be used to identify the risks to the population and develop specific climate adaption strategies to reduce heat-related health risks.

