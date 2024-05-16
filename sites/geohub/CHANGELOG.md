# geohub

## 1.8.9

### Patch Changes

- ec59def: fix: check whether assets are selected for all input bands when the date is changed from picker.
- 2d633db: feat: improved behaviour of selecting dates in RCA date picker. If the first band's date is changed, it will update the remaining bands' date by the first band one.

## 1.8.8

### Patch Changes

- 5f733f8: fix: fixed link of existing map edit page at data page

## 1.8.7

### Patch Changes

- 25f0740: fix: fixed bug of tag filter search. Added 'Apply' button in tag filter to improve searching experience. In new tag filter, filtration will not be applied automatically unless user click apply button or clear all button.
- a064b83: fix: reset unapplied tag filter setting when the popup is closed.

## 1.8.6

### Patch Changes

- bbdcc5a: fix: removed unnecessary import of fontawesome css

## 1.8.5

### Patch Changes

- 224477a: chore: migrated bulma to v1.0.0. Included fontawesome css and google font icon css in customised bulma css.

## 1.8.4

### Patch Changes

- 0391106: fix: removed padding and domain props which made color legend look differently actual.

## 1.8.3

### Patch Changes

- 9be6904: fix: add unit tag if algorithm's outputs.unit prop is available for showing unit in legend.
- eb45491: fix: add unit tag when RCA layer for stac is added
- ac9ea9e: fix: show labels on slider if algorithm's options_descriptions property is available

## 1.8.2

### Patch Changes

- c72db33: fix: fixed bug of updating STAC collection dataset's metadata in management page

## 1.8.1

### Patch Changes

- c7fab11: fix: In raster transform, use layer max + 1 for <, <= operator. and Use min - 1 for >, >= operator.
- e88c887: fix: Use nodata_value from info if available, otherwise use -9999 or threshold value inputted
- b41318f: fix: update rescale store when a raster transform is applied

## 1.8.0

### Minor Changes

- a7661b4: feat: add /api/mapstyle endpoint to serve base maplibre styles. The endpoint solves sprite relative url to absolute url.

## 1.7.31

### Patch Changes

- 1dab83d: fix: fixed bug of rescale when min/max is 0-1
- 2dec39c: refactor: make logic simplified for RasterTransformSimple
- 435c876: fix: fixed a bug of restoring style in map page
- c8ffb4c: refactor: Use slider from svelte-undp-component

## 1.7.30

### Patch Changes

- 31ccbe9: fix: simplified the logic of state management for RasterTransform
- 313760e: fix: restore raster categories correctly when users set a class color transparent or customized.
- e87ccb6: fix: improved the logic of saved style update
- 0c3f160: fix: initialize StyleSwitcher at a map portal
- d48bd97: fix: fixed bug of map query after applying raster expression.
- 1f292c2: fix: set -9999 as default value for raster expression instead of zero. Also, set nodata option for -9999

## 1.7.29

### Patch Changes

- cb8d6dc: fix: update saved style sources and layers from the latest base style

## 1.7.28

### Patch Changes

- 05ac13e: fix: Updated StaticImageControl, and make api type setting hidden for GeoHub's export control

## 1.7.27

### Patch Changes

- 7db91c4: fix: made Raster transform advanced feature hidden
- 7db91c4: fix: improved the UI design of RasterTransformSimple
- 7db91c4: fix: Use notification component and adjust layout for RasterTransformSimple
- aa46058: fix: the height of map in default style edit page will be changed between 300px and 700px depending on the height of browser.

## 1.7.26

### Patch Changes

- 93ea9b8: fix: show ColorPicker dialog correctly for heatmap color property

## 1.7.25

### Patch Changes

- 2916f97: fix: use unified design for raster transform. fixed a bug of simple transform when it is applied

## 1.7.24

### Patch Changes

- b2e0928: fix: removed scroll from vector filter component since the parent component has it. Use unified button design for some buttons of filter.

## 1.7.23

### Patch Changes

- fcbae9f: fix: fixed layout collapse for vector filter
- 39c3426: fix: to run auth.js correctly, set a constant string if it is not provided

## 1.7.22

### Patch Changes

- e853c8c: refactor: use DatePicker and FieldControl at StacApiExplorer
- 206d59d: fix: create unit tag and use colormap_name if they are available in algorithm. Select asset as default if any keywords are matched.
- a646bec: fix: enabled rescale property if an algorithm layer has rescale url query param
- a7ae7dd: fix: accidentally removed rescale from URL when colormap is changed. Now it preserve original rescale in URL.
- e853c8c: fix: close datepicker popup if a date is selected
- a7ae7dd: fix: add algorithm param in default style api to create correct layer definition and metadata according to setting

## 1.7.21

### Patch Changes

- 9e3755f: feat: add RCA layer to map for nighttimelight data from UNDP STAC catalog

## 1.7.20

### Patch Changes

- fe7f0e2: fix: fixed bug of stac calatalog's breadcrumbs in management page

## 1.7.19

### Patch Changes

- 20cab71: fix: add tool registration control for STAC collection registration.
- f74671a: chore: updated auth.js modules
- bf58cdc: fix: register STAC Catalog as a collection level with selected access level on management page.

## 1.7.18

### Patch Changes

