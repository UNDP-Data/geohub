---
"geohub": patch
---

fix: setSky will add sky spec to style json itself. this affects checking whether style is changed. remove sky prop before saving and exclude it from checking.
