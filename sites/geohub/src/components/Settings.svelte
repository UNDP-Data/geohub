<script lang="ts">
  import { enhance } from '$app/forms'
  import {
    DatasetSortingColumns,
    MapSortingColumns,
    NumberOfClassesMaximum,
    NumberOfClassesMinimum,
    LimitOptions,
  } from '$lib/config/AppConfig'
  import { toast } from '@zerodevx/svelte-toast'
  import { page } from '$app/stores'

  let userSettings = $page.data.config
  let isSubmitting = false
  let sideBarPosition = userSettings.SidebarPosition || 'left'
  let isExpanded = true
  let activeSettingTab = 'Map'

  export let headerHeight: number

  const collapseMiniMenu = () => {
    isExpanded = !isExpanded
  }
</script>

<div
  class="columns is-one-quarter ml-auto mr-auto settings-page"
  style="margin-top: {headerHeight}px;">
  <div class="column is-2">
    <aside class="menu">
      <ul class="menu-list">
        <li>
          <a
            on:click={collapseMiniMenu}
            href="#">GeoHub Settings</a>
          <ul style="display: {!isExpanded ? 'none' : ''}">
            <li>
              <a
                class={activeSettingTab === 'Map' ? 'selected' : ''}
                on:click={() => (activeSettingTab = 'Map')}
                href="#">Map Settings</a>
            </li>
            <li>
              <a
                class={activeSettingTab === 'Search' ? 'selected' : ''}
                on:click={() => (activeSettingTab = 'Search')}
                href="#">Search Settings</a>
            </li>
            <li>
              <a
                class={activeSettingTab === 'Legend' ? 'selected' : ''}
                on:click={() => (activeSettingTab = 'Legend')}
                href="#">Legend Settings</a>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  </div>
  <div class="column is-two-fifths m-auto">
    <form
      action="?/save"
      method="post"
      use:enhance={() => {
        isSubmitting = true
        return async ({ result }) => {
          if (result.status === 200) {
            toast.push('Settings saved successfully!!')
          } else {
            toast.push('Error saving settings!!')
          }
          isSubmitting = false
        }
      }}>
      <section
        class="content {activeSettingTab !== 'Map' ? 'is-hidden' : ''}"
        id="Geohub">
        <h1 class="title">Map Settings</h1>
        <div class="field">
          <label class="label">Sidebar Position</label>
          <div class="columns">
            <label class="column">
              <input
                on:select={() => userSettings.SidebarPosition === 'left'}
                type="radio"
                name="SidebarPosition"
                value="left"
                checked={sideBarPosition === 'left'} />
              <img
                class="sidebar-image"
                src="/assets/sidebar/left-sidebar.png"
                alt="left sidebar" />
            </label>
            <label class="column">
              <input
                on:select={() => userSettings.SidebarPosition === 'right'}
                type="radio"
                name="SidebarPosition"
                value="right"
                checked={sideBarPosition === 'right'} />
              <img
                class="sidebar-image"
                src="/assets/sidebar/right-sidebar.png"
                alt="right sidebar" />
            </label>
          </div>
          <p class="help is-info">Select sidebar position</p>
        </div>
      </section>
      <section
        class="content {activeSettingTab !== 'Search' ? 'is-hidden' : ''}"
        id="Search">
        <h1 class="title">Search Settings</h1>
        <div class="field">
          <label class="label">Search Limit</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="SearchLimit"
                bind:value={userSettings.SearchLimit}>
                {#each LimitOptions as limit}
                  <option value={limit.toString()}>{limit}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Dataset Search Limit</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="DatasetSearchLimit"
                bind:value={userSettings.DatasetSearchLimit}>
                {#each LimitOptions as limit}
                  <option value={limit.toString()}>{limit}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Dataset Query Operator</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="DatasetSearchQueryOperator"
                bind:value={userSettings.DatasetSearchQueryOperator}>
                {#each ['or', 'and'] as operator}
                  <option value={operator}>{operator}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Dataset Sorting Column</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="DatasetSortingColumn"
                bind:value={userSettings.DatasetSortingColumn}>
                {#each DatasetSortingColumns as column}
                  <option value={column.value}>{column.label}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Datapage Sorting Column</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="DataPageSortingColumn"
                bind:value={userSettings.DataPageSortingColumn}>
                {#each DatasetSortingColumns as column}
                  <option value={column.value}>{column.label}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Map Page Sorting Columns</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="MapPageSortingColumn"
                bind:value={userSettings.MapPageSortingColumn}>
                {#each MapSortingColumns as column}
                  <option value={column.value}>{column.label}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Tag Search Operator</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select
                name="TagSearchOperator"
                bind:value={userSettings.TagSearchOperator}>
                {#each ['or', 'and'] as column}
                  <option value={column}>{column}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </section>
      <section class="content {activeSettingTab !== 'Legend' ? 'is-hidden' : ''}">
        <h1 class="title">Legend Settings</h1>
        <div class="field">
          <label class="label">Number of Classes</label>
          <div class="control">
            <input
              name="NumberOfClasses"
              bind:value={userSettings.NumberOfClasses}
              class="input"
              type="number"
              placeholder="Number of Classes"
              min={NumberOfClassesMinimum}
              max={NumberOfClassesMaximum} />
          </div>
        </div>
        <div class="field">
          <label class="label">Line Width</label>
          <div class="control">
            <input
              name="LineWidth"
              value={userSettings.LineWidth}
              class="input"
              type="number"
              placeholder="Line Width"
              min="0"
              max="10"
              step="0.5" />
          </div>
        </div>
      </section>
      <div class="field">
        <button
          formaction="settings"
          type="submit"
          class="button is-primary {isSubmitting ? 'is-loading' : ''}">Submit</button>
      </div>
    </form>
  </div>
</div>

<style lang="scss">
  .content {
    padding: 1rem;
  }
  .content.is-hidden:not(:first-of-type) {
    display: none;
  }
  .menu-list li {
    margin-bottom: 0.5rem;
  }
  .menu-list a.selected {
    background-color: #3273dc;
    color: white;
  }
  .menu-list a {
    cursor: pointer;
  }

  .card {
    z-index: -1;
  }

  .sidebar-col:hover {
    cursor: pointer;
  }

  .selected-sidebar {
    border: 2px solid #3273dc;
  }

  [type='radio'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  [type='radio'] + img {
    cursor: pointer;
  }

  [type='radio']:checked + img {
    outline: 2px solid #f00;
  }

  .sidebar-image {
    box-shadow: #0a0a0a 0 0 2px 0;
  }
</style>
