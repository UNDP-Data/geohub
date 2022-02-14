<script>
    import { getContext } from 'svelte';
    import { TABS } from './Tabs.svelte';

    const tab = {};
    const { registerTab, selectTab, selectedTab } = getContext(TABS);

    registerTab(tab);
</script>

<style>
    button {
        background: none;
        border: none;
        border-bottom: 2px solid white;
        border-radius: 0;
        margin-left: 10px;
        color: #ccc;
        width: auto;
        font-weight: bold;
        /* font-size: larger; */
        
    }
    button {
        transition-duration: 0.4s;
    }

    button:hover {
        
        cursor: pointer;
    }

    .selected {
        border-bottom: 2px solid dodgerblue;
        color: dodgerblue;
        cursor: pointer;
    }

</style>

<button class:selected="{$selectedTab === tab}" on:click="{() => selectTab(tab)}">
    <slot></slot>
</button>