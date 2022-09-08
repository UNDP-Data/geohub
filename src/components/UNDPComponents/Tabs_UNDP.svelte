<script lang="ts">
  import { TabNames } from '$lib/constants'
  import { layerList } from '$stores'
  import Tab from '@smui/tab/src/Tab.svelte'

  export let tabs
  export let activeTab: string
  let eventsEnabled = false

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      setLeftActiveTab(activeTab)
    }
    if (event.key === 'ArrowRight') {
      setRightActiveTab(activeTab)
    }
  }

  const setLeftActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab)
    const nextTabIndex = currentTabIndex - 1
    if (nextTabIndex < 0) {
      activeTab = tabs[tabs.length - 1].label
      document.getElementById(`tab-${activeTab}`)?.focus()
    } else {
      activeTab = tabs[nextTabIndex].label
      document.getElementById(`tab-${activeTab}`)?.focus()
    }
  }

  const setRightActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab)
    const nextTabIndex = currentTabIndex + 1
    const nextTab = tabs[nextTabIndex]
    if (nextTab) {
      activeTab = nextTab.label
      document.getElementById(`tab-${activeTab}`)?.focus()
    } else {
      activeTab = tabs[0].label
      document.getElementById(`tab-${activeTab}`)?.focus()
    }
  }
</script>

<div class="tabs" style="margin-top: 20px;" role="navigation" title="navigation" aria-label="navigation">
  <ul style="border-bottom: none; margin-left: auto" data-deep-link="true" data-tabs="true" id="tablist" role="tablist">
    {#each tabs as tab, i}
      <li class="tabs-title {tab.label === activeTab ? 'active-tab' : null}">
        <a
          on:keydown={handleKeyDown}
          on:click={() => (activeTab = tab.label)}
          href="#{tab.label}"
          aria-selected="true"
          role="tab"
          aria-controls="tab{i}"
          id="tab-{tab.label}"
          tabindex={i + 2}
          >{tab.label}
          {#if tab.label === TabNames.LAYERS && $layerList.length > 0}
            ({$layerList.length})
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</div>

<!--<svelte:window on:keydown={onKeyDown} />-->
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
