<script lang="ts">
  import { TabNames } from '$lib/constants'
  import { layerList } from '$stores'
  import Tab from '@smui/tab/src/Tab.svelte'

  export let tabs
  export let activeTab: string
  let eventsEnabled = false

  const onKeyDown1 = (e) => {
    const cond = (element) => element.label == activeTab
    const activeIndex = tabs.findIndex(cond)

    if (eventsEnabled) {
      if (e.keyCode == 39 && activeIndex < 2) {
        activeTab = tabs[activeIndex + 1].label

        document.getElementById(`tab-${activeIndex + 1}`).focus()
      }
      if (e.keyCode == 39 && activeIndex == 2) {
        activeTab = tabs[0].label
      }

      if (e.keyCode == 37 && activeIndex > 0) {
        activeTab = tabs[activeIndex - 1].label

        document.getElementById(`tab-${activeIndex - 1}`).focus()
      }
      if (e.keyCode == 37 && activeIndex == 0) {
        activeTab = tabs[tabs.length - 1].label
      }
      let nindex
      if (e.keyCode == 39) {
        nindex = activeIndex + 1
      } else if (e.keyCode == 37) {
        nindex = activeIndex - 1
      }
      console.log(e.keyCode, activeIndex, nindex % 3)
    }
  }

  const onKeyDown = (e) => {
    const cond = (element) => element.label === activeTab
    const activeIndex = tabs.findIndex(cond)

    if (eventsEnabled) {
      let nindex

      if (e.keyCode == 39) {
        nindex = (activeIndex + 1) % tabs.length
        activeTab = tabs[nindex].label
        document.getElementById(`tab-${nindex}`).focus()
      }

      if (e.keyCode == 37) {
        const nindex1 = (-activeIndex + 1) % tabs.length
        nindex = (3 - nindex1) % 3
        activeTab = tabs[nindex].label
        document.getElementById(`tab-${nindex}`).focus()
      }

      //console.log(activeIndex, nindex)
    }
  }
  const onFocusIn = () => {
    eventsEnabled = true
    //console.log('START LISTENING TO KEYBOARD')
  }
  const onFocusOut = () => {
    eventsEnabled = false
    //console.log('STOP LISTENING TO KEYBOARD')
  }
</script>

<div class="tabs" style="margin-top: 20px;" role="navigation" title="navigation" aria-label="navigation">
  <ul style="border-bottom: none" data-deep-link="true" data-tabs="true" id="tablist" role="tablist">
    {#each tabs as tab, i}
      <li class="tabs-title {tab.label === activeTab ? 'active-tab' : null}">
        <a
          on:focusin={onFocusIn}
          on:focusout={onFocusOut}
          on:click={() => (activeTab = tab.label)}
          href="#{tab.label}"
          aria-selected="true"
          role="tab"
          aria-controls="tab{i}"
          id="tab-{i}"
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

<svelte:window on:keydown={onKeyDown} />

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
