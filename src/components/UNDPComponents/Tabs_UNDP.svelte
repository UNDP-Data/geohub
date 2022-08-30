<script lang="ts">
  import { TabNames } from '$lib/constants'
  import { layerList } from '$stores'
  import Fa from 'svelte-fa'

  export let tabs
  export let activeTab: string
</script>

<div class="tabs" style="margin-top: 20px;">
  <ul style="border-bottom: none" data-deep-link="true" data-tabs="true" id="tablist_1" role="tablist">
    {#each tabs as tab}
      <li class="tabs-title {tab.label === activeTab ? 'active-tab' : null}">
        <a on:click={() => (activeTab = tab.label)} href="#{tab.label}" aria-selected="true"
          >{tab.label}
          {#if tab.label === TabNames.LAYERS && $layerList.length > 0}
            ({$layerList.length})
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  //@import '../../styles/undp-design/fonts.css';
  $dark-red: #d12800;
  $dark-azure: #00c1ff;
  $gray-700: #232e3d;
  .tabs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin-top: 0 !important;
    width: 100%;
    height: 100%;
  }
  .tabs-title {
    a {
      border-bottom: none !important;
      font-weight: bold;
      text-transform: uppercase;
      color: $gray-700;
      font-size: 1rem;
      font-family: ProximaNova, sans-serif;
    }
  }
  .active-tab {
    border-bottom: 2px solid $dark-red;
    color: white;
  }
</style>