- c75fae8: feat: add maptiler geocoder
- 73c598e: feat: show year and resolution, admin level tag in info tab if they are applicable
- 2794c6f: fix: year, resolution and unit are quite important tags, but it was a little bit hidden. Now I made them more visible in tags tab of editor.

## 1.7.17

### Patch Changes

- ccce1c8: fix: moved some dependencies to devDependencies

## 1.7.16

### Patch Changes

- b1742b8: fix: downgraded a patch version for auth.js to solve this error of ERR_INVALID_URL
- 4290be3: refactor: use `await locals.auth()` instead of deprecated `getSession()`.

## 1.7.15

### Patch Changes

- 1245830: fix: remove add to map button in ingested dataset preview

## 1.7.14

### Patch Changes

- b870a1d: fix: fixed bug not showing management link in footer correctly

## 1.7.13

### Patch Changes

- e6fbbbc: fix: exported GEOHUB_DOCS_ENDPOINT, SVELTE_UNDP_DESIGN_ENDPOINT and SVELTE_UNDP_COMPONENTS_ENDPOINT as environmental variables in dotenv.

## 1.7.12

### Patch Changes

- c0f1623: fix: improved layout of user dropdown menu. also changed the design when users do not sign in.

## 1.7.11

### Patch Changes

- 914d9f7: feat: show GeoHub version and package licenses used

## 1.7.10

### Patch Changes

- ca0a97d: - refactor: replaced parameter component with new PropertyEditor in svelte-undp-components
  - fix: set default search limit for map page correctly
- 917ca61: refactor: moved ColorMapPicker component to svelte-undp-components

## 1.7.9

### Patch Changes

- 01b1889: fix: the link to map page from STAC management page was fixed
- 839548c: fix: show algorithm's title and description at accordion title and help at layer editor

## 1.7.8

### Patch Changes

- f5f5cb9: fix: fixed bug of not showing attribution correctly for vector datasets, also now forcely update attribution for saved map in /style/{id} endpoint.

## 1.7.7

### Patch Changes

- eaa072c: fix: fixed bug of inaccessible to data page when users do not sign in

## 1.7.6

### Patch Changes

- 158f57f: fix: add robots.txt
- f7bcb53: fix: show title and description at Tools page, and show slider if minimum and maximum value are available in algorithm
- 6255c69: fix: show accessibility icon on card at maps and data page
- f76566f: feat: added List view for maps page

## 1.7.5

### Patch Changes

- 5566f74: fix: when user search & char in datasets api, & will be ignored (replaced to empty string)

## 1.7.4

### Patch Changes

- f1b6977: fix: url to /maps/edit in `New Map` button in /maps page"

## 1.7.3

### Patch Changes

- 79a4c74: feat: add an edit button at map page to allow users to update map title and access level easily
- 6b7907a: fix: add access level to info tab of data page
- 79ac5bb: fix: show signed user list by typed string for user permission feature

## 1.7.2

### Patch Changes

- d1f463c: fix: moved star & delete button to info tab, and moved open button to header
- 3b648ee: refactor: Use HeroHeader component for each page

## 1.7.1

### Patch Changes

- 891db41: refactor: moved HeroLink component to svelte-undp-component
- 155ec0c: refactor: migrated Tabs to svelte-undp-components
- 48e9af8: fix: added svelte-undp-components storybook page link to footer
- 4f0dc31: refactor: migrated FloatingPanel to svelte-undp-component
- 9823d43: refactor: migrated ModalTemplate to svete-undp-component
- ef2ede6: refactor: migrated PanelButton to svelte-undp-component
- a429887: fix: show band description after band name in raster band selectbox if applicable
- e5b1f0f: refactor: moved BackToTop component to svelte-undp-component
- 9823d43: refactor: migrated Modal component to svelte-undp-component, and renamed it to ModalNotification
- dd20b69: refactor: switched Breadcrumbs to svelte-undp-components
- c29cd12: refactor: moved FieldControl component to svelte-undp-component
- 693dd0d: refactor: Use 'clean' and 'handleEnterKey' methods from svelte-undp-components
- d6f0127: refactor: moved SegmentButtons component to svelte-undp-component package
- feaf9c7: refactor: moved ShowDetails component to svelte-undp-component
- bd2d1d4: refactor: moved Help component and initTippy & initTooltipTippy to svelte-undp-components package
- 3091d04: refactor: moved Accordion component to svelte-undp-component

## 1.7.0

### Minor Changes

- 405228b: feat: added "Tools" tab in dataset edit page to allow users to link algorithms to a dataset as tags
- cfcc6fd: feat: add /tools page to explore algorithms registered to the datasets
- f17770c: feat: implemented /api/token to issue an access token for GeoHub API. The token can be used within /api endpoints by adding 'token' query param.

### Patch Changes

- 71fd0fc: fix: remove `data-sveltekit-preload-code="viewport"` from app.html
- 623dafd: fix: add tools page link in data page. moved data upload button to header
- dd49efb: fix: add Tools menu in header

## 1.6.3

### Patch Changes

- e022cb1: fix: moved Algorithm selectbox from map edit component to outside of map page. Created a tab 'Tools' to allow users to explore algos. Also it is available from accordion of data tab in map page.
- 73b5d29: - fix: fixed the layout collapse of vector color classify legend
  - fix: fixed icon image picker bug
