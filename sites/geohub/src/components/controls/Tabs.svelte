<script lang="ts">
  import { TabNames } from '$lib/constants'
  import type { Tab } from '$lib/types'
  import { layerList } from '$stores'

  export let tabs: Tab[]

  export let activeTab: string

  export let height: number = undefined
  export let tabPaddingLeft = 50
  export let fontSize: 'medium' | 'small' = 'medium'
  export let isToggleTab = false

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

<div
  class="tabs-undp inviewport"
  data-viewport="true"
  bind:clientHeight={height}>
  <ul
    style="padding-left: {tabPaddingLeft}px"
    data-deep-link="true"
    data-tabs="true"
    id="tablist_1"
    role="tablist">
    {#each tabs as tab}
      <li
        class="tabs-title {`${activeTab && activeTab === tab.label ? 'is-active' : ''}`} px-1"
        role="presentation">
        <a
          aria-selected="true"
          role="tab"
          aria-controls="tab-{tab.label}"
          id="tab-{tab.label}"
          tabindex={Number(`${activeTab && activeTab === tab.label ? '0' : '-1'}`)}
          on:keydown={handleKeyDown}
          on:click={() => {
            if (isToggleTab && activeTab === tab.label) {
              activeTab = undefined
            } else {
              activeTab = tab.label
            }
          }}>
          <span class="icon-text {fontSize === 'small' ? 'is-size-7' : 'is-size-6'}">
            {#if tab.icon}
              <span class="icon">
                <i class={tab.icon} />
              </span>
            {/if}
            <span>
              {tab.label}
              {#if tab.label === TabNames.LAYERS && $layerList.length > 0}
                ({$layerList.length})
              {/if}
            </span>
          </span>
        </a>
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/tab.min.css';

  .tabs-undp li {
    margin-right: auto !important;
    a {
      text-transform: capitalize;
    }
  }
</style>
