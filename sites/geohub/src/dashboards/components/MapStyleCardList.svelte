<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'
  import type { StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'

  const url: URL = $page.url

  let styleList
  let links: StacLink[]

  let previoustLink: StacLink
  let nextLink: StacLink

  onMount(async () => {
    await updateStylePage('next')
  })

  const updateStylePage = async (type: 'next' | 'previous') => {
    // const offset = page * pageSize - pageSize
    let apiUrl = `${url.origin}/api/style`
    const link = links?.find((l) => l.rel === type)
    if (link) {
      apiUrl = link.href
    }
    const res = await fetch(apiUrl)
    const json = await res.json()
    styleList = json.styles
    links = json.links
    previoustLink = links?.find((l) => l.rel === 'previous')
    nextLink = links?.find((l) => l.rel === 'next')
    console.log(previoustLink, nextLink)
  }

  const handlePreviousClick = async () => {
    await updateStylePage('previous')
  }

  const handleNextClick = async () => {
    await updateStylePage('next')
  }
</script>

<div style="width: fit-content; margin:auto;">
  <h3>Saved Map Styles</h3>
</div>
{#if styleList && styleList.length > 0}
  <div
    class="content-card-container"
    style="margin-left: 10%; margin-right: 10%; margin-top: 5%; margin-bottom: 5%;">
    <div class="grid-x grid-margin-x small-up-1 medium-up-2 large-up-4 content-card-wrapper">
      {#key styleList}
        {#each styleList as style}
          <DashboardMapStyleCard {style} />
        {/each}
      {/key}
    </div>
  </div>
  {#if previoustLink || nextLink}
    <hr />
    <div style="width:max-content; margin: 0 auto">
      <nav
        style="margin-left:auto;"
        class="pagination"
        aria-label="Pagination"
        role="navigation">
        <ul>
          <li
            class={!previoustLink ? 'disabled' : ''}
            aria-disabled={!previoustLink}>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              on:click={handlePreviousClick}
              role="button"
              aria-current="true"
              aria-label="Previous">
              Previous
            </a>
          </li>
          <li class={!nextLink ? 'disabled' : ''}>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              on:click={handleNextClick}
              aria-label="Next">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  {/if}
{:else}
  <Notification type="info">No style saved</Notification>
{/if}

<style lang="scss">
  @use 'src/styles/undp-design/base-minimal.min';
  @use 'src/styles/undp-design/pagination.min';
</style>