- 16fd0d0: fix: improved UI and behaviour of back to top button
- 3053859: fix: close user account popup if clicked menu
- adad196: fix: no issuance of SAS token if a blob is stored in public container of geohub's storage account.

## 1.6.2

### Patch Changes

- e134bbc: fix: show toggle button for boolean parameter
- 708de8c: fix: bug of selecting a band from multiband raster
- 4b93e99: fix: show button border color at data page to use unified design
- bfbe31f: fix: created /data/edit page to allow new dataset to register. Fixed some bugs associated to tags registration.

## 1.6.1

### Patch Changes

- 1477abe: fix: redirect to map edit page from stac explorer
- 37da3b1: fix: redesigned setting page layout
- d123b35: fix: set max-width: 768px for hero width

## 1.6.0

### Minor Changes

- 9b46109: feat: rearrange pages under /maps endpoint. Moved the list of saved maps content to /maps page, and moved a blank map editor from /maps to /maps/edit
- 752bd10: feat: created /dashboards endpoint to manage dashboard page, enabled SSR for Electricity Dashboard

### Patch Changes

- dd457fa: feat: added new setting of Development mode in setting page to enable tile boundaries and collision boxes for advanced users.
- 684c6f9: fix: removed content text from social card image
- 8b740ae: - fix: removed unnecessary padding from layer editor panel
  - fix: adjust header title style for floating panel component
  - fix: changed color of layer selected
- b36ace1: fix: embed /maps and /maps/edit links to hero text in landing page
- cf41a48: fix: fixed layout of hero in landing page
- 7bcdfae: fix: fixed URL link of 'add to map' button to map editor page from dataset page
- cc09c4e: fix: enabled horizontal scroll for Tabs component.

## 1.5.2

### Patch Changes

- b3ca5b8: fix: make spaces between menu buttons in layer tab a bit wider

## 1.5.1

### Patch Changes

- 0fe3bb9: fix: improved design of segment buttons

## 1.5.0

### Minor Changes

- 1fea0b0: feat: added Map view to explore datasets at data page.

### Patch Changes

- 0ec19f1: fix: changed fontweight to bold and transforming text to uppercase for buttons (except toggle)
- a251f52: fix: changed algorithm accordion title and field labels
- 5a14841: fix: make private map edit page accessible for superuser
- 51d3508: chore: migrated svelte color picker from v2 to v3
- 6bedeec: fix: minimized required environmental variables to launch geohub locally in docker-compose. Fixed several bugs for it. and added some error handling if some variables are missing.
- d6a0a4d: fix: changed default similation argument's title color to black to improve accesibility issue
- b2d3d1b: fix add error handling in isStyleChanged function
- 757b6df: fix: changed colors of vector simulation and raster algorithm when hovering, expanding, and activating
- 0ec19f1: fix: changed primary color to secondary color for toggles of access level switch and global/region selector
- 1c6c8e9: fix: changed large buttons on landing page and data page to normal size. fixed button style in vector filter
- 7cdf6a8: fix: adjusted spaces between layer menu buttons
- 7a0c3ae: fix: improved the perfomance of loading for data tab at maps page. created new /api/menu endpoint to separate logic of dataset loading from +layout.server.ts
- 59f2876: fix: fixed bug of not showing search result of typed keywords when home breadcrumb
- 5cb4e2c: fix: remove deleted dataset's layers and source from saved map. hide "open" button if layers do not exist and show warning message.
- a410c53: fix: changed tabs in layer edit panel to UNDP tabs
- a869491: fix: remove layers from saved map style.json if signed/unsigned in user does not have permission to access to the dataset. In this case, a warning message is shown inside the layer accordion to tell users does not have permission to access.
- 3093151: fix: keep state of hiding global data checkbox in map view
- f600426: chore: update hooks.server.ts for the latest @auth/sveltekit version v0.12.X. created $lib/server/auth.ts for auth settings.
- 229a397: fix: skip if layer is not there in style.json when use query tool
- d8276d0: fix: make breadcrumbs size small
- be3c80d: fix: bug of when selecting continent in data tab.
- d8276d0: fix: put martin-bottom of title for each header of page 24px (mb-5)
- 608327a: fix: show map menu buttons on top-right always (not affected by the position of sidebar).
- ffe2b7f: fix: changed font weight of parameter title to semibold when it is expanded or activated
- 11afe80: fix: export algorithmId in RasterAlgorithms component to reinitialize layer correctly when algorithm is changed.

## 1.4.1

### Patch Changes

- 7d3c54c: chore: upgraded to maplibre v4 and pmtiles v3
- 1042b57: fix: add more margin and background-color for header in data page and map page.
- dfc07b3: fix: switched go back to previous page button to breadcrumbs for each page
- c066f24: fix: replace titiler endpoint in saved map to the server settings one to avoid connecting to the wrong titiler endpoint.

## 1.4.0

### Minor Changes

- cb76044: feat: add an accordion to switch titiler algorithm for raster dataset

### Patch Changes

- 6299e8a: fix: apply algorithm_params for simple raster legend
- 267408b: fix: typo
- 96f270c: fix: add terrarium and terrainrgb as raster-dem source and hillshade layer
- 522b251: fix: add title of "Authorized users" in permission table

## 1.3.0

### Minor Changes

- 51969a6: - feat: add GUI to set user permission for a dataset
  - feat: allows read permission users to invite other users as READ permission.
