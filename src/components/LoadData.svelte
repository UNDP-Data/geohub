

<script lang=ts>
console.log('clienet on Loaddata')
import {wtree}  from '../stores/stores'
import TreeView from './TreeView.svelte'

export let tree = $wtree;

</script>

<div >
    <dynamic progress bar indicator>what</dynamic>
    <TreeView tree={$wtree.tree} />
</div>

<style id="load-data-div">
    #load-data-div{
        margin-top: 10px;
    }
</style>