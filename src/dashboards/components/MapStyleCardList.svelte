<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'

  const url: URL = $page.url

  let styleList
  let totalItemsCount = -1
  let defaultPage = 1
  let defaultPageSize = 8

  let totalPagesCount

  onMount(async () => {
    const res = await fetch(`${url.origin}/style/count`)
    const json = await res.json()
    totalItemsCount = json.count
    totalPagesCount = Math.ceil(totalItemsCount / defaultPageSize)
    await updateStylePage(defaultPage, defaultPageSize)
  })

  const updateStylePage = async (page: number, pageSize: number) => {
    const offset = page * pageSize - pageSize
    const res = await fetch(`${url.origin}/style?limit=${pageSize}&offset=${offset}`)
    styleList = await res.json()
  }

  const handlePreviousClick = () => {
    if (defaultPage > 1) {
      defaultPage--
      updateStylePage(defaultPage, defaultPageSize)
    }
  }

  const handleNextClick = () => {
    if (defaultPage < totalPagesCount) {
      defaultPage++
      updateStylePage(defaultPage, defaultPageSize)
    }
  }
</script>

{#if styleList && styleList.length > 0}
  <div style="width: fit-content; margin:auto;">
    <h3>Saved Map Styles</h3>
  </div>

  <div class="content-card-container" style="margin-left: 10%; margin-right: 10%; margin-top: 5%; margin-bottom: 5%;">
    <div class="grid-x grid-margin-x small-up-1 medium-up-2 large-up-4 content-card-wrapper">
      {#each styleList as style}
        <DashboardMapStyleCard {style} />
      {/each}
    </div>
  </div>
  {#if totalItemsCount > 1}
    <hr />
    <div style="width:max-content; margin: 0 auto">
      <nav style="margin-left:auto;" class="pagination" aria-label="Pagination" role="navigation">
        <ul>
          <li class={defaultPage === totalPagesCount ? '' : 'disabled'} aria-disabled={defaultPage === totalPagesCount}>
            <a href="#" on:click={handlePreviousClick} role="button" aria-current="true" aria-label="Previous">
              Previous
            </a>
          </li>
          <li>
            Page
            <span><a href="#" aria-label={defaultPage}>{defaultPage}</a></span>
            of
            <span><a href="#" aria-label={totalPagesCount}>{totalPagesCount}</a></span>
          </li>
          <li class={defaultPage === totalPagesCount ? 'disabled' : ''}>
            <a href="#" on:click={handleNextClick} aria-label="Next">Next</a>
          </li>
        </ul>
      </nav>
    </div>
    <br />
  {/if}
{/if}

<style lang="scss">
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/undp-design/pagination.min';
</style>