- fe6ff23: feat: add style permission endpoints to allow users to invite users to maps
- 5eac10e: feat: introduced tabs to a map page, and added GUI to edit map permissions. Also remember active tab state as hash at a dataset page and a map page
- 4dd25bc: feat: introduced tabs for a dataset page to organise components better

### Patch Changes

- 67ede73: fix: removed header and footer from all modals used in GeoHub. Also fixed z-index of modal to prevent background is shown under header.
- ea853be: fix: show all styles for superuser
- 712c573: fix: fixed bug of style api to edit maps with write/owner permission
- b5e53c4: fix: fixed bug of dataset permission when saving/deleting default style
- cd578bb: refactor: migrate to d3 histogram
- 7013f69: fix: since the dropdown menu in the dataset page was a little bit hidden, switched dropdown menu to buttons
- dd685e5: fix: fixed bug of datasets api SQL when users do not sign in

## 1.2.1

### Patch Changes

- 934dfc4: fix: not show minus (-) symbol for zero value in simulation feature
- 0219cfa: fix: redesigned vector simulation component layout.
- 3bb3f35: fix: adjusted hovered color for simulation
- af4220a: refactor: fix breaking changes that occur by migrating to new titiler version
- 22b822f: fix: improved new simulation component UI

## 1.2.0

### Minor Changes

- 6020fdf: feat: added /api/datasets{id}/permission endpoints to manage dataset permission for users. Fixed datasets search SQL to consider user access permission.

### Patch Changes

- 486caf8: fix: fixed bug which superuser cannot see private access datasets.
- 3fbd2d1: fix: Use DatasetPermissionManager to register owner permission for new dataset
- 613d989: fix: changed header's region text to capitalised and shorter subtitle
- ade69dc: fix: removed uncessary paddings from maplibre popup of query tool
- c7c91a1: fix: add readmore button in info tab to hide information as default. Also add dataset link button to copy the link to clipboard.
- 7b09c99: fix: created /api/datasets POST method to register/update dataset info. Call new API in dataset edit page.

## 1.1.1

### Patch Changes

- 1f47a34: fix: update layer edit contents between vector layers / raster layers.
- fde14c9: fix: unified the icon size and color for data tab/layer tab and style editor
- 3b0f019: fix: upgraded sveltekit to v2. fixed maplibre-gl imports for the SSR pages in GeoHub
- 4170285: fix: fixed tab from scrolling
- 8869dd3: fix: click the entire header to toggle layer editor and legend panel.
- d79557b: fix: add notification icon (!) to show data accesibility in data tab accordion if dataset is not public access.
- dc4161c: fix: improved colormap picker. add chevron icon button to show it is an action button to change colormap
- 3905a8e: fix: change hovering color to light gray for layer list. Moved padding to inside accordion
- 1dceac4: fix: add description for need admin approval error in sign in page
- ae621f8: feat: allow users to open layer editor with different layer without closing existing editor panel. Also, change border color for hovering layers and change background-color for selected layer to edit style.
- 5fbcbcd: refactor: move histogram to style editor
- ca3fa20: fix: removed icons from tabs, changed font-weight of tabs to bold
- dc4161c: fix: moved classification switch button to an independent selectbox to switch between linear colormap or advanced classification
- d8052ae: fix: replaced history.replaceState to goto method with replaceState parameter = true or replaceState from $app/navigation
- d2230e0: fix: fixed layout collapse for vector simulation component
- c7bb902: feat: moved data metadata menu to layer editor panel as a new tab 'info'. merged histogram tab to info tab
- 5fa4a6c: fix: pass '' to the second argument of replaceState
- 54dbb18: fix: delete style editor when clicking delete all layers button
- 88c268a: fix: add fontWeight prop in Tabs component, and removed semibold from tabs.
- 8869dd3: fix: click the entire header to toggle layer editor and legend panel.
- 384c741: fix: add same margin-left and margin-right for data tab, layer tab
- fdbdcec: fix: add AZURE_AD_B2C_APP_NAME variable in .env for B2C login settings
- b396ca8: fix: fixed bug of reinitialising raster layer style when layer editor is opened.
- ff3099f: fix: fixed font of layer panel. changed tab size for layer panel.
- 3f1bf2a: chore: update maplibre-gl-tour and tourguidejs versions
- 9b5d2b0: fix: unified table header font size for color/value classify
- 9a27ad6: fix: rename raster color accordion name from Colormap to Color. Also renamed the contents of type selectbox

## 1.1.0

### Minor Changes

- d5623c9: feat: separate layer style editing components from the main side bar, and open style editor for selected layer in another side of main layer panel.
- ed0a8ac: feat: introduced header component and map animation in background of sign in page. Improved the layout of sign in panel.
- b285df6: feat: switched UNDP Azure AD tp UNDP Azure B2C login

### Patch Changes

