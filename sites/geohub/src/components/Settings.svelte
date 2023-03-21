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
  let sideBarPosition: SidebarPosition = userSettings.SidebarPosition
  let lineWidth = [userSettings.LineWidth]
  let numberOfClasses = [userSettings.NumberOfClasses]

  let settingTabs = [
    {
      title: 'Home',
      hash: 'main',
    },
    {
      title: 'My data',
      hash: 'data',
    },
    {
      title: 'Maps',
      hash: 'maps',
    },
  ]
  const hash = $page.url.hash
  let activeTab = settingTabs[0]
  if (hash) {
    let tab = settingTabs.find((t) => `#${t.hash}` === hash)
    if (tab) {
      activeTab = tab
    }
  }
  let activeSettingTab = activeTab.title

  const DatasetLimitOptions = LimitOptions.includes(DefaultUserConfig.DatasetSearchLimit)
    ? LimitOptions
    : [...LimitOptions, DefaultUserConfig.DatasetSearchLimit].sort((a, b) => a - b)

  const resetToDefault = () => {
    userSettings = JSON.parse(JSON.stringify(DefaultUserConfig))

    sideBarPosition = userSettings.SidebarPosition
    lineWidth = [userSettings.LineWidth]
    numberOfClasses = [userSettings.NumberOfClasses]

    toast.push('Settings were reset. Please click apply button to save them.')
  }
</script>

<div class="columns is-one-quarter ml-auto mr-auto settings-page">
  <div class="column is-2">
    <aside class="menu">
      <p class="menu-label">Settings</p>
      <ul class="menu-list">
        {#each settingTabs as tab}
          <li>
            <a
              class={activeSettingTab === tab.title ? 'is-active' : ''}
              on:click={() => (activeSettingTab = tab.title)}
              href="#{tab.hash}">{tab.title}</a>
          </li>
        {/each}
      </ul>
    </aside>
  </div>
  <div class="column is-three-fifths m-auto">
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
      <section class="content {activeSettingTab !== settingTabs[0].title ? 'is-hidden' : ''}">
        <p class="title is-4">Map Settings</p>

        <FieldControl title="Sidebar Position">
          <div slot="help">Select sidebar position of main GeoHub page.</div>
          <div slot="control">
            <div class="columns is-mobile">
              <label class="column">
                <input
                  on:select={() => sideBarPosition === 'left'}
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
                  on:select={() => sideBarPosition === 'right'}
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

        <p class="title is-4">Search Settings</p>

        <FieldControl title="Default search Limit">
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

        <FieldControl title="Default search query operator">
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

        <FieldControl title="Default sort setting">
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

        <FieldControl title="Defaut tag search operator">
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
      </section>
      <section class="content {activeSettingTab !== settingTabs[1].title ? 'is-hidden' : ''}">
        <p class="title is-4">Search Settings</p>

        <FieldControl title="Default search Limit">
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

        <FieldControl title="Default search query operator">
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

        <FieldControl title="Defaut tag search operator">
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

        <FieldControl title="Default sort setting">
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
      </section>

      <section class="content {activeSettingTab !== settingTabs[2].title ? 'is-hidden' : ''}">
        <p class="title is-4">Search Settings</p>

        <FieldControl title="Default search Limit">
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

        <FieldControl title="Default sort setting">
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
      <div class="field is-grouped is-grouped-centered">
        <div class="control">
          <button
            type="button"
            disabled={isSubmitting}
            class="button is-link"
            on:click={resetToDefault}>
            Reset to default
          </button>
          <button
            formaction="?/save"
            type="submit"
            class="button is-primary {isSubmitting ? 'is-loading' : ''}">
            Apply
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
