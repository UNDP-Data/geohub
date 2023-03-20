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
  import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig'
  import { invalidateAll } from '$app/navigation'
  import type { SidebarPosition } from '$lib/types'
  import RangeSlider from 'svelte-range-slider-pips'
  import FieldControl from './controls/FieldControl.svelte'

  let userSettings: UserConfig = $page.data.config
  let isSubmitting = false
  let sideBarPosition: SidebarPosition = userSettings.SidebarPosition || 'left'
  let lineWidth = [userSettings.LineWidth]
  let numberOfClasses = [userSettings.NumberOfClasses]
  let isExpanded = true
  let activeSettingTab = 'Map'

  const DatasetLimitOptions = LimitOptions.includes(DefaultUserConfig.DatasetSearchLimit)
    ? LimitOptions
    : [...LimitOptions, DefaultUserConfig.DatasetSearchLimit].sort((a, b) => a - b)

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
            await invalidateAll()
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

        <FieldControl title="Sidebar Position">
          <div slot="help">Select sidebar position of main GeoHub page.</div>
          <div slot="control">
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
          </div>
        </FieldControl>
      </section>
      <section
        class="content {activeSettingTab !== 'Search' ? 'is-hidden' : ''}"
        id="Search">
        <h1 class="title">Search Settings</h1>

        <FieldControl title="Default search Limit in data and maps page">
          <div slot="help">The number of items to search at data page and maps page</div>
          <div slot="control">
            <div class="select is-fullwidth">
              <select
                name="SearchLimit"
                bind:value={userSettings.SearchLimit}>
                {#each LimitOptions as limit}
                  <option value={limit}>{limit}</option>
                {/each}
              </select>
            </div>
          </div>
        </FieldControl>

        <FieldControl title="Default search Limit in main GeoHub page">
          <div slot="help">The number of items to search at data tab in main GeoHub page.</div>
          <div slot="control">
            <div class="select is-fullwidth">
              <select
                name="DatasetSearchLimit"
                bind:value={userSettings.DatasetSearchLimit}>
                {#each DatasetLimitOptions as limit}
                  <option value={limit}>{limit}</option>
                {/each}
              </select>
            </div>
          </div>
        </FieldControl>

        <FieldControl title="Default search query operator in main GeoHub page">
          <div slot="help">
            Change searching operator to either 'AND' or 'OR'. 'AND' enables you to search datasets which exactly match
            all keyword. 'OR' allows you to search wider range of results by matching at least a word.
          </div>
          <div slot="control">
            <div class="select is-fullwidth">
              <select
                name="DatasetSearchQueryOperator"
                bind:value={userSettings.DatasetSearchQueryOperator}>
                {#each ['and', 'or'] as operator}
                  <option value={operator}>
                    {#if operator === 'and'}
                      Match all words typed (AND)
                    {:else}
                      Match at least a word typed (OR)
                    {/if}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </FieldControl>

        <FieldControl title="Default sort setting in main GeoHub page">
          <div slot="help">Change sort setting for the search result on datasets.</div>
          <div slot="control">
            <div class="select is-fullwidth">
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
        </FieldControl>

        <FieldControl title="Defaut tag search operator in main GeoHub page & data page">
          <div slot="help">
            Change searching operator for tag filter to either 'AND' or 'OR'. 'AND' enables you to search datasets which
            exactly match all tags you selected. 'OR' allows you to search wider range of results by matching at least a
            tag selected.
          </div>
          <div slot="control">
            <div class="select is-fullwidth">
              <select
                name="TagSearchOperator"
                bind:value={userSettings.TagSearchOperator}>
                {#each ['and', 'or'] as operator}
                  <option value={operator}>
                    {#if operator === 'and'}
                      Match all selected tags (AND)
                    {:else}
                      Match at least a tag selected (OR)
                    {/if}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </FieldControl>

        <FieldControl title="Default sort setting in Data page">
          <div slot="help">Change sort setting for the search result on datasets.</div>
          <div slot="control">
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
        </FieldControl>

        <FieldControl title="Default sort setting in Maps page">
          <div slot="help">Change sort setting for the search result on datasets.</div>
          <div slot="control">
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
        </FieldControl>
      </section>

      <section class="content {activeSettingTab !== 'Legend' ? 'is-hidden' : ''}">
        <h1 class="title">Legend Settings</h1>

        <FieldControl title="Default number of classes">
          <div slot="help">The default number of classes in classify legend for vector layer and raster layer</div>
          <div slot="control">
            <div class="control">
              <RangeSlider
                bind:values={numberOfClasses}
                float
                min={NumberOfClassesMinimum}
                max={NumberOfClassesMaximum}
                step={1}
                pips
                first="label"
                last="label"
                rest={false} />
            </div>
          </div>
        </FieldControl>

        <input
          type="hidden"
          name="NumberOfClasses"
          bind:value={numberOfClasses[0]} />

        <FieldControl title="Default line width">
          <div slot="help">
            The default line width in <b>line</b> vector layer legend tab.
          </div>
          <div slot="control">
            <div class="control">
              <RangeSlider
                bind:values={lineWidth}
                float
                min={0}
                max={10}
                step={0.5}
                pips
                springValues={{
                  stiffness: 1,
                  damping: 1,
                }}
                first="label"
                last="label"
                rest={false} />
            </div>
          </div>
        </FieldControl>

        <input
          type="hidden"
          name="LineWidth"
          bind:value={lineWidth[0]} />
      </section>
      <div class="field is-grouped is-grouped-centered">
        <div class="control">
          <button
            formaction="?/save"
            type="submit"
            class="button is-primary {isSubmitting ? 'is-loading' : ''}">
            Submit
          </button>
        </div>
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