- 5bb47f2: fix: changed access level icon to just padlock icon
- a174cf3: fix: fixed bug of upsertUser at hooks.server.ts. it was moved to the root +layout.server.ts
- 50c05a8: fix: add a floating panel for default style editor on map to prevent layout collapse
- 44369ca: fix: fixed some bugs and refactored server side code for data tab
- 0c8ae77: fix: Update style json version to 1.2.1
- 09a4710: fix: await page data at +page.server.ts for /data page
- 931d4f2: fix: changed icons at header of layer list. Also, use tippyjs for tooltip for these buttons
- 7244ea4: fix: `extent.spatial.bbox` property contains multiple bboxes for some collection, use max extent combined from all extents in stac api explorer.
- 5bb47f2: fix: changed vertical three dot icon to horizontal dot icon for layer header.
- 06c66b7: fix: remove border-radius from bulma button to look like UNDP design button
- 98723ad: fix: trim and remove empty value from the unique value list in vector
- 0a8a202: fix: set sidebar border to none
- d991963: fix: removed @creativebulma/bulma-tooltip and switched tooltip to use tippyjs
- 160c931: fix: adjusted font size and paddings for icons and tabs in layer tab
- 98723ad: fix: merged classification method accordion to classify component (color and value, and raster one). To do this changes, added classificationMethod_2 in Layer object and same column name at dataset_defaultstyle table to store this property.
- 2bc4f96: fix: moved simulation tab to Style tab as an accordion.
- 160c931: fix: use fixed width for layer style panel (350px)
- 5bb47f2: fix: created VectorSimpleColorLegend for readonly use cases
- 6c77e3c: fix: changed default font size to 16px in data tab at /maps page
- e9c8651: fix: show unit (raster) and property name (vector) in the above of readonly color legend
- 5c20fcc: fix: moved is_superuser function from +hook.server.ts to +layout.server.ts (pages) and server.ts (API)
- db13edb: fix: removed letter-space from between initials in user account icon
- f254951: fix: use constant color of light grey for user icon without image. also moved upsertUser function to primaryHandle from authHandle
- fc17c92: fix: changed default font size from 13px to 16px
- 5bb47f2: fix: changed tab name from Legend to Style
- fc761bd: fix: switched accordion from svelte-undp-design to $components/util/Accordion
- 46d9703: fix: Postgres Function Layer will use source URL by changing function parameters, hence, if the dataset is Function layer, unique UUID is used as source ID. Otherwise, dataset ID is used to share with other layers
- f5ecc72: fix: switch sidebar to float panel for layer editing component
- 80006a0: fix: fixed Accordion component's layer name bug
- 485ffc9: fix: fixed position of user info popup
- 359cecc: fix: improved the design of layer header name and buttons. Show tooltip to describe what they are.
- 5bb47f2: fix: changed style edit button to palette. made button sizes become same in layer header
- e9c8651: fix: made layer buttons smaller (16px)

## 1.0.8

### Patch Changes

- 57b1292: fix: introduced accordion in simple legend for maps/{id} page, and add expand all/collapse all buttons.

## 1.0.7

### Patch Changes

- 82ff1d7: fix: removed icon from breadcrumbs
- 82ff1d7: fix: removed border from icons from data tab and layer tab and data page
- 29713d4: fix: adjusted layout for new sidebar toggle button. show map buttons on top-left if sidebar is shown in the right side
- 8255e46: fix: changed active and inactive border color of tabs in bulma

## 1.0.6

### Patch Changes

- 64bb3f2: feat: made readonly legend more simple
- 3a9442d: fix: fixed bug not to show border-bottom in simple legend
- 6f58fb7: fix: fixed bug of loading mosaicjson in some catalogs in JAXA dataset

## 1.0.5

### Patch Changes

- a9ed22f: fix: adjusted the layout of sidebar toggle button in responsive
- 23502e0: feat: add a feature to create mosaicjson for selected items from STAC Catalog collection
- d53a964: refactor: renamed /stac/{type} to /stac/{id}

## 1.0.4

### Patch Changes

- f5f744a: fix: fixed bug of checking STAC asset item type. it is preferred to use `image/tiff; application=geotiff; profile=cloud-optimized` to check asset type, but we found some of COG from some STAC server, they don't put `profile=cloud-optimized`. So I removed profile from validation. There might be normal GeoTiff coming from STAC server, but we can assume all GeoTiffs are cloud optiomised GeoTiff from STAC.
- 3dd2a23: fix: Use @undp-data/svelte-file-dropzone with fixed package.json

## 1.0.3

### Patch Changes

- 0246db7: fix: fixed bug of /datasets api. removed next link if it is the last page

## 1.0.2

### Patch Changes

- 95337ac: feat: improved sidebar toggle button to use arrow animation
- edeb710: fix: hide sort button if only a layer is added
- 8ec33e7: fix: moved maps/{id} page from (app) to (map) folder. and use +layout@.svelte for different layout from /maps & /maps{id}/edit pages
- f4b3273: fix: fixed bug for JAXA catalog dataset, and fixed URL of self for STAC datasets. also deleted invalid dataset link from stac cog/mosaicjson dataset feature object
- 8ec33e7: fix: show 404 error page if map id does not exist
- 75443ee: feat: improved sidebar UI to merge show/close button in sidebar itself. Disabled resizing sidebar feature to use fixed width to prevent layout collapse
- 6ad5e9b: fix: fixed zindex for map progress bar and refactored the code
- 52e954b: fix: fixed bug of layer header layout
- fd82cad: fix: switch /maps/id page to CSR

## 1.0.1

### Patch Changes

- 2293089: fix: moved hard coded STAC api/catalog setting to a table in database. /stac endpoints are now available to get/register/update/delete these api/catalogs.
- d49caaf: fix: remove localhost:5173 from geohub api sources in style POST/PUT methods.

