<script lang="ts" context="module">
  const modules = import.meta.glob('./*.svelte')

  let pages = []
  for (let page in modules) {
    console.log(page)
    let path = page.replace('.svelte', '').replace('./', '/')
    pages.push({
      title: path.substring(page.lastIndexOf('/')),
      link: `dashboards${path.includes('index') ? path.replace('index', '') : path}`,
    })
  }
</script>

<script lang="ts">
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import Header from '../../dashboards/components/Header.svelte'
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import { Label } from '@smui/common'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'
  import Fa from 'svelte-fa'

  let layouts = ['Grid', 'List']
  let selectedLayout = 'Grid'
</script>

<Header>Dashboards</Header>
<div
  style="display: flex; align-items: center; justify-content: space-between; padding-left: 20px; padding-right: 20px; padding-top: 20px">
  <div>
    <div class="field has-addons">
      <div class="control">
        <input class="input" type="text" placeholder="Find a repository" />
      </div>
      <div class="control">
        <a class="button is-info"> Search </a>
      </div>
    </div>
  </div>
  <div>
    <SegmentedButton segments={layouts} let:segment singleSelect bind:selected={selectedLayout}>
      <!-- Note: the `segment` property is required! -->
      <Segment {segment}>
        <Label>
          {#if segment === 'Grid'}{:else if selectedLayout === 'List'}
            <Fa icon={faList} size="1x" />
          {/if}
          {segment}
        </Label>
      </Segment>
    </SegmentedButton>
  </div>
</div>
{#if selectedLayout === 'Grid'}
  <div class="body-div">
    {#each pages as page}
      <DashboardCard title={page.title} link={page.link} />
    {/each}
  </div>
{:else}
  Selected Layout is List
{/if}

<style>
  .body-div {
    padding: 20px;
    height: 100vh;
    width: 100%;
    display: flex;
  }
  @media (max-width: 600px) {
    .body-div {
      display: block;
    }
  }
</style>
