<script context="module">
    export const load = async({fetch}) => {
        const res = await fetch("list_blobs_in_container.json")

        const tree = await res.json()
        console.log("Data", tree)
        return {
           props: {
               tree
           }
        }
    }
</script>

<script lang="ts">
    import TreeView from './TreeView.svelte'
    //import tree from './tree'
    export let tree
</script>

<div>
<!--    <select class="select-data">-->
<!--        {#each data as d}-->
<!--        <option class="data-option">{d}</option>-->
<!--        {/each}-->
<!--    </select>-->
    <TreeView {tree}/>

    <!--<div>{data.children}</div>-->
</div>
<style>
    .select-data{
        height: 40px;
    }
    .data-option{
        font-size: larger;
        font-family: sans-serif;
        background-color: white;
        color: cadetblue;
        font-style: italic;
    }
</style>