## 1.0.0

### Major Changes

- b5dbbfb: [breadking change] the endpoint of `/map` was replaced with `/maps`.

  - Current `/map/{id}` page was changed to `/maps/{id}` page.
  - `/maps/{id}` page shows the preview and metadata of a community map.
  - `/maps` will be a blank edit page.
  - `/map/{id}` path name is redirected to `/maps/{id}`

### Minor Changes

- 98ae210: feat: replace @watergis/maplibre-gl-export to @undp-data/svelte-geohub-static-image-controls
- d61eaf1: feat: add staronly option in /style api
- d2f8a4d: feat: add readonly legend for preview map at /maps/{id} page

### Patch Changes

- d61eaf1: fix: bug of style search api for access level. added favourite button in home page
- ef30434: fix: use bulma's `help` to show file size warning
- 86e928e: fix: remove default attribution control from a map of /maps/{id} page
- 8857336: fix: fixed the link to maps page from /data/{id} page
- ab74986: refactor: switch layerList store from global variable to ContextAPI
- 078a202: fix: clear local storage if there is map style id in local storage at blank map page (/maps)
- 078a202: fix: align open button right at a map page. make buttons larger
- 078a202: fix: add MapQueryInfoControl at /maps/{id} page. To do this, exported layerList store as a prop other than importing global store variable
- bf7f9f3: fix: updated static image api plugin
- 60bc997: fix: fixed the layout of query tool popup
- 91bbde4: fix: add more padding-bottom in data tab

## 0.9.6

### Patch Changes

- 86fe073: fix: minor oversight
- 86fe073: fix cleanup upload, activate upload button when user removes some files and show file size warning in table

## 0.9.5

### Patch Changes

- 2b6085d: fix: enable upload of non-necessary shapefile extensions except `.atx`
- 4a308b8: fix: minor oversight

## 0.9.4

### Patch Changes

- f0d889f3: fix: refactor: Use new CopyToClipboard package in GeoHub

## 0.9.3

### Patch Changes

- c3c82402: fix: fixed several bugs in STAC catalog explorer. Furthermore, added list view.
- 11186525: fix: Updated menu plugin. Now xmark button on the map was moved into the top-right corner of sidebar container inside
- 7c1b851e: fix: add attribution for STAC catalog dataset if collection.providers property is missing

## 0.9.2

### Patch Changes

- 9df1bceb: fix: fixed bug of not showing home icon in breadcrumbs
- edb6babf: fix: reset state of hillshade layer visibility if basemap is changed
- b46e5806: fix: changed style.json version to v1.1.1 which did changes on hiding hillshade layer and waterway_label order.
- 3dc0ca5d: refactor: Use Card component for the home page
- fb5e67cd: fix: use bulma breadcrumbs in data tab in map page instead of UNDP design one
- b46e5806: refactor: created a util function to search first symbol layer in base style to control raster position
- cad82059: fix: fixed bug of default style edit page for raster unique value datasets

## 0.9.1

### Patch Changes

- 258916e5: fix: improved dataset table design in data page
- a6a3fef9: feat: add table view type setting in user setting page.
- 03d33882: fix: exclude viewType query param for dataset searching. fixed bug of go back to previous page button to include all params and hash
- 09787cc1: fix: use bulma table for the table at my data tab

## 0.9.0

### Minor Changes

- 5cd8b92b: feat: add Card view in data page
- 0a0bfc7c: feat: add a management page for STAC catalog

### Patch Changes

- 9d0361e9: fix: show just SDG number with circle and color instead of SDG logo in dataset table. If SDGs are more than three, it will show ... to popup
- 55b641c6: fix: show loader in CardWithImage
- 1db5fcd1: fix: add loader while loading stac item in Stac catalog explorer
- 029b2f99: fix: adjust the layout of SDG circle mark for public dataset table
- 70228999: fix: minimise access to api in preview endpoint

## 0.8.1

### Patch Changes

- 1175a321: chore: updated style switcher control to new version
- 30069fde: fix: improve geohub error page design

## 0.8.0

### Minor Changes

- 996f85fb: feat: redesign label tab. Some minor settings were moved to property editor. In addition, color classification and font selector are now available for label styling.
- 97004232: feat: add satallite navigation menu at home page and satellite toggle at data page.

### Patch Changes

- 67beb444: fix: remove non-necessary files
- eaebb8fb: fix: show errors correction when file selections are rejected
- 324fbe22: fix: show created_user correctly in dataset edit page
- 97004232: fix: added set default style menu for published dataset at my data tab in data page.
- c96dc484: feat: added progress bar in map
- 9efad00e: fix: removed margin-right from property select component
- 234b2f1c: fix: restore state for raster simple expression
- f85ca445: fix: show loader at the siderbar while preparing to load the data from either local storage or dataabase
- 21726726: fix: show community maps correctly in different responsive mode (desktop, tablet and mobile)
- b4cc3554: fix: chagned placement from right to auto for property editor

## 0.7.3

### Patch Changes

- 8ccf64dc: fix: fixed bug of color legend bug
- bb48df2f: fix: improve tabs styling
- 1ab0b927: fix: show default value of expression correctly in both interval and unique value legend in vector layer.
- 11c2cb33: fix: fixed table header against scrolling for legend table
- 4ee2885b: fix: tab behaviour
- dab2f1bb: fix: fix behaviour of scroll bar
- 98344086: fix: toggle layer content by clicking the entire layer header

