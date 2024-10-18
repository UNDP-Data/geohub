---
"geohub": patch
---

fix: previously user settings are remained even after user sign out. It was occured by that Object.assign update DefaultUserConfig variable in nodejs side. Now copied object is passed to Object.assign to prevent default value is changed.
