---
"geohub": patch
---

- fix: set logarithmic if the vector layer property has highly skewed values. created a helper function to check highly skewed (`checkVectorLayerHighlySkewed`).
- fix: set random color if the defaultColor variable is undefined when the propoerty is changed in ColorClassification component.
- refactor: removed code for fill from VectorClassifyLegend.