## 0.7.2

### Patch Changes

- 7a7711eb: fix: improve the styles for tabs in the VectorLayer and RasterLayer component
  feat: added Tabs.svelte component

## 0.7.1

### Patch Changes

- 791e4bc4: fix: fixes bug of #2265 for AccessLevelSwitcher when users do not sign in
- c34ef743: fix: fixed bug of IconImage component when default color variable is undefined
- 0ee321db: refactor: Use ContextAPI/store for defaultColor prop for vector style components
- 0e8ca135: refactor: Use context api with store for header height
- 791e4bc4: fix: bug of not switching colormap in RasterLegend

## 0.7.0

### Minor Changes

- 45246076: feat: expand/collapse all buttons are added to the layer tab header, and the state of layer toggle is now remembered in localstorage and saved style.
- 1fd8ae29: feat: add show only this layer menu in the dropdown

### Patch Changes

- 86559035: feat: merged RasterDeaultLegend and RasterClassifyLegend to a component. In additon, put number of classes at the right side of colormap picker in VectorColorClassification.
- b33b0087: refactor: Use hidden prop to switch tabs in VectorLayer and RasterLayer to avoid rerendering tab content all the time
- 8308f624: fix: adjust desigin of layer header and tabs
- ce51272e: fix: improved the design of layer content layout
- 52e1d618: fix: change line width tab icon

## 0.6.1

### Patch Changes

- 626ee6dc: chore: updated dependencies for packages and geohub repo

## 0.6.0

### Minor Changes

- 0d77aa20: feat: add new layer type of `fill-extrusion` to support 3D polygon visualisation by color and height with selected property
- 285bf0ec: feat: added Default pitch setting for 3D polygon. It will automatically tile the map by the setting when user add 3D polygon layer to the map
- 0d77aa20: feat: add circle-color classification
- 13dae921: feat: Use new Vector classificaiton component for `icon-size` and `line-width`. Now two properties of color and size/width can be used for visualisation of symbol and line. Due to this change, new tabs were introduced to switch either color or size other than using default/classify tabs.

### Patch Changes

- 0511c706: fix: restore custom color correctly in VectorColorClassification legend
- d42a1ca9: fix: sync icon-color in icon tab if user changed the color
- 345cd5d7: - fix: set logarithmic if the vector layer property has highly skewed values. created a helper function to check highly skewed (`checkVectorLayerHighlySkewed`).
  - fix: set random color if the defaultColor variable is undefined when the propoerty is changed in ColorClassification component.
  - refactor: removed code for fill from VectorClassifyLegend.
- 1c195153: refactor: changed NumberInput design by transfering from NumberIncrementDecrement
- 45dab650: fix: adjust colorpicker width in color classification component
- cae720fd: feat: User new color classification component for fill layer type. If layer style uses deprecated function, the component will transoform from function to expression
- 72f73e9d: did sevral bug fixes and refactoring as follows

  - fix: Use classification method component in raster legend
  - fix: relayout raster classify legend
  - refactor: moved classification method under Data Related accordion, and also moved it to popup for raster classify legend
  - refactor: apply same layout to VectorClassifyLgend

- c6c8a67f: fix: fixed bug of POST/DELETE endpoints to save/delete style

## 0.5.0

### Minor Changes

- 209e8005: feat: add suport of simple circle layer for point data.
- e853fad7: - feat: add dataset stats in home page. `/api/datasets/stats` was added to compute dataset stas.
  - fix: hide community maps stats as default. To show map stats, use `mapstats=true` query param at home page.
  - fix: adjast some layout of home page.

### Patch Changes

- ade785c2: fix: show correct names in table and fix: upload page responsiveness
- 3af21a35: fix: removed RasterBandSelector from raster property popup and added it at the preview in data tab and data page
- 0422173e: fix: use checkbox for merge vectortiles selection in settings page
- c02fb072: feat: group properties in raster/vector popup by accordion (Data or Appearance)
- f5e8e1e1: fix: fixed bug of not showing default style edit page for RGB true color raster dataset
- 02cf39ed: fix: use different button for cancel and remove
- c06ed74d: fix: prevent upload when cancel is pressed before uploadFile function is called
- e2f1f673: fix: changed radio button to select box for layer type switcher
- b2368f16: feat: add min/max and unit label at the below of colormap picker button in raster default legend
- 9ba412cf: fix: created /api/datasets/style/{layer}/{type} endpoint to create default layer style for the dataset which is not registered yet
- 3d36c97d: refactor: moved LegendColorMapRow and LegendTypeSwitcher to maplibre folder

## 0.4.5

### Patch Changes

- cca8098e: feat: add help message for raster and vector property editor. Also changed slider to select box for icon overlap property
- 7e37c1f9: fix: removed overlapped x axis label from histogram.
- ea2ed0a1: refactor: moved raster histogram feature to layer drop down menu
- ea2ed0a1: fix: hide raster band selector for RGB raster layer

## 0.4.4

### Patch Changes

