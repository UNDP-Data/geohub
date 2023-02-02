<script lang="ts">
  import { page } from '$app/stores'
  import { Header } from '@undp-data/svelte-undp-design'
  import StyleShare from './StyleShare.svelte'
  import { indicatorProgress, layerList } from '$stores'
  import UserAccount from './UserAccount.svelte'
  import type { HeaderLink } from '@undp-data/svelte-undp-design/package/interfaces'
  import { createHeaderLinks } from '$lib/helper'
  import type { StyleSpecification } from 'maplibre-gl'

  export let drawerOpen = true
  export let height: number = undefined

  let isStyleShareVisible = false

  const isReadonly = $page.data.readOnly

  $: showProgressBar = $indicatorProgress

  const shareLink = {
    id: 'header-link-styleshare',
    title: 'Save & share map',
    href: '#',
    icon: 'fa-solid fa-share pr-1',
    callback: (id) => {
      console.log(id)
      isStyleShareVisible = true
    },
  }

  let links: HeaderLink[] = [
    {
      id: 'header-link-sidebar',
      title: `${drawerOpen ? 'Close' : 'Open'} sidebar`,
      href: '#',
      icon: 'fa-solid fa-table-columns pr-1',
      callback: (id) => {
        const link = links.find((l) => l.id === id)
        if (drawerOpen) {
          drawerOpen = false
          link.title = 'Open sidebar'
        } else {
          drawerOpen = true
          link.title = 'Close sidebar'
        }
        initLinks()
      },
    },
    ...createHeaderLinks(['maps', 'dashboard', 'userguide']),
  ]

  let finalLink: HeaderLink[] = []

  const initLinks = () => {
    if (!isReadonly && $page.data.session && $layerList.length > 0) {
      finalLink = [links[0], shareLink, ...links.slice(1)]
    } else {
      finalLink = [...links]
    }
  }
  $: $layerList, initLinks()

  let style: StyleSpecification = $page.data?.style?.style
</script>

<svelte:head>
  <title>{style ? `${style.name} | GeoHub` : 'GeoHub | United Nations Development Programme'}</title>
</svelte:head>

<Header
  bind:height
  bind:showProgressBar
  region="UNDP's one stop shop for spatial data and analytics"
  siteTitle="GeoHub"
  url="https://geohub.data.undp.org"
  logoUrl="assets/undp-images/undp-logo-blue.svg"
  isPositionFixed={false}
  bind:links={finalLink}>
  <div slot="custom-button">
    <div class="menu-button">
      <UserAccount />
    </div>
  </div>
</Header>
<StyleShare bind:isModalVisible={isStyleShareVisible} />

<style lang="scss">
  :global(.menu-item) {
    margin: 0.75rem 1.75rem 0.75rem 0 !important;
  }

  // :global(.custom-button-mega) {
  //   margin: 0 0 0 1.6875rem !important;
  // }
</style>
