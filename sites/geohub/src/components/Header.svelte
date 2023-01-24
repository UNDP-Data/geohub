<script lang="ts">
  import { page } from '$app/stores'
  import { Header } from '@undp-data/svelte-undp-design'
  import StyleShare from './StyleShare.svelte'
  import { indicatorProgress, layerList } from '$stores'
  import UserAccount from './UserAccount.svelte'
  import type { HeaderLink } from '@undp-data/svelte-undp-design/package/interfaces'

  export let drawerOpen = true
  export let height: number = undefined

  let isStyleShareVisible = false

  const isReadonly = $page.url.pathname === '/viewer'

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
    {
      id: 'header-link-dashboard',
      title: 'Go to dashboards',
      href: '/dashboards',
      icon: 'fa-solid fa-chalkboard-user pr-1',
    },
    {
      id: 'header-link-documentation',
      title: 'User guide',
      href: '/docs/index.html',
      icon: 'fa-regular fa-circle-question pr-1',
    },
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
</script>

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
    <StyleShare bind:isModalVisible={isStyleShareVisible} />

    <div class="menu-button">
      <UserAccount />
    </div>
  </div>
</Header>

<style lang="scss">
  :global(.menu-item) {
    margin: 0.75rem 2.75rem 0.75rem 0 !important;
  }

  // :global(.custom-button-mega) {
  //   margin: 0 0 0 1.6875rem !important;
  // }
</style>