- 8f9ef132: fix: fixes data table flickering when my data page is reloaded
- 7d80e994: refactor: Moved logic of layer style creation from client to server side endpoints

  - basically moved the logic of layer creation from RasterTileData and VectorTileData to the endpoint of `/api/datasets/{id}/style/{{layer}/{type}`
  - for STAC COG Item, `/stac/style/[type]/[colleciton]/[...item]/[asset]` was added to compute layer style
  - merged MosaicJsonData class to RasterDefaultStyleClass and RasterTileData
  - previously, layer style was created repeatedly without reusing preview data in MiniMap component, now layer can be added by reusing the result of MiniMap.

## 0.4.3

### Patch Changes

- 5c76ab93: refactor: redesign upload page

## 0.4.2

### Patch Changes

- adcb288c: fix: redirection of users when all uploads are cancelled

## 0.4.1

### Patch Changes

- 0b1c8380: refactor: use goto in upload button
- 4168257c: fix: update current zoom when map extent is changed in STAC explorer.
- 2b02512c: fix: bug of not updating ingesting dataset count in my data tab in data page
- 29a82ab1: fix: use goto method of sveltekit for go back to previous page button

## 0.4.0

### Minor Changes

- 3afb056a: feat: data upload cancellation
- 9b3ee698: feat: moved some vector legend properties to properties editer popup. Layout of vector legend was changed due to this change.
- 8d453243: feat: added goback to previous page button in other pages
- 2901bfcc: feat: allow superusers to update or delete saved map created by other users.

### Patch Changes

- 9b3ee698: refactor: moved opacity tab to property editor popup
- d7862012: fix: represent selected shapefiles as single file with no extension and show selected files in the files as tags
- 27b4ebe5: fix: Missing file extension error of shapefile
- c2189686: refactor: Use bulma's tab and close icon css for ColorMapPicker, IconImagePicker and DataCardInfoMenu
- 345f57a8: fix: skip updating dataset properties if the dataset feature does not exist at /api/style endpoint
- 58195040: feat: improved the layout of supported format page
- 8d453243: fix: changed endpoint of data/publish to data/{id}/edit

## 0.3.0

### Minor Changes

- 1f7b49f3: feat: add a feature to reverse colormap's colors in ColorMapPicker

## 0.2.0

### Minor Changes

- b57b5563: refactor: upload multiple files cocurrently

### Patch Changes

- fc653cf5: fix: fixed bahaviour of STAC Explorer. Set MaxZoom and MaxBounds in the explorer, and fixed some behaviours when parameters are changed.
  fix: [BREAKING CHANGE]fixed mosaicjson path like https://undpngddlsgeohubdev01.blob.core.windows.net/mosaicjson/microsoft-pc/sentinel-2-l2a/S2A_MSIL2A_20230714T072621_R049_T37MDP_20230714T145720/S2B_MSIL2A_20230907T072619_R049_T37MEP_20230907T152656/mosaicjson.json (microsoft-pc/{collection id}/{...item}/mosaicjson.json)
- 9fa33c72: fix: Use server endpoint if saved style source URL origin is different from current server (for pg_tileserv source).

## 0.1.0

### Minor Changes

- cb008f50: feat: Added multiple files upload
  feat: Added supported formats page"
- d5641601: feat: saving & restoring default layer style for vector datasets
- cfbadc56: feat: show the number of datasets in tabs at data page.
- e989e06b: feat: improved the layout of publish page by introducing tabs.
- 0b3105df: - feat: added CountryPicker in data page
  - fixed several bugs related to country picker in publish page
  - fixed filckering in SDG picker and country picker
- c04f6296: feat: add default layer style editing feature for raster dataset
- 9ec9dc9c: feat: implemented new endpoints (`/api/datasets/{id}/style/{layer}/{type}`) to fetch, register and delete default layer style for a dataset.
- be6815f4: feat: add date filter feature in STAC explorer. New date filter setting is also available in settings page.

### Patch Changes

- adbda0f9: feat: add default style edit page link in data page operation menu
- e391895d: refactor: make sdgPicker component simpler.
- 63817d3f: fix: only show user icon in header
- d6d70f41: doc: add new default style endpoint in swagger (WIP)
- 478f8fc8: fix: now VectorClassifyLegend was added to default layer style edit page
- 406aefd2: feat: moved SDG/region selector component from data page to home page
- dc90f2fb: refactor: use DefaultLink component in data/[id] page
- 6f23518d: fix: fixed bug of resetting SAS token for Microsoft Planetary Computer in saved maplibre style source
- 8479b70d: fix: removed edit page link from dataset operation menu
- 654b9af9: doc: add new table to manage default style for each dataset in ERD.
- 9a24d162: refactor: add open DefaultLink in new tabs
- a6e2781c: fix: selection button not creating selectFile upload bug
- fea98a97: feat: redesigned top contents of home page to be clearer for users. Animation arrow is added to show the home page is scrollable.
- 43354fe0: refactor: minor redesign of upload page
  refactor: minor redesign of supported formats page
- 083b4ed6: fix: avoid accessing $page store inside <svelte:head> in server side. Moved some variables to load function in +layout.server.ts
- 321919ff: fix: add static image api link in footer
- 4982eb35: fix: removed Default legend if the raster layer is unique value type
- 127c7922: feat: migrate rescale slider to raster properties editor popup. Now rescale can work even in raster ClassifyLegend
- e19f1942: fix: add validation of single filenames
- 23285852: fix: removed color map name from colormap picker

## 0.0.3

### Patch Changes

- 6af41390: first changeset version release
