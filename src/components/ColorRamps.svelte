<script lang="ts">
import { createTheme } from '@mui/material/styles';
import LayoutGrid, { Cell } from '@smui/layout-grid';

import colormap from "colormap"
import ltype from "./Layer.svelte"

let selectedReds = false;
let selectedBlues = false;

let colors = colormap({
    colormap: 'jet',
    nshades: 10,
    format: 'hex',
    alpha: 1
})

</script>

<div class="color-ramps">
    <h6>Pick Coloramp</h6>
    <div class="reds">
        <table on:click={() => {selectedReds = !selectedBlues; selectedBlues = false } } class={selectedReds ? "selected-colors":"unselected-colors"} cellpadding="4" cellspacing="0" align="left">
            <tr>
                {#each colors as color}
                <td bgcolor={color}>&nbsp;</td>
                {/each}
            </tr>
        </table>
    </div>
</div>
<!--Todo: Only One selection is supposed to be there
Only one selected element should only exist and all others should not-->
<style>

    
    .gradient-button-1 {background-image: linear-gradient(to right, #DD5E89 0%, #F7BB97 51%, #DD5E89 100%)}

    .reds{
        /*border: 1px solid #B10B2A;*/
        margin-left: 20px;
        width: 80%;
        cursor: pointer;
    }
    .blues{
        margin-left: 20px;
        width: 80%;
        cursor: pointer;
    }
    .color-ramps{
        display: block;
        /*height: 100%;*/
        margin-top: 5%;
    }

    .selected-colors{
        border: 3px solid crimson;
        cursor: pointer;
        background: blue;
        margin-top: 2%;
    }

    .unselected-colors{
        border: 1px solid crimson;
        cursor: pointer;
        margin-top: 2%;
    }
</style>