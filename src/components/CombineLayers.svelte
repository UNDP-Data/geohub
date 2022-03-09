<script>
    // Inspired by https://svelte.dev/repl/810b0f1e16ac4bbd8af8ba25d5e0deff?version=3.4.2.
    import {flip} from 'svelte/animate';
    import { dynamicLayers, layerList } from "../stores/stores"

    // Create a similar list from the selectedLayerList store
    let layers = $layerList.filter((l) => $dynamicLayers.indexOf(l.lDef.id)>-1)

    layers.forEach((layer)=>console.log(layer))
</script>

<p>Drag a fruit from one basket to another.</p>
<div>
    <ul>
        {#each layers as layer}
            <li>{layer.lName}</li>
        {/each}
    </ul>
</div>